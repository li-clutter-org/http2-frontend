from django.db import models


class AnalysisInfo(models.Model):
    STATE_CHOICES = (
        ('sent', 'Send'),
        ('failed', 'Failed'),
        ('done', 'Done')
    )
    analysis_id = models.CharField(max_length=60)
    state = models.CharField(
        choices=STATE_CHOICES,
        max_length=6,
        default='sent'
    )
    url_analyzed = models.URLField()
    http1_json_data = models.TextField()
    http2_json_data = models.TextField()
    when_done = models.DateTimeField()

    def __unicode__(self):
        return self.url_analyzed
