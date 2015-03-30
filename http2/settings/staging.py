from .base import *

from logging.handlers import SysLogHandler

DEBUG = True
TEMPLATE_DEBUG = DEBUG
ALLOWED_HOSTS = ["http2.httptwo.com"]


DATABASES = {
    'default': {
        'ENGINE'     : 'django.db.backends.postgresql_psycopg2',
        'NAME'       : 'http2django',
        'USER'       : 'http2django',
        'PASSWORD'   : '233feeA4af',
        'HOST'       : '127.0.0.1',
        'PORT'       : '5432',
    }
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'syslog':{
            'level':'DEBUG',
            'class':'logging.handlers.SysLogHandler',
            'formatter': 'verbose',
            'facility': SysLogHandler.LOG_LOCAL2,
        },

    },
    'loggers': {
        'django': {
            'handlers':['syslog'],
            'propagate': True,
            'level':'INFO',
        },
        'http2front': {
            'handlers': ['syslog'],
            'propagate': True,
            'level': 'DEBUG',
        },
    },
}