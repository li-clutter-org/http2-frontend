# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_auto_20150317_0655'),
    ]

    operations = [
        migrations.AlterField(
            model_name='analysisinfo',
            name='state',
            field=models.CharField(max_length=10, choices=[('sent', 'Sent'), ('failed', 'Failed'), ('done', 'Done'), ('processing', 'Processing')], default='sent'),
            preserve_default=True,
        ),
    ]
