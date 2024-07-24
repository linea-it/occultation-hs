
from PyQt5.QtCore import *
from PyQt5.QtWebEngineWidgets import *
from PyQt5.QtWidgets import QApplication, QDesktopWidget, QFileDialog
from threading import Timer,Thread
import sys, os, django

pathRelativo = os.path.relpath(os.path.dirname(os.path.realpath(__file__)))
print("--------------------------")
print(pathRelativo)
print("--------------------------")
sys.path.append(pathRelativo) #here store is root folder(means parent).

from django.core.wsgi import get_wsgi_application 
from django.core.management import call_command

'''
pathAbsoluto = os.path.dirname(os.path.realpath(__file__))
print(pathAbsoluto)
sys.path.append(pathAbsoluto) #here store is root folder(means parent).
print("--------------------------")
'''
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sora-gui.settings')
os.environ['DJANGO_SETTINGS_MODULE'] = 'sora-gui.settings'
django.setup()
#these pertain to your application
import importlib  
settings = importlib.import_module("sora-gui.settings")
urls = importlib.import_module("sora-gui.urls")
import api.models
import api.views
import manage
#these are django imports
import django.template.loaders.filesystem
import django.template.loaders.app_directories
import django.middleware.common
import django.contrib.sessions.middleware
import django.contrib.auth.middleware
import django.contrib.auth
import django.contrib.contenttypes
import django.contrib.sessions
import django.contrib.sessions.backends.db
import django.contrib.sites
import django.contrib.admin
import django.core.cache.backends
import django.db.backends.sqlite3.base
import django.db.backends.sqlite3.introspection
import django.db.backends.sqlite3.creation
import django.db.backends.sqlite3.client
import django.template.defaulttags
import django.template.defaultfilters
import django.template.loader_tags

import django.contrib.admin.views.main
import django.contrib.auth.views
import django.contrib.auth.backends
import django.views.static
import django.contrib.admin.templatetags.admin_list
import django.contrib.admin.templatetags.admin_modify
import django.contrib.admin.templatetags.log
import django.views.defaults

import email.mime.audio
import email.mime.base
import email.mime.image
import email.mime.message
import email.mime.multipart
import email.mime.nonmultipart
import email.mime.text
import email.charset
import email.encoders
import email.errors
import email.feedparser
import email.generator
import email.header
import email.iterators
import email.message
import email.parser
import email.utils
import email.base64mime
import email.quoprimime
import django.core.cache.backends.locmem
import django.templatetags.i18n
import django.views.i18n

from django.core.handlers.wsgi import WSGIHandler
from django.contrib.staticfiles.handlers import StaticFilesHandler


@pyqtSlot("QWebEngineDownloadItem*")
def on_downloadRequested(download):
    old_path = download.url().path()  # download.path()
    suffix = QFileInfo(old_path).suffix()
    if not suffix:
        suffix = 'zip'
    path, _ = QFileDialog.getSaveFileName(
        None, "Save File", old_path, "*." + suffix
    )
    if path:
        download.setPath(path)
        download.accept()

def UIApp(location,application):
    qt_app = QApplication(sys.argv)
    print("chamou criar qtapp")
    web = QWebEngineView()
    web.setWindowTitle("Occultin 0.97")
    web.resize(900, 700)
    web.page().profile().downloadRequested.connect(on_downloadRequested)
    #web.
    if os.path.exists('cache.clear'):
       print("Removendo cache")
       web.page().profile().clearHttpCache()
       print("Removendo cookies")
       web.page().profile().cookieStore().deleteAllCookies()
       os.remove('cache.clear')
       os._exit(0)
       
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
    #os.environ["DJANGO_SETTINGS_MODULE"] = "settings"
    #os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")
    application = get_wsgi_application()

    # start sub-thread to open the browser.
    Thread(target=executarBrowser,args=[application]).start()
    runDjangoApp(application)
    
    