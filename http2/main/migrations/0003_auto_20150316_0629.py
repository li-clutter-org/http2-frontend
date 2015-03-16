# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_auto_20150315_2255'),
    ]

    operations = [
        migrations.AlterField(
            model_name='analysisinfo',
            name='state',
            field=models.CharField(max_length=10, choices=[('sent', 'Sent'), ('failed', 'Failed'), ('done', 'Done')], default='sent'),
            preserve_default=True,
        ),
    ]
