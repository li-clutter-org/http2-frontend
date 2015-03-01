from django.conf.urls import patterns, url
from django.views.generic import TemplateView

from .views import AnalyzerViewSet

urlpatterns = patterns('main.views',
    url(r'^$', TemplateView.as_view(template_name='base.html'), name="index"),

    # API urls
    url(r'^api/analyzer$', AnalyzerViewSet.as_view(), name="analyzer"),
)
