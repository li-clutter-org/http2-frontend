# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AnalysisInfo',
            fields=[
                ('id', models.AutoField(primary_key=True, verbose_name='ID', serialize=False, auto_created=True)),
                ('analysis_id', models.CharField(max_length=60)),
                ('state', models.CharField(default='sent', max_length=6, choices=[('sent', 'Send'), ('failed', 'Failed'), ('done', 'Done')])),
                ('url_analyzed', models.URLField()),
                ('http1_json_data', models.TextField()),
                ('http2_json_data', models.TextField()),
                ('when_done', models.DateTimeField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
