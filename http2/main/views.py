from rest_framework.views import APIView, status
from rest_framework.response import Response


class AnalyzerViewSet(APIView):
    """
    This view will set a task in a queue (perhaps using Celery + RabbitMQ),
    and the task will request the analysis to the URL, and set the data in
    a place that could be read later to show the results to the user.
    """

    def post(self, request):
        # TODO: call the task that will take of the analysis.
        data = request.DATA

        return Response(data, status=status.HTTP_200_OK)
