
from PyQt5.QtCore import *
from PyQt5.QtWebEngineWidgets import *
from PyQt5.QtWidgets import QApplication, QDesktopWidget
from threading import Timer,Thread
import sys
import os
from django.core.wsgi import get_wsgi_application 
from django.core.management import call_command

def UIApp(location,application):
    qt_app = QApplication(sys.argv)
    print("chamou criar qtapp")
    web = QWebEngineView()
    web.setWindowTitle("SORA")
    web.resize(900, 700)
    #web.
    web.setZoomFactor(1.0)
    web.load(QUrl(location))
    
    #centralizar na tela
    centerPoint = QDesktopWidget().availableGeometry().center()
    qtRectangle = web.frameGeometry()
    qtRectangle.moveCenter(centerPoint)
    web.move(qtRectangle.topLeft())
    web.show()

    #web.showFullScreen()
    qt_app.exec_()
    os._exit(0)

def runDjangoApp(application):
    call_command('runserver',use_reloader=False)

def executarBrowser(application):
    Timer(1,lambda: UIApp("http://127.0.0.1:8000/",application)).start()

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sora-gui.settings")
    application = get_wsgi_application()

    # start sub-thread to open the browser.
    Thread(target=executarBrowser,args=[application]).start()
    runDjangoApp(application)
    
    