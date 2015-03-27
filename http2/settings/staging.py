from .base import *

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