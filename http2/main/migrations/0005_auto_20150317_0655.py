# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_auto_20150317_0654'),
    ]

    operations = [
        migrations.AlterField(
            model_name='analysisinfo',
            name='when_done',
            field=models.DateTimeField(null=True),
            preserve_default=True,
        ),
    ]
