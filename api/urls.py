from django.urls import include, path, re_path
from rest_framework import routers
from . import views


#router = routers.DefaultRouter()
#router.register(r'users', UserViewSet)

urlpatterns = [
    #path('', include(router.urls)),
    path('user/change-password', views.ChangePasswordView.as_view(), name='change-password'),
    path('user/password-reset', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('login', views.login),
    path('', include('rest_framework.urls', namespace='rest_framework')),
    re_path(r'^user$', views.user_list),
    re_path(r'^user/(?P<id>[0-9]+)$', views.user_detail),
    re_path(r'^project$',views.project_list),
    re_path(r'^project/(?P<id>[0-9]+)$',views.project_detail),
    re_path(r'^validate-body$',views.validate_body)
]
