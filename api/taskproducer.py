import time,socket,json,uuid,os,base64,io

class TasksProducer:
    _LOCAL_IP_     = "127.0.0.1"
    _LOCAL_PORT_   = 15641
    _BUFFER_SIZE_  = 10240

    def __init__(self, model, user, project):
        self._user = user
        self._project = project
        self._model = model
        
        
    def __getName(self, func, taskName):
        if type(taskName) is list:
            taskName=taskName[0]
        if not (type(taskName) is str) or not taskName.startswith(func):
            taskName = f'{func}: {taskName}'
        return taskName

    def __sendMsg(self, msg):
        clientSocket = socket.socket(family=socket.AF_INET, type=socket.SOCK_STREAM)
        clientSocket.connect((self._LOCAL_IP_, self._LOCAL_PORT_))
        bytes = str.encode(msg,'utf-8')
        total = len(bytes)
        buffer = total.to_bytes(4,"little")
        clientSocket.sendall(buffer)
        clientSocket.sendall(bytes)
        buffer = clientSocket.recv(4)
        total = int.from_bytes(buffer,"little")
        msg = bytearray(0)
        while len(msg) < total:
            msg = msg + clientSocket.recv(self._BUFFER_SIZE_)            
        clientSocket.close()
        return msg        
        
    def __sendAsyncCommand(self, func, taskName, modelId, args):
        strArgs = json.dumps(args)
        msg = f'ASYNC#{func}#{strArgs}'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        idTask = resp['guidTask']
        if self._model!=None and self._user!=None and self._project!=None:
            job = self._model()
            job.user = self._user
            job.guidTask = idTask
            job.project = self._project
            job.name = self.__getName(func, taskName)
            job.params = strArgs
            job.modelId = modelId
            job.save()
        return job or idTask
    
    def __sendSyncCommand(self, func, args):
        strArgs = json.dumps(args)
        msg = f'SYNC#{func}#{strArgs}'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        if resp['status'] == 'ok':
            result = resp['result']
        elif resp['status'] == 'error':
            result = resp['result']
        else:
            result = resp['status']
        return result        

    def soma(self,a,b):
        return self.__sendAsyncCommand('soma', f'{a}+{b}=?', 0, [a,b])

    def validateBody(self, bodyName, ephemName='horizons'):
        r = self.__sendSyncCommand('validateBody',[bodyName, ephemName.replace('/JPL','')])
        return r
    
    def validateBodyZipEphem(self, bodyName, ephemBase64ZipContent):
        r = self.__sendSyncCommand('validateBodyZipEphem',[bodyName, ephemBase64ZipContent])
        return r
    
    def prediction(self, bodyId, time_beg, time_end, body=None, ephem=None, mag_lim=None, catalogue='gaiaedr3', step=60, divs=1, sigma=1, radius=None, reference_center='geocenter'):
        if type(ephem)==str:
            ephem=ephem.replace('/JPL','')
        jobName = f'{body} - {time_beg[:-5].replace("T", " ")} -> {time_end[:-5].replace("T", " ")}'
        return self.__sendAsyncCommand('prediction', jobName, bodyId, [time_beg, time_end, body, ephem, mag_lim, catalogue, step, divs, sigma, radius, reference_center])

    '''    def plot_map_prediction(self, strPrediction):
            resp = self.__sendSyncCommand('plot_map_prediction', [strPrediction])
            resp = bytes(resp, encoding= 'utf-8')
            return resp
    ''' 

    def light_curve_plot(self, lcId, name, exptime, inputData, date, attrib, operations):
        return self.__sendAsyncCommand('light_curve_plot', name, lcId, [name, exptime, inputData, date, attrib, operations])

    def light_curve_detect(self, lc_json, params):
        return self.__sendSyncCommand('light_curve_detect', [lc_json, params])

    def light_curve_occ_lcfit(self, lcId, lc_json, params):
        return self.__sendAsyncCommand('light_curve_occ_lcfit', '', lcId, [lc_json, params])

    def light_curve_chi2_image(self, lcId, chi2_json):
        return self.__sendAsyncCommand('light_curve_chi2_image', '', lcId, [chi2_json])

    def light_curve_model_image(self, lcId, lc_json):
        return self.__sendAsyncCommand('light_curve_model_image', '', lcId, [lc_json])

    def light_curve_results(self, lcId, lc_json):
        return self.__sendAsyncCommand('light_curve_results', '', lcId, [lc_json])

    def star_calculate_diameter(self, catalogue, code, epoch, radVel, nomad, bjones, cgaudin, da_cosdec, ddec, mode, starType, band, V, B, K, G, distance):
        return self.__sendSyncCommand('star_calculate_diameter', [catalogue, code, epoch, radVel, nomad, bjones, cgaudin, da_cosdec, ddec, mode, starType, band, V, B, K, G, distance])
        
    def star_magnitudes(self, code, catalog, nomad, bjones, cgaudin):
        return self.__sendSyncCommand('star_magnitudes', [code, catalog, nomad, bjones, cgaudin])

    def occultation_plot(self, predictionId, occ_json, chi2_json, params):
        return self.__sendAsyncCommand('occultation_plot', '', predictionId, [occ_json, chi2_json, params])

    def occultation_fit_ellipse(self, predictionId, occ_json, params):
        return self.__sendAsyncCommand('occultation_fit_ellipse', '', predictionId, [occ_json, params])

    def occultation_ellipse_chi2_image(self, predictionId, chi2_json):
        return self.__sendAsyncCommand('occultation_ellipse_chi2_image', '', predictionId, [chi2_json])

    def occultation_filter_negative_chord(self, predictionId, occ_json, chi2_json, params):
        return self.__sendAsyncCommand('occultation_filter_negative_chord', '', predictionId, [occ_json, chi2_json, params])

    def ellipse_result(self, occ_json):
        return self.__sendSyncCommand('ellipse_result', [occ_json])

    def tasksId(self):
        msg = f'CTRL#task-keys#'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        return resp

    def taskList(self):
        msg = f'CTRL#task-list#'
        msg = self.__sendMsg(msg)
        resp = [] 
        for x in json.loads(str(msg,'utf-8')):
            x['name'] = self.__getName(x['command'], x['params'])
            x['description'] = x['name']
            #del x['comando']
            #del x['params']
            x['guid'] = x['id']
            resp.append(x)
        return resp
    
    def removeTasks(self, guids):
        if len(guids) == 0:
            return { 'status': 'ok'}
        msg = f'CTRL#task-remove-any#{json.dumps(guids)}'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        return resp

    def removeTask(self, guid):
        msg = f'CTRL#task-remove#{guid}'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        return resp

    def cancelTasks(self, guids):
        msg = f'CTRL#task-cancel-any#{json.dumps(guids)}'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        return resp

    def cancelTask(self, guid):
        msg = f'CTRL#task-cancel#{guid}'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        return resp

    def reenqueueTask(self, guid):
        msg = f'CTRL#task-reenqueue#{guid}'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        return resp
        
    def status(self, idTask):
        msg = f'CTRL#task-status#{idTask}'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        return resp['status']

    def result(self, idTask):
        msg = f'CTRL#task-result#{idTask}'
        msg = self.__sendMsg(msg)
        resp = json.loads(str(msg,'utf-8'))
        if resp['status'] == 'ok':
            result = resp['result']
        elif resp['status'] == 'error':
            result = resp['message']
        else:
            result = resp['status']
        return result
    
    
    
