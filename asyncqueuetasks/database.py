import sqlite3
from sqlite3 import Error
import os, json

from asyncworks import Task


class Database:
    _DATA_BASE_PATH_ = "tasks.db"
    def __init__(self):
        if not os.path.exists(self._DATA_BASE_PATH_):
            self._createDB()
    
                
    def _createDB(self):
        conn = None
        try:
            conn = sqlite3.connect(self._DATA_BASE_PATH_)
            print(sqlite3.version)
            try:
                sql = """CREATE TABLE IF NOT EXISTS tasks (
                                    guid text PRIMARY KEY,
                                    status text NOT NULL,
                                    command integer,
                                    params text NOT NULL,
                                    result text NOT NULL,
                                    message text NOT NULL,
                                    datetime text NOT NULL
                                );"""
                c = conn.cursor()
                c.execute(sql)
            except Error as e:
                print(e)
        except Error as e:
            print(e)
        finally:
            if conn:
                conn.close()

    def insert(self, task):
        conn = None
        try:
            conn = sqlite3.connect(self._DATA_BASE_PATH_)
            sql = ''' INSERT INTO tasks(guid,status,command,params,result,message,datetime) VALUES(?,?,?,?,?,?,?) '''
            cur = conn.cursor()
            print((task.id, task.status, task.command, task.datetime,))
            cur.execute(sql, (task.id, task.status, task.command, json.dumps(task.params), json.dumps(task.result), task.message, task.datetime,))
            conn.commit()
        except Error as e:
            print(e)
        finally:
            if conn:
                conn.close()
        
    def update(self, task):
        conn = None
        try:
            conn = sqlite3.connect(self._DATA_BASE_PATH_)
            sql = ''' update tasks set status=?, result=?, message=?, datetime=? where guid=? '''
            cur = conn.cursor()
            cur.execute(sql, (task.status, json.dumps(task.result), task.message, task.datetime, task.id,))
            conn.commit()
        except Error as e:
            print(e)
        finally:
            if conn:
                conn.close()

    def delete(self, guid):
        conn = None
        try:
            conn = sqlite3.connect(self._DATA_BASE_PATH_)
            sql = ''' delete from tasks where guid=? '''
            cur = conn.cursor()
            cur.execute(sql, (guid,))
            conn.commit()
        except Error as e:
            print(e)
        finally:
            if conn:
                conn.close()

    def deleteFromGuids(self, guids):
        conn = None
        try:
            conn = sqlite3.connect(self._DATA_BASE_PATH_)
            guids = [ "'"+guid+"'" for guid in guids]
            str = ', '.join(guids)
            sql = "delete from tasks where guid in ({})".format(str)
            cur = conn.cursor()
            cur.execute(sql)
            conn.commit()
        except Error as e:
            print(e)
        finally:
            if conn:
                conn.close()
        
    def getAllTasks(self):
        conn = None
        try:
            conn = sqlite3.connect(self._DATA_BASE_PATH_)
            sql = ''' select guid, status, command, params, result, message, datetime from tasks'''
            cur = conn.cursor()
            cur.execute(sql)
            rows = cur.fetchall()
            lst=[]
            for r in rows:
                task = Task("","")
                task.id = r[0]
                task.status = r[1]
                task.command=r[2]
                task.params=json.loads(r[3])
                task.result=json.loads(r[4])
                task.message=r[5]
                task.datetime=r[6]
                lst.append(task)
            conn.commit()
            return lst
        except Error as e:
            print(e)
        finally:
            if conn:
                conn.close()
    
    def getTask(self, guid):
        conn = None
        try:
            conn = sqlite3.connect(self._DATA_BASE_PATH_)
            sql = ''' select guid, status, command, params, result, message, datetime from tasks where guid=?'''
            cur = conn.cursor()
            cur.execute(sql, (guid,))
            rows = cur.fetchall()
            if len(rows)==1:
                task = Task("","")
                task.id = rows[0][0]
                task.status = rows[0][1] 
                task.command=rows[0][2]
                task.params=json.loads(rows[0][3])
                task.result=json.loads(rows[0][4])
                task.message=rows[0][5]
                task.datetime=rows[0][6]
            else:
                task=None
            conn.commit()
            return task
        except Error as e:
            print(e)
        finally:
            if conn:
                conn.close()

if __name__ == '__main__':
    db = Database()
    task = db.getTask('a6d35c14-6fbb-4f2a-9b2d-6177891d9d23')
    task.status='running'
    db.update(task)
    db.deleteFromGuids(['8e634cc8-3129-45cf-873a-edce4792f60d','7c6511dc-19b7-4b02-beca-4bafcac52e27','719c49a0-f529-4962-8b75-870fb2799a8f'])
    for t in db.getAllTasks():
        print(t.id)
    t = db.getTask('8e634cc8-3129-45cf-873a-edce4792f60d')
    if t!=None:
        print(t.id)
        