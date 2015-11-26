"""
Django settings for http2 project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import logging

BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    "rest_framework",

    # Custom
    'main',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'main.middlewares.RenderBaseMiddleware',
    'main.middlewares.ExceptionLoggingMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",

    # Custom context processors
    "main.context_processors.debug_set",
)

ROOT_URLCONF = 'http2.urls'

WSGI_APPLICATION = 'wsgi.application'

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/
# static media
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_DIR = os.path.join(BASE_DIR, 'static_dev')
STATICFILES_DIRS = (STATIC_DIR,)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# user uploaded files
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

STATIC_URL = '/static/'

# Template settings
# ===============
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

TEMPLATE_DIRS = (
    os.path.join(BASE_DIR, 'templates'),
)

# TODO: perhaps we should do that actually secret, and set this as
# an environment valirable, and change this code by the real one.
HASH_ID_SECRET_SALT = "Adfafwwf"
# This is the path that will share the analyzer and the Django app
# to share the .har files.
ANALYSIS_RESULT_PATH = ''

# Name of the files to know the analysis result status
ANALYSIS_RESULTS_DONE_FILE_NAME = 'status.done'
ANALYSIS_RESULTS_FAILED_FILE_NAME = 'status.failed'
ANALYSIS_RESULTS_PROCESSING_FILE_NAME = 'status.processing'

# Analyzer URL: http2 server coded in Haskell
ANALYZER_URL = "http://www.reddit.com/r/haskell/"

# TODO: we should agree a name for http1, and http2 .har files
# to identify which data is about http1, and which is about http2
# I will use "http1.har", and "http2.har" for now.
HTTP1_HAR_FILENAME = "harvested.har"
HTTP2_HAR_FILENAME = "test_http2.har"

# Location of a curl executable which is recent enough to use
# HTTP/2. This is a base setting that should be overrided in
# other settings files. Notice that you may even need to run
# curl with an enhanced LD_LIBRARY_PATH, the setting is just
# below
RECENT_CURL_BINARY_LOCATION = "/opt/openssl-1.0.2/bin/curl"
OPENSSL_LD_LIBRARY_PATH = "/opt/openssl-1.0.2/lib"

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
            'class': logging.StreamHandler,
        },

    },
    'loggers': {
        'django': {
            'handlers':['console'],
            'propagate': True,
            'level':'DEBUG',
        },
        'http2front': {
            'handlers': ['console'],
            'propagate': True,
            'level': 'DEBUG',
        },
    },
}

EFFECTIVENESS = lambda r1, r2, r1r2: round(1 - 2 * (max(r1, r2) - r1r2) / (r1 + r2), 2)

QUEUEFULL_STATUS_CODE = '505'
