#from celery import shared_task
import math
import sora, sora.prediction
from sora.extra.chisquare import ChiSquare
from sora.extra import draw_ellipse
from sora.occultation import filter_negative_chord
import serializacao
from pathlib import Path
import os, io, base64, json, uuid
from zipfile import ZipFile
from astropy.time import Time, TimeDelta
import astropy.units as u
import numpy as np
import astropy
import matplotlib.pyplot as plt

_dirInputBsp = str(os.environ.get('SORA_BSP', Path.joinpath(Path.home(),'sora','bsp')))

print(f'checando existencia do diretorio de trabalho: {_dirInputBsp}')
if not Path(_dirInputBsp).exists():
    print(f'criou diretorio de trabalho: {_dirInputBsp}')
    Path(_dirInputBsp).mkdir(parents=True, exist_ok=True)

class SoraEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, astropy.time.core.Time):
            return obj.value
        elif isinstance(obj, ChiSquare):
            return obj.__dict__ 
        elif isinstance(obj, sora.LightCurve):
            return obj.__dict__
        return json.JSONEncoder.default(self, obj)

#@shared_task
def soma(a,b):
    return a+b

#@shared_task
def validateBody(bodyName, ephemName='horizons'):
    try:
        print(f'validateBody - {bodyName} e {ephemName}')
        body = sora.Body(name=bodyName, ephem=ephemName)
        return { 
            "validate": True, 
            "diameter": body.diameter.value if not math.isnan(body.diameter.value) else 0,
            "name": body.shortname.replace(body.__dict__["_shared_with"]["ephem"]["search_name"], "").strip()
        }
    except Exception as error:
        return { "validate": False, "error": str(error) }
        
def _formatBSPFileName(ephemName):
    if not Path(ephemName).exists():
        if not ephemName.endswith('.bsp'):
            ephemName=ephemName+'.bsp'
        if not ephemName.startswith(_dirInputBsp):
            ephemName=str(Path(_dirInputBsp).joinpath(ephemName))
    return ephemName

def _importBase64ZipFile(base64Content):
    content = io.BytesIO(base64.b64decode(base64Content))
    zip=ZipFile(content)
    resp = []
    for name in zip.namelist():
        if name.endswith('.bsp'):
            nameEphem = Path(name).stem
            _addEphemBspFile(nameEphem,zip.read(name))
            resp.append(nameEphem)
    return resp

def _addEphemBspFile(ephemName, ephemByteContentFile):
    ephemFileName = _formatBSPFileName(ephemName)
    ephemByteContentFile = bytearray(ephemByteContentFile)
    with open(ephemFileName, 'wb') as file:
        file.write(ephemByteContentFile)
        
#@shared_task        
def validateBodyZipEphem(bodyName, ephemBase64ZipContent):
    try:
        ephemFiles = _importBase64ZipFile(ephemBase64ZipContent)
        ephemFullNameFiles = []
        for ephemFile in ephemFiles:
            ephemFullNameFiles.append(_formatBSPFileName(ephemFile))
        body = sora.Body(name=bodyName, ephem=ephemFullNameFiles)
        return { 
            "validate": True, 
            "diameter": body.diameter.value if not math.isnan(body.diameter.value) else 0 ,
            "name": body.shortname.replace(body.__dict__["_shared_with"]["ephem"]["search_name"], "").strip()
        }
    except Exception as error:
        return { "validate": False, "error": str(error) }

#@shared_task
def prediction(time_beg, time_end, body, ephem, mag_lim, catalogue, step, divs, sigma, radius, reference_center):
    ephemFullNameFiles = []
    if(len(ephem) > 10):
        ephemFiles = _importBase64ZipFile(ephem)
        for ephemFile in ephemFiles:
            ephemFullNameFiles.append(_formatBSPFileName(ephemFile))
    b = sora.Body(name=body, ephem=ephem if(len(ephem) < 10) else ephemFullNameFiles)
    pred = sora.prediction.prediction(time_beg=time_beg,
                    time_end=time_end,
                    body=b,
                    mag_lim=mag_lim,
                    catalogue=catalogue,
                    step=step, 
                    divs=divs,
                    sigma=sigma,
                    radius=radius,
                    reference_center=reference_center,
                    verbose=False)
    resp = []
    for i in range(0, len(pred)):
        r = pred[i]
        content = str(base64.b64encode(bytes(serializacao.serializar_pred_row(pred,r),'utf-8')),'utf-8')
        resp.append(
            {
                "epoch": str(r['Epoch']),
                "vel": float(r['Vel']),
                "dist": float(r['Dist']),
                "id": str(r['Gaia-EDR3 Source ID']),
                "G": r['G'],
                "content": content,
                "image": _plot_map_prediction(content)
            })
    return resp

