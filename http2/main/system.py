#
# Alcides Viamontes Esquivel
#  Zunzun AB
#  www.zunzun.se
#
#  Copyright LoadImpact AB 
#  
#


import os
from django.conf import settings


def getopenssl_env():
    """
    Returns a dictionary of environment variables which
    brings into shell scope a farily recent version of curl and of
    openssl.

    Apt to use as the env argument of the subprocess.Popen function .

    :return: dict
    """

    d = os.environ.copy()
    d.update ({
        'PATH':             settings.RECENT_CURL_BINARY_LOCATION + ":" + d['PATH'],
        'LD_LIBRARY_PATH' : settings.OPENSSL_LD_LIBRARY_PATH
    })

    return d