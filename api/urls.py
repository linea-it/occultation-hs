from django.urls import include, path, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import routers
from . import views


#router = routers.DefaultRouter()
#router.register(r'users', UserViewSet)

urlpatterns = [
    #path('', include(router.urls)),
    path('user/change-password', views.ChangePasswordView.as_view()),
    path('user/password-reset/', include('django_rest_passwordreset.urls')),
    path('user/verify_email', views.verify_email),
    path('oi', views.oi),
    path('login', views.login),
    path('refresh', views.refresh),
    path('', include('rest_framework.urls')),
    re_path(r'^user$', views.user_list),
    re_path(r'^user/(?P<id>[0-9]+)$', views.user_detail),
    re_path(r'^user-verify', views.user_verify),
    re_path(r'^project$',views.project_list),
    re_path(r'^project/(?P<id>[0-9]+)$',views.project_detail),
    re_path(r'^job/(?P<action>[A-Za-z]+)/(?P<idJob>[0-9]+)$',views.job_acao),
    re_path(r'^project/status-jobs/(?P<idProject>[0-9]+)$',views.project_status_jobs),
    re_path(r'^project/jobs/(?P<idProject>[0-9]+)$',views.project_jobs),
    re_path(r'^job$',views.job_list),
    re_path(r'^job/(?P<id>[0-9]+)$',views.job_detail),
    re_path(r'^validate-body$',views.validate_body),
    re_path(r'^consolida-job$',views.consolida_job),
    re_path(r'^bodies/(?P<projectId>[0-9]+)$',views.get_bodies_by_project),
    re_path(r'^predictions/(?P<projectId>[0-9]+)$',views.get_predictions_by_project),
    re_path(r'^delete-prediction/(?P<predictionId>[0-9]+)$',views.delete_prediction),
    re_path(r'^prediction-name/(?P<predictionId>[0-9]+)$',views.prediction_name),
    re_path(r'^light-curve/(?P<predictionId>[0-9]+)$',views.insert_light_curve),
    re_path(r'^light-curves/(?P<predictionId>[0-9]+)$',views.get_ligth_curve_by_prediction),
    re_path(r'^light-curves-project/(?P<projectId>[0-9]+)$',views.get_ligth_curve_by_project),
    re_path(r'^update-light-curve/(?P<lightCurveId>[0-9]+)$',views.alter_light_curve),
    re_path(r'^delete-light-curve/(?P<lightCurveId>[0-9]+)$',views.delete_light_curve),
    re_path(r'^light-curve-settings/(?P<lightCurveId>[0-9]+)$',views.light_curve_settings),
    re_path(r'^get-light-curve/(?P<lightCurveId>[0-9]+)$',views.get_ligth_curve),
    re_path(r'^get-light-curve-results/(?P<lightCurveId>[0-9]+)$',views.get_ligth_curve_results),
    re_path(r'^light-curve-detect/(?P<lightCurveId>[0-9]+)$',views.light_curve_detect),
    re_path(r'^light-curve-fit/(?P<lightCurveId>[0-9]+)$',views.light_curve_fit),
    re_path(r'^light-curve-model/(?P<lightCurveId>[0-9]+)$',views.light_curve_model),
    re_path(r'^light-curve-results/(?P<lightCurveId>[0-9]+)$',views.light_curve_results),
    re_path(r'^light-curve-normalize/(?P<lightCurveId>[0-9]+)$',views.light_curve_normalize),
    re_path(r'^get-star/(?P<predicitionId>[0-9]+)$',views.get_star),
    re_path(r'put-star$',views.put_star),
    re_path(r'star-calculate-diameter$',views.star_calculate_diameter), 
    re_path(r'star-magnitudes$', views.star_magnitudes),
    path('light-curve-reset', views.light_curve_reset),
    path('light-curve-negate', views.light_curve_negate),
    path('observer', views.observer),
    path('chord', views.chord),
    path('plot-chords', views.plot_chords),
    path('fit-ellipse', views.fit_ellipse),
    path('filter-negative-chord', views.filter_negative_chord),
    path('ellipse-result', views.ellipse_result),
    path('occultation-plot', views.occultation_plot),
]
