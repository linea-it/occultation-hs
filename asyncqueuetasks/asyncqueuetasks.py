from asyncworks import DeamonWorker
import time, os, sys
from database import Database

class DeamonObserverPersistence:
    _db = Database()
    
    def startServer(self, sender, queue):
        print("Task Queue Server Listenning...")
        for task in self._db.getAllTasks():
            queue.append(task)
    def stopServer(self,sender, queue):
        print("Task Queue Server Stop...")
    def newTask(self,sender, task):
        print("New task {}".format(task.str()[:100]))
        self._db.insert(task)
    def startTask(self,sender, task):
        print("Start task {}".format(task.str()[:100]))
    def finishTask(self,sender, task):
        print("Finish task {} - {}".format(task.str()[:100], task.status))
        self._db.update(task)
    def cancelTask(self,sender, task):
        print("Cancel task {} - {}".format(task.str()[:100], task.status))
        self._db.update(task)
    def removeTask(self,sender, task):
        print("Remove task {} - {}".format(task.str()[:100], task.status))
        self._db.delete(task.id)
    def logDeamon(self,sender, level, msg):
        print("{}: {}".format(level, str(msg)[:100]))


if __name__ == '__main__':
    w = DeamonWorker()
    db = DeamonObserverPersistence()
    w.onStartServer = db.startServer
    w.onStopServer = db.stopServer
    w.onNewTask = db.newTask
    w.onStartTask = db.startTask
    w.onFinishTask = db.finishTask
    w.onCancelTask = db.cancelTask
    w.onRemoveTask = db.removeTask
    w.onLog = db.logDeamon
    w.start()
    
    fileName = os.path.join('gui','main.py') 
    if os.path.isdir('gui') and os.path.isfile(fileName):
        #__import__('gui.main')
        #modulo_gui=sys.modules['gui.main']
        #modulo_gui.start()
        
        #from importlib import import_module
        #modulo_gui = import_module('gui.main')
        #modulo_gui.start()
        
        #exec(code, module_main.__dict__)
        exec(open(fileName,'rb').read())
    else:
        while(True):
            time.sleep(100)