def _plot_map_prediction(objBase64):
    pred = serializacao.deserializar_pred(str(base64.b64decode(bytes(objBase64,'utf-8')),'utf-8'))
    guid =  str(uuid.uuid4())
    if not os.path.exists('mapas'):
        os.mkdir('mapas')
    caminho = 'mapas/'+guid
    pred.plot_occ_map(nameimg=caminho)
    caminho = caminho+'.png'
    
    with open(caminho, "rb") as image_file:
        encoded_string = str(base64.b64encode(image_file.read()),'utf-8')
    os.remove(caminho)
    return encoded_string

def light_curve_plot(name, exptime, inputData, date, attrib, operations):
    #https://sora.readthedocs.io/guidelines/lightcurve.html
    dtReference = None if date['JD'] else date['dtReference']
    usecols = [inputData['time'],inputData['flux'],inputData['error']] if inputData['error'] else [inputData['time'],inputData['flux']]
    guid =  str(uuid.uuid4())
    if not os.path.exists('mapas'):
        os.mkdir('mapas')
    fileName = 'mapas/'+guid+'.dat'
    byteContent = base64.b64decode(bytes(inputData["file"],'utf-8'))
    with open(fileName, "wb") as flux_file:
        flux_file.write(byteContent)
    if dtReference:
        lc = sora.LightCurve(name=name, file=fileName, usecols=usecols, exptime=exptime, tref=dtReference)
    else:
        lc = sora.LightCurve(name=name, file=fileName, usecols=usecols, exptime=exptime)
    os.remove(fileName)
    if attrib['velocity']:
       lc.set_vel(vel=attrib['velocity'])
    if attrib['distance']:
       lc.set_dist(dist=attrib['distance'])
    if attrib['diameter']:
       lc.set_star_diam(d_star=attrib['diameter'])
    mask_min = mask_max = None
    for op in operations:
        if op['name']=='magnitude':
            mag_obj=op['params']['mag_obj'] if op['params']['mag_obj'] else 0
            mag_star=op['params']['mag_star'] if op['params']['mag_star'] else 0
            print(f'calc_magnitude_drop({mag_obj}, {mag_star})')
            lc.calc_magnitude_drop(mag_obj=mag_obj, mag_star=mag_star)
        if op['name']=='normalize':
            mask_min=np.double(op['params']['mask_min']) if op['params']['mask_min'] else None
            mask_max=np.double(op['params']['mask_max']) if op['params']['mask_max'] else None
            kwargs = {
                'poly_deg': int(op['params']['poly_deg']) if op['params']['poly_deg'] else None,
                'mask': (lc.time < mask_min) + (lc.time > mask_max),
                'plot': False
            }
            if 'flux_min' in op['params'] and op['params']['flux_min']:
                kwargs['flux_min'] = np.double(op['params']['flux_min'])
            if 'flux_max' in op['params'] and op['params']['flux_max']:
                kwargs['flux_max'] = np.double(op['params']['flux_max'])
            lc.normalize(**kwargs)
    
    lc.plot_lc()
    title = 'Light Curve plot'
    if mask_min and mask_max:
        plt.axvline(mask_min)
        plt.axvline(mask_max)
        title = 'Light Curve Normalized'
    image = __plotAsBase64('.png', title=title)
    return {
        "light_curve": json.dumps(lc, cls=SoraEncoder),
        "initial_time": mask_min if mask_min else (lc._initial_time - lc._tref).sec,
        "end_time": mask_max if mask_max else (lc._end_time - lc._tref).sec,
        "image": image
    }

