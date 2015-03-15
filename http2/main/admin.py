from django.contrib import admin

from .models import AnalysisInfo


class AnalysisInfoAdmin(admin.ModelAdmin):
    list_display = AnalysisInfo._meta.get_all_field_names()

admin.site.register(AnalysisInfo, AnalysisInfoAdmin)
