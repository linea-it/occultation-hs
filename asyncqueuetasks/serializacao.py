import collections, sora, astropy, re

def serializar_pred(pred):
    linhas = len(pred)
    colunas = len(pred.dtype)

    linha = ''
    for key in pred.meta:
        linha += ';' + key + '=' + str(pred.meta[key])

    conteudo = linha.strip(';')+'\n'
	 
    linha = pred.dtype.names[0]+':'+pred.dtype[0].str.strip('|')
    for c in range(1,colunas):
        linha = linha+'; '+pred.dtype.names[c]+':'+pred.dtype[c].str.strip('|')
  
    conteudo += linha+'\n';
    for l in range(0,linhas):
       linha = str(pred[l][0]).replace('\n','')
       for c in range(1,colunas):
            linha = linha+'; '+str(pred[l][c]).replace('\n','')
            
       conteudo = conteudo + linha + '\n' 
    return conteudo

def serializar_pred_row(pred, r):
    linhas = len(pred)
    colunas = len(pred.dtype)

    linha = ''
    for key in pred.meta:
        linha += ';' + key + '=' + str(pred.meta[key])

    conteudo = linha.strip(';')+'\n'
	 
    linha = pred.dtype.names[0]+':'+pred.dtype[0].str.strip('|')
    for c in range(1,colunas):
        linha = linha+'; '+pred.dtype.names[c]+':'+pred.dtype[c].str.strip('|')
  
    conteudo += linha+'\n';
    linha = str(r[0]).replace('\n','')
    for c in range(1,colunas):
        linha = linha+'; '+str(r[c]).replace('\n','')
    conteudo = conteudo + linha + '\n' 

    return conteudo

def deserializar_pred(strpred):
    metaDados = {}
    colunas = []
    tipos = []
    
    strpred = strpred.strip()
    strLinhas = strpred.split('\n')
    
    for coluna in strLinhas[0].split(';'):
        campos = coluna.split('=')
        metaDados[campos[0]] = campos[1].strip()
    metaDados['maglim'] = int(metaDados['maglim'])
    metaDados['radius'] = float(metaDados['radius'])
    metaDados['error_ra'] = float(metaDados['error_ra'])
    metaDados['error_dec'] = float(metaDados['error_dec'])
    
    for coluna in strLinhas[1].split(';'):
        campos = coluna.split(':')
        colunas.append(campos[0].strip())
        tipos.append(campos[1].strip())

    pred = sora.prediction.table.PredictionTable(names=tuple(colunas), dtype = tuple(tipos))
    pred.meta = collections.OrderedDict(metaDados)
    linhas = len(strLinhas)
    for i in range(2,linhas):
        if len(strLinhas[i].strip())>0:
            valores = strLinhas[i].split(';')
            hora = astropy.time.core.Time(valores[0], format='iso', scale='utc')
            coord1 = astropy.coordinates.SkyCoord(frame='icrs',ra=float(re.search('\s*\((-?\d+\.\d+),', valores[1]).group(1))*astropy.units.deg, dec=float(re.search(',\s*(-?\d+\.\d+)\)', valores[1]).group(1))*astropy.units.deg)
            coord2 = astropy.coordinates.SkyCoord(frame='icrs',ra=float(re.search('\s*\((-?\d+\.\d+),', valores[2]).group(1))*astropy.units.deg, dec=float(re.search(',\s*(-?\d+\.\d+),', valores[2]).group(1))*astropy.units.deg, distance = float(re.search(',\s*(-?\d+.\d+(e\+\d+)?)\)', valores[2]).group(1))*astropy.units.AU)
            for j in range(0,len(valores)):
                if 'f' in tipos[j]:
                    valores[j] = float(valores[j])
                elif 'i' in tipos[j]:
                    valores[j] = int(valores[j])
                elif not 'o' in tipos[j]:
                    valores[j] = valores[j].strip()
            valores[0] = hora
            valores[1] = coord1
            valores[2] = coord2
            pred.add_row(valores)
    return pred
        
if __name__ == "__main__":
    from sora import Occultation, Body, Star, LightCurve, Observer
    from sora.prediction import prediction
    from sora.extra import draw_ellipse

    ## Other main packages
    from astropy.time import Time
    import astropy.units as u

    ## Usual packages
    import numpy as np
    import matplotlib.pylab as pl
    import os, base64, json, pandas
    from io import StringIO
    from sora.prediction.table import PredictionTable

    chariklo = Body(name='Chariklo',ephem='Horizons')
    pred = prediction(body=chariklo, time_beg='2017-06-20',time_end='2017-06-27',mag_lim=16)
    texto = serializar_pred(pred)
    #print(texto)

    novo = deserializar_pred(texto)
    #print(novo)
    
    novo[0].plot_occ_map(nameimg='mapas/pred_map1')
    novo[1].plot_occ_map(nameimg='mapas/pred_map2')