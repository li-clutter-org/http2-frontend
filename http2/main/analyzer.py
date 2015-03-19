import os
import json
from urllib.parse import *
import hashlib

from django.conf import settings


def process_har_file(harfile_path):
    """
    Will process the .har file, and remove the unneeded info.
    The specs for .har files are here http://www.softwareishard.com/blog/har-12-spec/

    :param harfile_path: absolute path to the .har file
    :return: .har file info in json after the processing.
    """
    json_data = json.loads(open(harfile_path, 'r').read())
    # Cleaning the .har data a bit.
    del json_data['har']['creator']
    del json_data['har']['version']

    entries = json_data['har']['entries']
    clean_entries = []
    for entry in entries:
        del entry['response']
        del entry['cache']
        del entry['connection']
        del entry['pageref']

        del entry['request']['method']
        del entry['request']['httpVersion']
        del entry['request']['cookies']
        del entry['request']['headers']
        del entry['request']['queryString']
        del entry['request']['headersSize']
        del entry['request']['bodySize']

        clean_entries.append(entry)

    json_data['har']['entries'] = clean_entries

    return json_data


def generate_hash_id(url):
    """
    url_example_1 = "https://recursive.overflow.data/developer/phase?" \
    "includes=developer&deviation=for%20network%20data&ethernet=recognition#potentiometer-developer"
    u1 = urlparse(url_example_1)
    # u1 -> ParseResult(scheme='https', netloc='recursive.overflow.data', path='/developer/phase', params='', query='includes=developer&deviation=for%20network%20data&ethernet=recognition', fragment='potentiometer-developer')
    transcoded_example = urlunparse(["snu"]+list(u1[1:]))
    # transcoded_example -> 'snu://recursive.overflow.data/developer/phase?includes=developer&deviation=for%20network%20data&ethernet=recognition#potentiometer-developer'
    salt = "Adfafwwf"
    code = (hashlib.md5((salt+transcoded_example).encode('ascii')).hexdigest())[:10]
    # code -> '93497cb179'

    :param url: the url from where the hash_id will be generated
    :return: the md5 hash generated from the salt + url
    """
    u1 = urlparse(url)
    transcoded_url = urlunparse(["snu"] + list(u1[1:]))

    return (hashlib.md5((settings.HASH_ID_SECRET_SALT + transcoded_url).encode('ascii')).hexdigest())[:10]


def get_har_data_as_json(result_dir):
    """
    Will:
        - seek for http1 and http2 har files inside result_dir,
        - process the .har file to get just the data we need from the files,

    :param result_dir: the dir where the .har files are stored.
    :return: json data of the .har files with the data we need.
    """
    http1_har_file_path = os.path.join(result_dir, settings.HTTP1_HAR_FILENAME)
    http1_json_data = process_har_file(http1_har_file_path)

    http2_har_file_path = os.path.join(result_dir, settings.HTTP2_HAR_FILENAME)
    http2_json_data = process_har_file(http2_har_file_path)

    return http1_json_data, http2_json_data