def __to_time(dict, attrs):
    for attr in attrs:
        if attr['key'] in dict and dict[attr['key']]:
            if 'kwargs' in attr :
                dict[attr['key']] = Time(dict[attr['key']], **attr['kwargs'])
            else:
                dict[attr['key']] = Time(dict[attr['key']])

def __to_np_array(dict, keys):
    for key in keys:
        if key in dict and dict[key]:
            dict[key] = np.array(dict[key])

def __light_curve_from_json(lc_json):
    lc = sora.LightCurve(name='temp',initial_time='2017-06-22 21:25:13', end_time='2017-06-22 21:25:14')
    dict = json.loads(lc_json)
    kwargs = {'kwargs': {'format': 'jd'}}

    try:
        Time(dict['_initial_time'], format='jd')
    except:
        kwargs = {}

    __to_time(dict, [
        {'key':'_tref'},
        {'key':'_initial_time', **kwargs},
        {'key':'_end_time', **kwargs},
        {'key':'_immersion'},
        {'key':'_emersion'},
        {'key':'_time', **kwargs}
    ])
    __to_np_array(dict, ['time_model', 'flux', 'dflux', 'flux_obs', 'normalizer_flux', 
        'normalizer_mask', 'model', 'model_star', 'model_fresnel', 'model_geometric', 'lc_sigma'])
    lc.__dict__ = dict
    if 'chisquare' in dict:
        lc.chisquare = __chi2_from_json(dict['chisquare'])
    return lc

def __chi2_from_json(chi2_json):
    chi2 = ChiSquare([], 0)
    __to_np_array(chi2_json['data'], chi2_json['_names'])
    chi2.__dict__ = chi2_json
    return chi2
    
def light_curve_detect(lc_json, params):
    maximum_duration=params['maximum_duration'] if params['maximum_duration'] else None
    dur_step=params['dur_step'] if params['dur_step'] else None
    snr_limit=params['snr_limit'] if params['snr_limit'] else None
    n_detections=params['n_detections'] if params['n_detections'] else None

    lc = __light_curve_from_json(lc_json)
    detect = lc.occ_detect(maximum_duration, dur_step, snr_limit, n_detections, True)
    image = __plotAsBase64('.png', title='Detected Occultation')

    immersion = TimeDelta(detect['immersion_time'], format='sec') + lc._tref if 'immersion_time' in detect else None
    emersion = TimeDelta(detect['emersion_time'], format='sec') + lc._tref if 'emersion_time' in detect else None
    
    #só calcular se lc.(_initial/_end)_time for min/max do lc._time
    if immersion and emersion:
        delta = (emersion - immersion) / 2
        init_time = immersion - delta
        end_time = emersion + delta
    elif immersion: 
        delta = (immersion - lc._initial_time) / 2
        init_time = immersion - delta
        end_time = immersion + delta
    elif emersion:
        delta = (lc._end_time - emersion) / 2
        init_time = emersion - delta
        end_time = emersion + delta

    return {
        "immersion_time": detect['immersion_time'].tolist(),
        "emersion_time": detect['emersion_time'].tolist(),
        ### Não tenho certeza se deveria fazer esses calculos e enviar esses valores ###
        "initial_time": ((init_time - lc._tref).sec).tolist(),
        "end_time": ((end_time - lc._tref).sec).tolist(),
        ###
        "image": image,
        "rank": detect['rank'] if isinstance(detect['rank'], int) else detect['rank'].tolist()
    }