def __esperaTarefa(t, idTarefa):
    strStatusLast = 'waiting'
    while (strStatusLast=='waiting' or strStatusLast=='running'):
        try:
            strStatusLast = t.status(idTarefa)
            if strStatusLast=='waiting' or strStatusLast=='running':
                time.sleep(5)
        except KeyboardInterrupt:
            os._exit(0)        

def __salvarImagem(obj, num):
    for field in obj:
        grafico = obj[field]
        try:
            bytes = base64.b64decode(grafico)
            if len(bytes)>1000:
                num = num + 1
                with open("img-"+str(num)+".png", "wb") as image_file:
                    image_file.write(bytes)
        except:
            pass
    return num

def __mostrarResultados(t):
    lista = t.taskList()
    num=0
    for task in lista:
        id = task['id']
        result = t.result(id)
        print(f'type result: {type(result)}')
        if t.status(id)=='error':
            print(f"Tarefa:{id} cmd:{task['command']} Error:{result[:100]}")
        elif result:
            print(f"Tarefa:{id} cmd:{task['command']} Result:{result[:100]}")
            result = json.loads(result)
            if type(result) == dict:
                num = __salvarImagem(result,num)
            elif type(result) == list:
                for obj in result:
                    num = __salvarImagem(obj,num)

if __name__ == '__main__':    
    
    guidsRemover=[]

    t = TasksProducer(None,None,None)

    lista = t.taskList()
    for x in lista:
        print(str(x)[:100])
        if t.status(x['guid'])!='Waiting':
            guidsRemover.append(x['guid'])
    
    print("remover tarefas")
    print(guidsRemover)
    t.removeTasks(guidsRemover)
    
    # with open('../insumos/SORA_guidelines/examples/input/bsp/Chariklo.zip', "rb") as image_file:
    #     contentFile = str(base64.b64encode(image_file.read()),'utf-8')
    # id1 = t.prediction(bodyId=1, body='Chariklo',ephem=contentFile,time_beg='2017-06-20',time_end='2017-06-27',mag_lim=16)

    id1 = t.prediction(bodyId=1, body='Chariklo',ephem='horizons',time_beg='2017-06-20',time_end='2017-06-27',mag_lim=16)
    #id1 = t.prediction('2017-06-20T01:01:01', '2017-06-27T01:01:01', 'chariklo', 'Horizons', 10, 'gaiaedr3', 60, 1, 1, 12, 'geocenter')
    #'2017-06-20T03:00:00.000Z', '2017-06-29T04:01:01.000Z', 'chariklo', 'Horizons', 10, 'gaiaedr3', 60, 1, 1, 12, 'geocenter'
    id2 = t.soma(4,100)
    
    with open('../insumos/SORA_guidelines/examples/input/lightcurves/lc_example.dat', "rb") as image_file:
        contentFile = str(base64.b64encode(image_file.read()),'utf-8')

    id3 = t.light_curve_plot(2,'testeLC',
                             0.100,
                             contentFile,
                             {"time":0, "flux":1,"error":None}, 
                             {"JD":True,"velocity":22.0,"distance":15,"diameter":0.2},
                             [
                                {
                                    "name":"magnitude",
                                    "params": {
                                            "mag_obj": 18.6,
                                            "mag_star": 14.3
                                    }
                                },
                                {
                                    "name":"normalize",
                                    "params": {
                                            "poly_deg": 1,
                                            "mask_min": 76875,
                                            "mask_max": 76900,
                                            "flux_min": 0,
                                            "flux_max": 1
                                    }
                                }
                            ]
    )
    id4 = t.light_curve_detect({"name":'testeLC',
                             "contateFile":contentFile,
                             "expTime":0.100,
                             "date":{"time":0, "flux":1, "error":None}}, 
                             {"maximum_duration":None,"dur_step":None,"snr_limit":None,"n_detections":None}
    )

    id5 = t.light_curve_occ_lcfit(4,{"name":'testeLC',
                             "contateFile":contentFile,
                             "expTime":0.100,
                             "date":{"time":0, "flux":1, "error":None}}, 
                             {"loop":1000}
    )

    __esperaTarefa(t, id5)

    if t.status(id5)!='error':
        resp = json.loads(t.result(id5))
        id6 = t.light_curve_chi2_image(5,resp['chi2'], resp['npts'], resp['immersion'], resp['emersion'])
        id7 = t.light_curve_model_image(6,resp['lightCurve'],76879.8,76880.8)
        __esperaTarefa(t, id7)

    __mostrarResultados(t)
    
    for x in t.tasksId():
        guidsRemover.append(x)

    print("remover tarefas")
    print(guidsRemover)
    t.removeTasks(guidsRemover)
    
    
    
    
    
