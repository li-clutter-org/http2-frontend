#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    if not os.environ.get('DJANGO_SETTINGS_MODULE'):
        raise Exception('Please define the environment variable ' \
            'DJANGO_SETTINGS_MODULE. Set it to something like: '
            'settings.local_YOURNAME.py')
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.unknown")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)