def light_curve_occ_lcfit(lc_json, params):
    lc = __light_curve_from_json(lc_json)
    kwargs = {
        "loop": params['loop'] if params['loop'] else 2000,
        "flux_min": params['flux_min'] if params['flux_min'] else 0,
        "flux_max": params['flux_max'] if params['flux_max'] else 1,
        "delta_t": params['delta_t'] if params['delta_t'] else lc.exptime * 5,
    }
    if 'tmin' in params and params['tmin']:
        kwargs['tmin'] = params['tmin']
    if 'tmax' in params and params['tmax']:
        kwargs['tmax'] = params['tmax']
    if 'immersion_time' in params and params['immersion_time']:
        kwargs['immersion_time'] = params['immersion_time']
    if 'emersion_time' in params and params['emersion_time']:
        kwargs['emersion_time'] = params['emersion_time']
    if 'opacity' in params and params['opacity']:
        kwargs['opacity'] = params['opacity']
    if 'dopacity' in params and params['dopacity']:
        kwargs['dopacity'] = params['dopacity']
    if 'sigma_result' in params and params['sigma_result']:
        kwargs['sigma_result'] = params['sigma_result']
    if 'sigma' in params and params['sigma']:
        kwargs['sigma'] = params['sigma']

    if 'tmin' in params and params['tmin'] and 'immersion_time' in params and params['immersion_time'] and params['immersion_time'] < params['tmin']:
        del kwargs['immersion_time']
    if 'tmax' in params and params['tmax'] and 'immersion_time' in params and params['immersion_time'] and params['immersion_time'] > params['tmax']:
        del kwargs['immersion_time']
    if 'tmin' in params and params['tmin'] and 'emersion_time' in params and params['emersion_time'] and params['emersion_time'] < params['tmin']:
        del kwargs['emersion_time']
    if 'tmax' in params and params['tmax'] and 'emersion_time' in params and params['emersion_time'] and params['emersion_time'] > params['tmax']:
        del kwargs['emersion_time']
    chi2 = lc.occ_lcfit(**kwargs)
    lc.plot_lc()
    image = __plotAsBase64('.png', title='Light Curve Fitted')
    
    return {
        "light_curve": json.dumps(lc, cls=SoraEncoder),
        "chi_square": json.dumps(chi2, cls=SoraEncoder),
        "image": image
    }
    
def light_curve_chi2_image(chi2_json):
    result = { 
        "immersion": None, 
        "emersion": None,
        "opacity": None,
    }
    result.update(__plot_chi2(chi2_json))
    return result

def __model_light_curve(lc, model_type, minx, maxx):
    lc.plot_lc()
    lc.plot_model()
    plt.xlim(minx, maxx)
    return __plotAsBase64(f'{model_type}.png', title=model_type)

def light_curve_model_image(lc_json):
    lc = __light_curve_from_json(lc_json)
    full_model = immersion_model = emersion_model = None
    if '_immersion' in lc.__dict__ and '_emersion' in lc.__dict__:
        delta = (lc.emersion - lc.immersion) / 2
        full_model = __model_light_curve(lc, 'Model', (lc.immersion - delta - lc._tref).sec, (lc.emersion + delta - lc._tref).sec)
    if '_immersion' in lc.__dict__:
        immersion = lc.chisquare.data['immersion']
        delta = (immersion.max() - immersion.min()) * 0.7
        immersion_model = __model_light_curve(lc, 'Immersion Model', (lc.immersion - lc._tref).sec - delta, (lc.immersion - lc._tref).sec + delta)
    if '_emersion' in lc.__dict__:
        emersion = lc.chisquare.data['emersion']
        delta = (emersion.max() - emersion.min()) * 0.7
        emersion_model = __model_light_curve(lc, 'Emersion Model', (lc.emersion - lc._tref).sec - delta, (lc.emersion - lc._tref).sec + delta)
 
    return { 
        "full_model": full_model,
        "immersion_model": immersion_model,
        "emersion_model": emersion_model
    }

def light_curve_results(lc_json):
    lc = __light_curve_from_json(lc_json)
    if not os.path.exists('mapas'):
        os.mkdir('mapas')
    guid =  str(uuid.uuid4())
    filename = f'{guid}_result.dat'
    lc.to_file(f'mapas/{filename}')

    return { 
        "txt_result": str(lc),
        "file1" : __readFileAsBase64(f'mapas/model_{filename}'),
        "file2" : __readFileAsBase64(f'mapas/model_{filename}.label'),
        "file3" : __readFileAsBase64(f'mapas/{filename}'),
        "file4" : __readFileAsBase64(f'mapas/{filename}.label')
    }

