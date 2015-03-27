from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from .models import AnalysisInfo


class AnalysisInfoSerializer(ModelSerializer):

    json = serializers.ReadOnlyField(source='get_json')

    class Meta:
        model = AnalysisInfo
        fields = ('analysis_id', 'state', 'json', 'url_analyzed')
