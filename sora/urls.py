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
from django.views.generic.base import RedirectView, TemplateView
from api import urls 
from . import settings

frontendurlpatterns =  static('res/js/', document_root='pages/res/js/')
frontendurlpatterns += static('res/css/', document_root='pages/res/css/')
frontendurlpatterns += static('/', document_root='pages/', path='index.html')
frontendurlpatterns += static('/\w*$', document_root='pages/', path='index.html')

urlpatterns = [
    #path('admin/', admin.site.urls),
    path('api/', include(urls.urlpatterns)),
] + frontendurlpatterns