def star_calculate_diameter(catalogue, code, epoch, radVel, nomad, bjones, cgaudin, da_cosdec, ddec, mode, starType, band, V, B, K, G, distance):
    star = sora.Star(catalogue=catalogue, code=code, epoch=epoch, rad_vel=radVel, nomad=nomad, bjones=bjones, cgaudin=cgaudin)
    kwargs = {
        'mode': mode,
        'verbose': False
    }
    if starType is not None:
        kwargs['star_type'] = starType
    if band == 'V':
        star.set_magnitude(K=K, V=V)
        kwargs['band'] = 'V'
    elif band == 'B':
        star.set_magnitude(K=K, B=B)
        kwargs['band'] = 'B'
    
    if mode == 'kervella' or mode == 'van_belle':
        star.set_magnitude(G=G)

    if da_cosdec is not None and ddec is not None:
        star.add_offset(da_cosdec, ddec)
    diameter = star.apparent_diameter(distance, **kwargs)
    return { 
        "diameter": str(diameter),
    }

def star_magnitudes(code, catalog, nomad, bjones, cgaudin):
    star = sora.Star(code=code, catalogue=catalog, nomad=nomad, bjones=bjones, cgaudin=cgaudin)
    return star.mag

def __readFileAsBase64(path):
    with open(path, "rb") as file:
        data = str(base64.b64encode(file.read()),'utf-8')
    os.remove(path)
    return data

def __plotAsBase64(fileName, **kwargs):
    if not os.path.exists('mapas'):
        os.mkdir('mapas')
    guid =  str(uuid.uuid4())
    path = f'mapas/{guid}_{fileName}'
    if 'title' in kwargs:
        plt.title(kwargs['title'], fontsize=22)
    plt.savefig(path)
    plt.close()
    return __readFileAsBase64(path)

def __filter_key_with_none_value(dict):
    return {k:v for k, v in dict.items() if v}

def __occultation_from_json(occ_json):
    kwargs = __filter_key_with_none_value(occ_json['star'])
    star = sora.Star(**kwargs)
    
    if 'ephem_zip' in occ_json['body'] and occ_json['body']['ephem_zip']:
        files = _importBase64ZipFile(occ_json['body']['ephem_zip'])
        ephem = []
        for file in files:
            ephem.append(_formatBSPFileName(file))
    else:
        ephem = occ_json['body']['ephem']
    body = sora.Body(name=occ_json['body']['name'], ephem=ephem)
    occ = sora.Occultation(star=star, body=body, time=occ_json['time'])
    if 'fitted_occ' in occ_json:
        __to_np_array(occ_json['fitted_occ']['chi2_params'], ['radial_dispersion', 'position_angle', 'radial_error'])
        occ.__dict__.update(occ_json['fitted_occ'])

    for chord_json in occ_json['chords']:
        obs = sora.Observer(**chord_json['observer'])
        lc = sora.LightCurve(**chord_json['light_curve'])
        if 'time_shift' in chord_json and chord_json["time_shift"]:
            lc.dt = chord_json['time_shift']
        chord = occ.chords.add_chord(name=chord_json['name'], observer=obs, lightcurve=lc)
        chord.color = f'#{chord_json["color"]}'
    return occ

def occultation_plot(occ_json, chi2_json, params):
    occ = __occultation_from_json(occ_json)
    chi2 = None
    if chi2_json:
        chi2 = __chi2_from_json(json.loads(chi2_json))
    __plot_occultation(occ, chi2, **params)
    return {
        'plot': __plotAsBase64(fileName='chords.png')
    }

