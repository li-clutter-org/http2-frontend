from django.conf.urls import patterns, url
from django.views.generic import TemplateView

from .views import (
    SendAnalysisViewSet,
    AnalyzerMockingViewSet,
    GetAnalysisState,
)

urlpatterns = patterns('main.views',
                       # url(r'^$', TemplateView.as_view(
                       #     template_name='base.html'), name="index"),

                       # API urls
                       url(r'^api/send/analysis$',
                           SendAnalysisViewSet.as_view(
                           ), name="send_analysis"),
                       url(r'^api/get/analysis/state/(?P<analysis_id>[^/]+)$',
                           GetAnalysisState.as_view(
                           ), name="get_analysis_state"),
                       url(r'^api/analyzer/mocking$',
                           AnalyzerMockingViewSet.as_view(
                           ), name="analyzer_mocking"),
                       )
