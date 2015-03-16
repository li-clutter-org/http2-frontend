import os
import shutil

from django.conf import settings

from rest_framework.views import APIView, status
from rest_framework.response import Response

from .analyzer import process_url, generate_hash_id


class SendAnalysisViewSet(APIView):
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


class AnalyzerMockingViewSet(APIView):
    """
    This view will set a task in a queue (perhaps using Celery + RabbitMQ),
    and the task will request the analysis to the URL, and set the data in
    a place that could be read later to show the results to the user.
    """

    def post(self, request):
        # TODO: call the task that will take of the analysis.
        data = request.DATA

        hash_id = generate_hash_id(data['url'])
        analysis_result_path = os.path.join(settings.ANALYSIS_RESULT_PATH, hash_id)

        # Creating the dir for the results
        if not os.path.exists(analysis_result_path):
            os.makedirs(analysis_result_path)

        # Hard coding this for now, it is just a mocking
        http2_har_filename = 'test_http2.har'
        http2_har_file_path = os.path.join(settings.MEDIA_ROOT, http2_har_filename)

        http1_har_filename = 'harvested.har'
        http1_har_file_path = os.path.join(settings.MEDIA_ROOT, http1_har_filename)

        shutil.copy(http2_har_file_path, analysis_result_path)
        shutil.copy(http1_har_file_path, analysis_result_path)

        # Generating success responses for now, we could later set a couple of
        # settings vars to simulate the other states
        status_done_file_path = os.path.join(analysis_result_path, settings.ANALYSIS_RESULTS_DONE_FILE_NAME)
        status_done_file = open(status_done_file_path, 'w')
        status_done_file.close()

        return Response(status=status.HTTP_200_OK)
