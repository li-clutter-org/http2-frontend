# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_auto_20150316_0629'),
    ]

    operations = [
        migrations.AlterField(
            model_name='analysisinfo',
            name='http1_json_data',
            field=models.TextField(null=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='analysisinfo',
            name='http2_json_data',
            field=models.TextField(null=True),
            preserve_default=True,
        ),
    ]
