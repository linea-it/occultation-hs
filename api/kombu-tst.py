from kombu import Connection, Exchange, Queue
from kombu.mixins import ConsumerMixin
from kombu.log import get_logger
from kombu.pools import producers
from kombu.compat import Publisher, Consumer
import threading


logger = get_logger(__name__)

def helloTask(who='world'):
    print(f'Hello {who}')

class BackgroundTasks:
    __instance = None
    @classmethod
    def getInstance(cls):
        if cls.__instance is None:
            print("criou")
            cls.__instance = BackgroundTasks()
        return cls.__instance
    
    def __init__(self):
        self.__default_exchange = Exchange('sora_gui_exchange', type='direct', durable=True)
        self.__task_queues = (Queue('sora_queue', self.__default_exchange, routing_key='sora_queue' ))
        self.__thread = threading.Thread(target=self.__loopConsumer)
        self.__thread.start()

    def __loopConsumer(self):
        with Connection('amqp://guest:guest@localhost//') as conn:
            print("conectado!")
            with Consumer( connection=conn,
                         queue='sora_queue',
                         exchange='sora_gui_exchange', 
                         routing_key='sora_queue',
                         accept=['pickle', 'json'],
                         exchange_type='direct') as consumer:
                print("consumindo!")
                while true:
                    for message in consumer.iterqueue():
                        body = message.body
                        print("executando tarefa!")
                        fun = body['fun']
                        args = body['args']
                        kwargs = body['kwargs']
                        logger.info('Got task: %s', reprcall(fun.__name__, args, kwargs))
                        try:
                            fun(*args, **kwargs)
                        except Exception as exc:
                            logger.error('task raised exception: %r', exc)
                        message.ack()
                    time.sleep(5)

    def sendTask(self, fun, args=(), kwargs={}):
        payload = {'fun': fun, 'args': args, 'kwargs': kwargs}
        routing_key = 'sora_queue'
        print("enviar msg")
        with Connection('amqp://guest:guest@localhost//') as conn:
            with producers[conn].acquire(block=True) as producer:
                producer.publish(payload,
                         serializer='pickle',
                         compression='bzip2',
                         exchange='sora_gui_exchange', 
                         routing_key='sora_queue',
                         exchange_type="direct")

def msg():
    print("msg")
      

            
if __name__ == '__main__':
    bg = BackgroundTasks.getInstance()
    threading.Timer(10.0, lambda: bg.sendTask(fun=helloTask, args=('Kombu',), kwargs={})).start()
    
    
            