import os

from django.conf import settings

from rest_framework.views import APIView, status
from rest_framework.response import Response

from .analyzer import process_url


class AnalyzerViewSet(APIView):
    """
    This view will set a task in a queue (perhaps using Celery + RabbitMQ),
    and the task will request the analysis to the URL, and set the data in
    a place that could be read later to show the results to the user.
    """

    def post(self, request):
        # TODO: call the task that will take of the analysis.
        data = request.DATA

        json_data = process_url(data['url'])

        return Response(json_data, status=status.HTTP_200_OK)
