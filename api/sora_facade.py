from sora import Occultation, Body, Star, LightCurve, Observer
from sora.prediction import prediction
from sora.extra import draw_ellipse
from pathlib import Path
import os
import io
import base64
from zipfile import ZipFile
import time
from celery import shared_task

class Prediction:
    _lastError=''
    _dirInputBsp = str(os.environ.get('SORA_BSP', Path.joinpath(Path.home(),'sora','bsp')))

    def __init__(self):
        print(f'checando existencia do diretorio de trabalho: {self._dirInputBsp}')
        if not Path(self._dirInputBsp).exists():
            print(f'criou diretorio de trabalho: {self._dirInputBsp}')
            Path(self._dirInputBsp).mkdir(parents=True, exist_ok=True)

    def getLastError(self):
        return self._lastError

    @shared_task(queue='default')
    def slowTestTask(self):
        print('Started task, processing...')
        time.sleep(120)
        print('Finished Task')
        return True
    
    def criarTaskTeste(self):
        self.slowTestTask.delay()

    def validateBody(self, bodyName, ephemName='horizons'):
        try:
            Body(name=bodyName, ephem=ephemName)
            return True
        except Exception as error:
            self._lastError = str(error)
            return False

    def _formatBSPFileName(self, ephemName):
        if not Path(ephemName).exists():
            if not ephemName.endswith('.bsp'):
                ephemName=ephemName+'.bsp'
            if not ephemName.startswith(self._dirInputBsp):
                ephemName=str(Path(self._dirInputBsp).joinpath(ephemName))
        return ephemName

    def importBase64ZipFile(self, base64Content):
        content = io.BytesIO(base64.b64decode(base64Content))
        zip=ZipFile(content)
        resp = []
        for name in zip.namelist():
            if name.endswith('.bsp'):
                nameEphem = Path(name).stem
                self.addEphemBspFile(nameEphem,zip.read(name))
                resp.append(nameEphem)
        return resp

    def addEphemBspFile(self, ephemName, ephemByteContentFile):
        ephemFileName = self._formatBSPFileName(ephemName)
        ephemByteContentFile = bytearray(ephemByteContentFile)
        with open(ephemFileName, 'wb') as file:
            file.write(ephemByteContentFile)

    def validateBodyZipEphem(self, bodyName, ephemBase64ZipContent):
        try:
            ephemFiles = self.importBase64ZipFile(ephemBase64ZipContent)
            ephemFullNameFiles = []
            for ephemFile in ephemFiles:
                ephemFullNameFiles.append(self._formatBSPFileName(ephemFile))
            print(f'ephem files - {ephemFullNameFiles}')
            Body(name=bodyName, ephem=ephemFullNameFiles)
            return True
        except Exception as error:
            self._lastError = str(error)
            return False
    
if __name__ == "__main__":
    try:
        p = Prediction()
        p.validateBody('Chariklo')
        p.validateBody('Chariklo', 'horizons')
        if (Path('EphemTeste.zip').exists()):
            with open('EphemTeste.zip', 'rb') as file:
                content = base64.b64encode(file.read())
            p.validateBodyZipEphem('Chariklo', content)
    except Exception as error:
            print(str(error))
    