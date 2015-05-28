from django.contrib import admin

from .models import AnalysisInfo


class AnalysisInfoAdmin(admin.ModelAdmin):
    model = AnalysisInfo
    list_display = ('analysis_id', 'state', 'url_analyzed', 'created_at', 'when_done')

admin.site.register(AnalysisInfo, AnalysisInfoAdmin)
