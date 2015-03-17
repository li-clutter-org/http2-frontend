from rest_framework.serializers import ModelSerializer

from .models import AnalysisInfo


class AnalysisInfoSerializer(ModelSerializer):

    class Meta:
        model = AnalysisInfo
