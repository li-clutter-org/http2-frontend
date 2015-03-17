import hashlib

from django.db import models

from .analyzer import generate_hash_id


class AnalysisInfo(models.Model):
    STATE_SENT = 'sent'
    STATE_FAILED = 'failed'
    STATE_DONE = 'done'
    STATE_CHOICES = (
        (STATE_SENT, 'Sent'),
        (STATE_FAILED, 'Failed'),
        (STATE_DONE, 'Done')
    )
    analysis_id = models.CharField(max_length=60, editable=False)
    # state of the analysis
    state = models.CharField(
        choices=STATE_CHOICES,
        max_length=10,
        default=STATE_SENT
    )
    # URL analyzed
    url_analyzed = models.URLField()
    # data for http 1 request
    http1_json_data = models.TextField(null=True)
    # data for http 2 request
    http2_json_data = models.TextField(null=True)
    # Analysis created
    created_at = models.DateTimeField(auto_now_add=True)
    when_done = models.DateTimeField(null=True)

    def __unicode__(self):
        return self.url_analyzed

    def save(self, *args, **kwargs):
        # Populating analysis ID
        if not self.analysis_id:
            self.analysis_id = generate_hash_id(self.url_analyzed)

        super(AnalysisInfo, self).save(*args, **kwargs)
