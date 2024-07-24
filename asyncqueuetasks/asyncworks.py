
import threading,queue,time,socket,json,uuid
import tasks as tarefas
import datetime


class Response:
    result=None
    _error=None
    def __init__(self, result, error):
        self.result=result
        self._error = error

    def HasSuccess(self):
        return self._error is None

    def HasError(self):
        return self._error is not None
    
    def getError(self):
        return self._error
    
class ResponseSuccess(Response):
    def __init__(self, result):
        super().__init__(result,None)
    
class ResponseError(Response):
    def __init__(self, error):
        super().__init__(str(error),error)
    
class ResponseErrorWithResult(Response):
    def __init__(self, result, error):
        super().__init__(result,str(error))

class Task:
    def __init__(self, command, params):
        self.id = str(uuid.uuid4())
        self.datetime = datetime.datetime.now().isoformat()
        self.status = 'waiting'
        self.command = command
        self.params = params
        self.result = ''
        self.message = ''
    def str(self):
        return '[' + str(self.id) + ' - ' + self.command+' ]'

class DeamonWorker:
    _LOCAL_IP_     = ""
    _LOCAL_PORT_   = 15641
    _BUFFER_SIZE_  = 10240
    
    __instance = None
    def __new__(cls,*args, **kwargs):
        if cls.__instance is not None:
            return cls.__instance
        else:
            inst = cls.__instance = super(DeamonWorker,cls).__new__(cls, *args, **kwargs)
            return inst
    
    def __init__(self):
        
        self.onStartServer = None
        self.onStopServer = None
        self.onNewTask = None
        self.onFinishTask = None
        self.onCancelTask = None
        self.onReenqueueTask = None
        self.onRemoveTask = None
        self.onStartTask = None
        self.onLog = None
        
        self.__filaPendentes = queue.Queue()
        self.__running = False
        self.__tasks = {}
        self.__socket = None
        self.__threadPendentes = threading.Thread(target=self.__processaPendentes)
        self.__threadPendentes.daemon=True
        self.__threadServidor = threading.Thread(target=self.__processaPedidos)
        self.__threadServidor.daemon=True

    def __doStartServer(self):
        if self.onStartServer:
            queue=[]
            self.onStartServer(self, queue)
            for task in queue:
                self.__tasks[task.id] = task
                if task.status=='waiting':
                    self.__filaPendentes.put_nowait(task)
    def __doStopServer(self):
        if self.onStopServer:
            self.onStopServer(self, self.__filaPendentes)
    def __doNewTask(self,task):
        if self.onNewTask:
            self.onNewTask(self, task)
    def __doStartTask(self,task):
        if self.onStartTask:
            self.onStartTask(self, task)
    def __doFinishTask(self,task):
        if self.onFinishTask:
            self.onFinishTask(self, task)
    def __doCancelTask(self,task):
        if self.onCancelTask:
            self.onCancelTask(self, task)
    def __doReenqueueTask(self, task):
        if self.onReenqueueTask:
            self.onReenqueueTask(self, task)
    def __doRemoveTask(self,task):
        if self.onRemoveTask:
            self.onRemoveTask(self, task)
    def __doLogError(self,message):
        if self.onLog:
            self.onLog(self,"error", message)
    def __doLogInfo(self,message):
        if self.onLog:
            self.onLog(self,"info", message)
                      
    def __processaPendentes(self):
        while self.__running:
            try:
                if self.__filaPendentes.empty():
                    time.sleep(5)
                else:
                    task = self.__filaPendentes.get()
                    if (task.status=='waiting'):
                        task.status = 'running'
                        self.__doStartTask(task)
                        resp = self._executeTask(task)
                        if resp.HasSuccess():
                            if task.status=='running':
                                task.status = 'finished'
                        else:
                            task.status = 'error'
                            task.message = str(resp.getError())
                        self.__doFinishTask(task)
                    self.__filaPendentes.task_done()
            except (KeyboardInterrupt, SystemExit):
                self.__doLogError("__processaPendentes captutou KeyboardInterrupt!")
                self.__running = False
        self.__doLogInfo('procesamento da filas parou!')



    def _executeTask(self,task):
        try:
            funcao = task.command
            args = task.params
            print(f'Executar funcao - {funcao}')
            result = getattr(tarefas, funcao)(*args)
            task.result=result
            return ResponseSuccess(result)
        except Exception as error:
            print(str(error))
            return ResponseError(error)
        
    def __responder(self, socket, address, msgObj):
        msg = json.dumps(msgObj)
        print('-------------------------------')
        print(msg[:100])
        print('-------------------------------')
        bytes = str.encode(msg,'utf-8')
        total = len(bytes)
        buffer = total.to_bytes(4,"little")
        socket.sendall(buffer)
        socket.sendall(bytes)

    def __processaPedidos(self):
        try:
            self.__doLogInfo("prepare deamon socket")
            if self.__socket==None:
                serverSocket = socket.socket(family=socket.AF_INET, type=socket.SOCK_STREAM)
            else:
                serverSocket = self.__socket
            serverSocket.bind((self._LOCAL_IP_, self._LOCAL_PORT_))
            serverSocket.listen(10)
            serverSocket.setblocking(1)
            self.__socket = serverSocket
            self.__doLogInfo("start deamon listenning")
            self.__doStartServer()
            while self.__running:
                try:
                    connection, client_address = serverSocket.accept()                    
                    buffer = connection.recv(4)
                    total = int.from_bytes(buffer,"little")
                    msg = bytearray(0)
                    while len(msg) < total:
                        msg = msg + connection.recv(self._BUFFER_SIZE_)                     
                    message = str(msg, "utf-8")
                    campos = message.split("#")
                    self.__doLogInfo(f'Recebeu:{campos[0]}-{campos[1]}')
                    if len(campos)==3:
                        if campos[1].strip().lower()=='task-keys':
                            tasksId = []
                            for taskId in self.__tasks.keys():
                                tasksId.append(taskId)
                            self.__responder(connection, client_address, tasksId)
                        elif campos[1].strip().lower()=='task-list':
                            tasks = []
                            for taskId in self.__tasks.keys():
                                task = self.__tasks[taskId]
                                #tasks.append(json.dumps(task.__dict__))
                                tasks.append({ "id": task.id, "datetime": task.datetime, "command": task.command, "params": task.params})
                            self.__responder(connection, client_address, tasks)
                        elif campos[1].strip().lower()=='task-status':
                            if campos[2] in self.__tasks:
                                task = self.__tasks[campos[2]]
                                status = { "status": task.status }
                            else:
                                status = { "status": "not found" }
                            self.__responder(connection, client_address, status)
                        elif campos[1].strip().lower()=='task-remove':
                            if campos[2] in self.__tasks:
                                task = self.__tasks[campos[2]]
                                self.__doRemoveTask(task)
                                status = { "status": task.status }
                                self.__tasks.pop(task.id, None)
                            else:
                                status = { "status": "not found" }
                            self.__responder(connection, client_address, status)
                        elif campos[1].strip().lower()=='task-remove-any':
                            status= []
                            for id in json.loads(campos[2]):
                                if id in self.__tasks:
                                    task = self.__tasks[id]
                                    self.__doRemoveTask(task)
                                    self.__tasks.pop(id, None)
                                    status.append({ "id":id, "status": task.status })
                                else:
                                    status.append({ "id":id, "status": 'not found' })
                            self.__responder(connection, client_address, json.dumps(status))
                        elif campos[1].strip().lower()=='task-cancel':
                            if campos[2] in self.__tasks:
                                task = self.__tasks[campos[2]]
                                task.status = 'canceled'
                                self.__doCancelTask(task)
                                status = { "status": task.status }
                            else:
                                status = { "status": "not found" }
                            self.__responder(connection, client_address, status)
                        elif campos[1].strip().lower()=='task-cancel-any':
                            status= []
                            for id in json.loads(campos[1]):
                                if campos[2] in self.__tasks:
                                    task = self.__tasks[campos[2]]
                                    if task.status=='waiting':
                                        task.status=='canceled'
                                        self.__doCancelTask(task)
                                    status.append({ "id":id, "status": task.status })
                                else:
                                    status.append({ "id":id, "status": "not found" })
                            self.__responder(connection, client_address, json.dumps(status))
                        elif campos[1].strip().lower()=='task-reenqueue':
                            if campos[2] in self.__tasks:
                                task = self.__tasks[campos[2]]
                                if task.status != 'running' and task.status!='waiting':
                                    task.status = 'waiting'
                                    self.__filaPendentes.put_nowait(task)
                                    self.__doReenqueueTask(task)
                                status = { "status": task.status }
                            else:
                                status = { "status": "not found" }
                            self.__responder(connection, client_address, status)
                        elif campos[1].strip().lower()=='task-result':
                            if campos[2] in self.__tasks:
                                task = self.__tasks[campos[2]]
                                if task.status.strip().lower()=='finished':
                                    result = { "status": "ok", "result": json.dumps(task.result)}
                                elif task.status.strip().lower()=='error':
                                    result = { "status": "error", "message": task.message}
                                else:
                                    result = { "status": status.strip().lower()}
                            else:
                                result = { "status": "not found" }
                            self.__responder(connection, client_address, result)
                        elif campos[0]=='ASYNC':
                            task = Task(command=campos[1],params=json.loads(campos[2]))
                            self.__tasks[task.id] = task
                            self.__filaPendentes.put_nowait(task)
                            self.__doNewTask(task)
                            self.__responder(connection, client_address, { "status": "ok", "guidTask": task.id })
                        else:
                            task = Task(command=campos[1],params=json.loads(campos[2]))
                            resp = self._executeTask(task)
                            if resp.HasSuccess():
                                self.__responder(connection, client_address, { "status": "ok", "result": resp.result })
                            else:
                                self.__responder(connection, client_address, { "status": "error", "result": resp.result, "error": str(resp.getError()) })
                    else:
                        connection.sendall({ "status": "error", "message": "mensagem com formato errado!" })
                except (KeyboardInterrupt, SystemExit):
                    self.__doLogError("__processaPedidos captutou KeyboardInterrupt!")
                    self.__running = False
                except socket.error as err:
                    self.__doLogError(str(err))
                    self.__running = False
                    self.__socket.close()
            self.__doLogInfo("stop deamon")
            self.__doStopServer()
        except Exception as e:
            self.__doLogError(str(e))
            
    def start(self):
        if not self.__running:
            self.__running = True
            self.__threadPendentes.start()
            self.__threadServidor.start()
        
    def isRunning(self):
       return self.__running 
   
    def stop(self):
        if self.__running:
            self.__running = False
            try:
                self.__socket.close()
            except:
                pass
            self.__threadServidor.join()
            self.__threadPendentes.join()
        