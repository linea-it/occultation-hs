"""sora URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path, re_path
from django.conf.urls.static import static
from django.views.static import serve
from django.views.generic.base import RedirectView, TemplateView
from api import urls 
from . import settings
import os
#pagesPath = os.path.join(os.path.relpath(settings.BASE_DIR),"pages")+os.path.sep
pagesPath='pages'+os.path.sep

frontendurlpatterns = [
    re_path(r'^(?P<path>[\w|-|\d|\.]+\.(html|json|map|js|png))$', RedirectView.as_view(url=pagesPath+'%(path)s', permanent=False))]
frontendurlpatterns += static('pages/', document_root=pagesPath)
frontendurlpatterns += static('gui/', document_root=pagesPath+'index.html')
frontendurlpatterns += static('/', document_root=pagesPath+'index.html')

#frontendurlpatterns += [re_path(r'^(?P<path>[\w|-|\d|\.]+\.(html|json|map|js|png))$', view=serve, name='staticredirect', kwargs={'document_root': 'pages/'})]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(urls.urlpatterns)),
] + frontendurlpatterns
