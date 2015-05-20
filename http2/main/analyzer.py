import os
import json
from urllib.parse import *
import hashlib
from datetime import datetime as dt

from django.conf import settings


def process_har_file(harfile_path):
    """
    Will process the .har file, and remove the unneeded info.
    The specs for .har files are here http://www.softwareishard.com/blog/har-12-spec/

    :param harfile_path: absolute path to the .har file
    :return: .har file info in json after the processing.
    """
    file_bytes = open(harfile_path, 'rb').read()
    json_data = json.loads( file_bytes.decode("utf-8") )
    # Cleaning the .har data a bit.
    del json_data['har']['creator']
    del json_data['har']['version']

    entries = json_data['har']['entries']
    clean_entries = []
    for entry in entries:
        del entry['response']
        del entry['cache']
        try:
            del entry['connection']
        except KeyError:
            pass
        del entry['pageref']

        del entry['request']['method']
        del entry['request']['httpVersion']
        del entry['request']['cookies']
        del entry['request']['headers']
        del entry['request']['queryString']
        del entry['request']['headersSize']
        del entry['request']['bodySize']

        # Removing weird URLs, for now allowing just the ones that start with http
        if not str(entry['request']['url']).startswith('http'):
            del entry['request']['url']

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


def update_progress_mock(analysis):
    """
    A mock to update the percent of the progressing to see how the progress bar changes
    and how the states change.

    :param analysis: main.models.AnalysisInfo instance
    :return:
    """
    analysis_result_path = os.path.join(
        settings.ANALYSIS_RESULT_PATH,
        analysis.analysis_id
    )
    status_progress_file_path = os.path.join(
        analysis_result_path,
        settings.ANALYSIS_RESULTS_PROCESSING_FILE_NAME)
    status_progress_file = open(status_progress_file_path, 'r')
    # print(status_progress_file.read())
    value = int(status_progress_file.read()) + settings.PROGRESS_PERCENT
    status_progress_file.close()

    status_progress_file = open(status_progress_file_path, 'w')
    status_progress_file.write(str(value))
    status_progress_file.close()


def format_json(http1_json, http2_json):
    """
    This utility formats the json data to make it suitable for the UI.
    :return something like
        {
            effectiveness: 0.87,
            times:[
            {
            path:'/main.css',
            http1: [0,1,6,7,14],
            http2: [0,1,3,5,9]
            },
            {
            path:'/styles.css',
            http1: [3,4,8,9,21],
            http2: [5,4,5,6,15]
            },
            {
            path:'/scripts',
            http1: [2,3,6,7,16],
            http2: [1,3,5,9,17]
            },
            {
            path:'/routings.js',
            http1: [6,1,1,2,4],
            http2: [7,2,1,1,4]
            }
            ]
        }
    """
    item_template = {
        'path': '',
        'domain': ''
    }
    new_json = {
        'times': []
    }

    # This is for the effectiviness formula
    r1, r2, r1r2 = len(http1_json['har']['entries']), len(http2_json['har']['entries']), 0

    http1_entries = http1_json['har']['entries']
    http2_entries = http2_json['har']['entries']
    all_entries = http1_entries + http2_entries
    http1_start_times = [
        dt.strptime(tmp_entry['startedDateTime'][:-1], "%Y-%m-%dT%H:%M:%S.%f")
        for tmp_entry in http1_entries
    ]
    http2_start_times = [
        dt.strptime(tmp_entry['startedDateTime'][:-1], "%Y-%m-%dT%H:%M:%S.%f")
        for tmp_entry in http2_entries
    ]
    http1_global_start_time = min(http1_start_times)
    http2_global_start_time = min(http2_start_times)

    # Add http1 entries
    for entry in http1_entries:
        item = item_template.copy()
        try:
            parsed_url = urlparse(entry['request']['url'])
        except KeyError:
            continue
        item['path'] = parsed_url.path
        item['domain'] = parsed_url.netloc
        http1_dict =  {
                "start_time": (dt.strptime(entry['startedDateTime'][:-1], "%Y-%m-%dT%H:%M:%S.%f") - http1_global_start_time)
                    .total_seconds()*1000.0
            }
        http1_dict.update(entry['timings'])
        item.update({
            'http1': http1_dict
        })
        new_json['times'].append(item)

    # Add http2 entries
    for entry in new_json['times']:
        found = False
        for item in http2_entries:
            try:
                parsed_url = urlparse(item['request']['url'])
            except KeyError:
                continue
            if entry['path'] == parsed_url.path and entry['domain'] == parsed_url.netloc:
                r1r2 += 1
                found = True
                http2dict = {
                    "start_time": (dt.strptime(item['startedDateTime'][:-1], "%Y-%m-%dT%H:%M:%S.%f") - http2_global_start_time)
                        .total_seconds()*1000,
                    "general_time": item['time']
                }
                http2dict.update(item["timings"])
                entry['http2'] = http2dict
        if not found:
            entry['http2'] = None

    result = []
    for entry in new_json['times']:
        if not isfake(entry['http1']) and not isfake(entry['http2']):
            result.append(entry)

    new_json['times'] = result
    new_json['effectiveness'] = settings.EFFECTIVENESS(r1, r2, r1r2)

    return new_json


def isfake(entry):
    return entry is None


def fit_times(json_times):
    times = json_times['times']
    new_list = []
    for item in times:
        # uniqify the list
        if item['path'] not in filter(lambda e: e['path'], new_list):
            # replace http2 times
            item['http2'][1] = item['http1'][1]
            item['http2'][2] = item['http1'][2]
            item['http2'][3] = item['http1'][3]
            item['http2'][4] = item['http1'][4]
            new_list.append(item)
    # sort by http1 start time
    json_times['times'] = sorted(new_list, key=lambda i: i['http1'][0])
    return json_times

