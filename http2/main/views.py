import os
import shutil
import requests

from django.conf import settings

from rest_framework.views import APIView, status
from rest_framework.response import Response

from .analyzer import process_url, generate_hash_id
from .models import AnalysisInfo
from .serializers import AnalysisInfoSerializer


class SendAnalysisViewSet(APIView):
    """
    This view will send a POST to the analyzer, and create an instance of
    AnalysisInfo model.
    """

    def post(self, request):
        # TODO: call the task that will take of the analysis.
        data = request.DATA
        url_to_analyze = data['url']
        hash_id = generate_hash_id(url_to_analyze)

        # TODO: do the POST request to the analyzer according with this:
        # curl -k --data-binary "http://www.reddit.com/r/haskell/" --http2 https://instr.httpdos.com:1070/setnexturl/
        # varify=False is the equivalent to curl -k
        requests.post(settings.ANALYZER_URL, data={'url': url_to_analyze}, verify=False)

        analysis_info, created = AnalysisInfo.objects.get_or_create(
            url_analyzed=url_to_analyze,
            analysis_id=hash_id
        )

        return Response(AnalysisInfoSerializer(analysis_info).data, status=status.HTTP_200_OK)


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
