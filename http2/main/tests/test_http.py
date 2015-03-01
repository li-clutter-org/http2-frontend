from django.test import TestCase
from django.core.urlresolvers import reverse


class TestAnalyzerViewSet(TestCase):

    def test_view(self):
        data = {'url': 'www.zunzun.se'}
        response = self.client.post(reverse('analyzer'), data)

        print(response.data)

        self.assertEquals(response.status_code, 200)

        # Checking that some data is correct in the response
        self.assertEquals(response.data['url'], data['url'])
