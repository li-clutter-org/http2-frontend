import hashlib

from django.db import models


class AnalysisInfo(models.Model):
    STATE_SEND = 1
    STATE_FAILED = 2
    STATE_DONE = 3
    STATE_CHOICES = (
        (STATE_SEND, 'Send'),
        (STATE_FAILED, 'Failed'),
        (STATE_DONE, 'Done')
    )
    analysis_id = models.CharField(max_length=60, editable=False)
    # state of the analysis
    state = models.IntegerField(choices=STATE_CHOICES, default=STATE_SEND)
    # URL analyzed
    url_analyzed = models.URLField()
    # data for http 1 request
    http1_json_data = models.TextField()
    # data for http 2 request
    http2_json_data = models.TextField()
    # Analysis created
    created_at = models.DateTimeField(auto_now_add=True)
    # TODO: this is the moment the analysis is done (status==STATE_DONE)?
    when_done = models.DateTimeField()

    def __unicode__(self):
        return self.url_analyzed

    def save(self, *args, **kwargs):
        # populating analysis ID
        # It will be a md5 (URL, moment the analysis starts) for now,
        # until we agree the final salt for
        self.analysis_id = hashlib.md5(
            (
                self.url_analyzed  #+ self.created.strftime("%Y%m%d%M%S%f")
            )
            .encode('utf-8')).hexdigest()
        super(AnalysisInfo, self).save(*args, **kwargs)