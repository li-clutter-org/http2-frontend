import hashlib

from django.db import models


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
    http1_json_data = models.TextField()
    # data for http 2 request
    http2_json_data = models.TextField()
    # Analysis created
    created_at = models.DateTimeField(auto_now_add=True)
    when_done = models.DateTimeField()

    def __unicode__(self):
        return self.url_analyzed

    def save(self, *args, **kwargs):
        # populating analysis ID
        # It will be a md5 (URL, moment the analysis starts) for now,
        # until we agree the final salt for
        # TODO: check Alcides code to generate that, because it should be the same idea
        # to generate the same code from both apps, the python one, and the haskel one...
        self.analysis_id = hashlib.md5(
            (
                self.url_analyzed  #+ self.created.strftime("%Y%m%d%M%S%f")
            )
            .encode('utf-8')).hexdigest()
        super(AnalysisInfo, self).save(*args, **kwargs)
