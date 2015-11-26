from .local import *

# Analyzer URL: http2 server coded in Haskell
#ANALYZER_URL = "https://10.20.30.40:1070/setnexturl/"
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
