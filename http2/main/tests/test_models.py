# coding: utf-8

from __future__ import absolute_import

from django.test import TestCase

from main.models import AnalysisInfo


class TestAnalysisInfoModel(TestCase):

    def create(self):
        # With all required info. A happy case.
        analysis_info = AnalysisInfo.objects.create(
            analysis_id='123',
            url_analyzed='www.google.com',
            http1_json_data="{'response': {'headers': [{'Connection': '	keep-alive'}]}}",
            http2_json_data="{'response': {'headers': [{'Cache-Control': 'max-age=300'}]}}",
        )

        # It is set by default as 'sent'
        self.assertEquals(analysis_info.state, 'sent')
        self.assertEquals(analysis_info.url_analyzed, 'www.google.com')
