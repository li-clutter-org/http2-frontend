from rest_framework.views import APIView, status
from rest_framework.response import Response


class AnalyzerViewSet(APIView):

    def post(self, request):

        data = request.DATA

        return Response(data, status=status.HTTP_200_OK)