def __plot_occultation(occ, chi2=None, **kwargs):
    for name in occ.chords:
        chord = occ.chords[name]
        lc = chord.lightcurve
        segment = 'positive' if '_immersion' in lc.__dict__ and '_emersion' in lc.__dict__ else 'negative'
        if 'segments' not in kwargs or segment in kwargs.get('segments'):
            chord.plot_chord(segment=segment, color=chord.color)

    if 'segments' not in kwargs or 'error' in kwargs.get('segments'):
        occ.chords.plot_chords(segment='error', color='red')

    min_x = kwargs.get('minX', None)
    max_x = kwargs.get('maxX', None)
    min_y = kwargs.get('minY', None)
    max_y = kwargs.get('maxY', None)
    if chi2:
        chi2_values = chi2.get_values()
        delta = chi2_values['equatorial_radius'] * 2
        draw_ellipse(**chi2_values)
        plot_shadow = kwargs.get('allEllipses', True)
        if plot_shadow:
            draw_ellipse(**chi2.get_values(sigma=3), alpha=1.0, lw=1)
        if not min_x:
            center_f = chi2_values['center_f']
            min_x = center_f - delta
        if not max_x:
            center_f = chi2_values['center_f']
            max_x = center_f + delta
        if not min_y:
            center_g = chi2_values['center_g']
            min_y = center_g - delta
        if not max_y:
            center_g = chi2_values['center_g']
            max_y = center_g + delta

    loc = kwargs.get('legendLocation', 'upper right')
    plt.legend(labels=list(occ.chords.keys()), loc=loc)
    if min_x and max_x:
        plt.xlim(min_x, max_x)
    if min_y and max_y:
        plt.ylim(min_y, max_y)

def occultation_fit_ellipse(occ_json, params):
    occ = __occultation_from_json(occ_json)

    kwargs = {
        'center_f': params['centerF'],
        'center_g': params['centerG'],
        'equatorial_radius': params['equatorialRadius'],
        'oblateness': params['oblateness'],
        'position_angle': params['positionAngle']
    }

    if 'dCenterF' in params and params['dCenterF']:
        kwargs['dcenter_f'] = params['dCenterF']
    if 'dCenterG' in params and params['dCenterG']:
        kwargs['dcenter_g'] = params['dCenterG']
    if 'dEquatorialRadius' in params and params['dEquatorialRadius']:
        kwargs['dequatorial_radius'] = params['dEquatorialRadius']
    if 'dOblateness' in params and params['dOblateness']:
        kwargs['doblateness'] = params['dOblateness']
    if 'dPositionAngle' in params and params['dPositionAngle']:
        kwargs['dposition_angle'] = params['dPositionAngle']
    if 'loop' in params and params['loop']:
        kwargs['loop'] = params['loop']
    if 'dChiMin' in params and params['dChiMin']:
        kwargs['dchi_min'] = params['dChiMin']
    if 'numberChi' in params and params['numberChi']:
        kwargs['number_chi'] = params['numberChi']
    if 'ellipseError' in params and params['ellipseError']:
        kwargs['ellipse_error'] = params['ellipseError']
    if 'sigmaResult' in params and params['sigmaResult']:
        kwargs['sigma_result'] = params['sigmaResult']

    chi2 = occ.fit_ellipse(**kwargs)
    __plot_occultation(occ, chi2, **params)
    return {
        'ellipse': __plotAsBase64(fileName='chords.png'),
        'chi_square': json.dumps(chi2, cls=SoraEncoder),
        'fitted_occ': json.dumps({
            'fitted_params': occ.fitted_params,
            'chi2_params': occ.chi2_params
        }, cls=SoraEncoder)
    }

def __plot_chi2(chi2_json):
    result = dict()
    chi2 = __chi2_from_json(json.loads(chi2_json))

    for k in chi2.data.keys():
        if not k == 'chi2':
            chi2.plot_chi2(key=k)
            result.update({k: __plotAsBase64(f'{k}.png')})
    return result

def occultation_ellipse_chi2_image(chi2_json):
    return __plot_chi2(chi2_json)

def occultation_filter_negative_chord(occ_json, chi2_json, params):
    occ = __occultation_from_json(occ_json)
    chi2 = __chi2_from_json(json.loads(chi2_json))
    chord = occ.chords[params['negativeChord']]
    filter_chi2 = filter_negative_chord(chord, chi2, params['step'])
    __plot_occultation(occ, filter_chi2, **params)
    return {
        'ellipse': __plotAsBase64(fileName='chords.png'),
        'chi_square': json.dumps(filter_chi2, cls=SoraEncoder),
        'fitted_occ': json.dumps({
            'fitted_params': occ.fitted_params,
            'chi2_params': occ.chi2_params
        }, cls=SoraEncoder)
    }

def ellipse_result(occ_json):
    occ = __occultation_from_json(occ_json)
    return str(occ)