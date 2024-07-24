#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import os, sys

import sys, os, django
sys.path.append("soragui") #here store is root folder(means parent).

os.environ['DJANGO_SETTINGS_MODULE'] = 'soragui.settings'
django.setup()
#these pertain to your application
import soragui.settings
import soragui.urls
import api.models
import api.views
import api.asyncworks
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

#dont need to import these pkgs
#need to know how to exclude them
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

#let us hook up cherrypy
#is it possible to hook up the dev server itself?
from cheroot.wsgi import Server as CherryPyWSGIServer
import cherrypy
from django.core.handlers.wsgi import WSGIHandler
from django.contrib.staticfiles.handlers import StaticFilesHandler

if __name__ == "__main__":
    os.environ["DJANGO_SETTINGS_MODULE"] = "soragui"
    # Set up site-wide config first so we get a log if errors occur.
    
    cherrypy.config.update({'environment': 'production',
                            'log.error_file': 'site.log',
                            'log.screen': False})

    try:
        sys.path.insert(0,"..")
        #2nd param to AdminMediaHandler should be absolute path to the admin media files
        cherrypy.tree.graft(StaticFilesHandler(WSGIHandler()), '/')
        cherrypy.server.socket_port = 8000
        cherrypy.server.start()
        cherrypy.engine.start()

    except KeyboardInterrupt:
        cherrypy.server.stop()