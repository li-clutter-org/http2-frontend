from .base import *

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# The same dir as MEDIA_ROOT
# for local environments.
ANALYSIS_RESULT_PATH = MEDIA_ROOT

# Analyzer URL: http2 server coded in Haskell
ANALYZER_URL = "http://127.0.0.1:8000/api/analyzer/mocking"
PROGRESS_PERCENT = 50

# Logging...
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
        'console':{
            'level':'DEBUG',
            'formatter': 'simple',
            'class': "logging.StreamHandler",
            'stream': 'ext://sys.stdout'
        },

    },
    'loggers': {
        'django': {
            'handlers':['console'],
            'propagate': True,
            'level':'WARNING',
        },
        'http2front': {
            'handlers': ['console'],
            'propagate': True,
            'level': 'DEBUG',
        },
    },
}
