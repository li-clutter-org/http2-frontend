import os
import json
import re
from urllib.parse import *
import hashlib
from datetime import datetime as dt

from django.conf import settings


_extra_re = re.compile(r";[a-z ]*$")
def trim_content_type(content_type):
    extra = re.search( _extra_re,  content_type)
    if extra:
        return content_type[:extra.start(0)]
    else:
        return content_type

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
        try:
            response_headers=normalize_headers(entry['response']['headers'])
            content_type = response_headers['content-type']
        except KeyError:
            content_type = "application/octet-stream"

        content_type = trim_content_type( content_type )

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
        # del entry['request']['headersSize']
        # del entry['request']['bodySize']

        # Removing weird URLs, for now allowing just the ones that start with http
        if not str(entry['request']['url']).startswith('http'):
            del entry['request']['url']

        entry['content_type'] = content_type

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

    general_times = []
    start_times = []

    # Add http1 entries
    for entry in http1_entries:
        item = item_template.copy()
        try:
            got_url = entry['request']['url']
        except KeyError:
            continue
        show_form = url2showform(got_url)
        item.update(show_form)
        start_time = (dt.strptime(entry['startedDateTime'][:-1], "%Y-%m-%dT%H:%M:%S.%f")
            - http1_global_start_time).total_seconds()*1000.0
        http1_dict =  {
                "start_time": start_time,
            }
        http1_dict.update(entry['timings'])
        # Calling this twice, but once should suffice...
        item['content_type'] = trim_content_type(entry['content_type'])
        item.update({
            'http1': http1_dict
        })
        new_json['times'].append(item)
        general_times.append(entry['time'])

    # Add http2 entries
    for entry in new_json['times']:
        found = False
        for item in http2_entries:
            try:
                got_url = item['request']['url']
            except KeyError:
                continue
            show_form = url2showform(got_url)
            if entry['begin'] == show_form['begin'] and entry['end'] == show_form['end']:
                r1r2 += 1
                found = True
                start_time = (dt.strptime(item['startedDateTime'][:-1], "%Y-%m-%dT%H:%M:%S.%f") - http2_global_start_time).total_seconds()*1000
                start_times.append(start_time)
                http2dict = {
                    "start_time": start_time,
                    "general_time": item['time']
                }
                http2dict.update({k:norm(v) for (k,v) in item["timings"].items()})
                entry['http2'] = http2dict
            general_times.append(item['time'])
        if not found:
            entry['http2'] = None

    result = []
    for entry in new_json['times']:
        if not isfake(entry['http1']) and not isfake(entry['http2']):
            result.append(entry)

    new_json['times'] = result
    new_json['effectiveness'] = settings.EFFECTIVENESS(r1, r2, r1r2)

    new_json['max_time'] = max(general_times) + max(start_times)

    return new_json


def norm(v):
    if 0.0 <= v < 0.5:
        return 1.0
    else:
        return v

def isfake(entry):
    return entry is None


def url2showform(url):
    """Transforms a url to a hash ready to show at the client.

    For example:

    url2showform("https://zunzun.slack.com/messages/@slackbot/sucker?al=1#excel-=1")

    should give

    { "begin": "zunzun.slack.com/messages/@slackbot/", "end": "sucker?al=1#excel-=1" }

    """
    import urllib.parse as u
    parsed_form = u.urlparse(url)
    pth = parsed_form.path
    splitted_pth = pth.split("/")
    first_names = "/".join(splitted_pth[:-1])
    last_name = splitted_pth[-1]
    if last_name == "":
        first_names = "/".join(splitted_pth[:-2])
        last_name = "/" + splitted_pth[-2] + "/"

    return {
        "begin":
            parsed_form.netloc + first_names,

        "end": #
            last_name
            + (
                ("?" + parsed_form.query)
                if parsed_form.query != "" else ""
              )
            + (
                ("#" + parsed_form.fragment)
                if parsed_form.fragment != "" else ""
              )

    }


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


def normalize_headers(headers_as_in_har):
    # Headers in  a .har file are a list of name/value pairs,
    # Let's convert them to a simple dictionary
    result = dict()
    for small_d in headers_as_in_har:
        header_name = small_d['name'].lower()
        result[header_name] = small_d['value']

    return result