from django.test import TestCase
from django.core.urlresolvers import reverse

from main.models import AnalysisInfo


class TestSendAnalysisViewSet(TestCase):

    def test_view(self):
        data = {'url': 'www.zunzun.se'}
        response = self.client.post(reverse('send_analysis'), data)

        print(response.data)

        self.assertEquals(response.status_code, 200)

        # Checking that some data is correct in the response
        self.assertEquals(response.data['url'], data['url'])
        self.assertEquals(response.data['state'], 'sent')


class TestGetAnalysisState(TestCase):

    def setUp(self):
        self.analysis_info = AnalysisInfo.objects.create(
            url_analyzed='www.google.com',
        )

    def test_view(self):
        data = {'analysis_id': self.analysis_info.analysis_id}
        response = self.client.get(reverse('get_analysis_state', kwargs=data))

        print(response.data)

        self.assertEquals(response.status_code, 200)

        # Checking that some data is correct in the response
        self.assertEquals(response.data['url_analyzed'], self.analysis_info.url_analyzed)
        self.assertEquals(response.data['state'], 'sent')
