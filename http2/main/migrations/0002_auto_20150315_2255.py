# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.utils.timezone import utc
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='analysisinfo',
            name='created_at',
            field=models.DateTimeField(default=datetime.datetime(2015, 3, 15, 22, 55, 13, 838862, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='analysisinfo',
            name='analysis_id',
            field=models.CharField(editable=False, max_length=60),
            preserve_default=True,
        )
    ]
