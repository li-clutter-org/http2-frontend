import os
import json
import re
from urllib.parse import *
import hashlib
import datetime as dt
from datetime import datetime as datetime
from functools import partial

from django.conf import settings


_extra_re = re.compile(r";.*$")
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
    import wingdbstub
    file_bytes = open(harfile_path, 'rb').read()
    json_data = json.loads(file_bytes.decode("utf-8"))
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

        del_entries_if_possible(
            entry,
            [
                'response',
                'cache',
                'connection',
                'pageref',
            ]
        )

        del_entries_if_possible(
            entry['request'],
            [
                'method',
                'httpVersion',
                'cookies',
                'headers',
                'queryString'
            ]
        )

        # Removing weird URLs, for now allowing just the ones that start with http
        if not str(entry['request']['url']).startswith('http'):
            del entry['request']['url']

        entry['content_type'] = content_type

        clean_entries.append(entry)

    json_data['har']['entries'] = clean_entries

    return json_data


def del_entries_if_possible(entry, titles):
    for t in titles:
        if t in entry:
            del entry[t]


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


def get_har_data_as_json(http1_har_file_path, http2_har_file_path):
    """
    Will:
        - seek for http1 and http2 har files inside result_dir,
        - process the .har file to get just the data we need from the files,

    :param http1_har_file_path: the dir where the http1 .har file.
    :param http1_har_file_path: the dir where the http2 .har file.
    :return: json data of the .har files with the data we need.
    """
    http1_json_data = process_har_file(http1_har_file_path)
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
        parse_started_date_time(tmp_entry)
        for tmp_entry in http1_entries
    ]
    http2_start_times = [
        parse_started_date_time(tmp_entry)
        for tmp_entry in http2_entries
    ]
    http1_global_start_time = min(http1_start_times)
    http2_global_start_time = min(http2_start_times)

    # Add http1 entries
    for entry in http1_entries:
        item = item_template.copy()
        try:
            got_url = entry['request']['url']
        except KeyError:
            continue
        show_form = url2showform(got_url)
        item.update(show_form)
        start_time = (
            parse_started_date_time(entry)
            -
            http1_global_start_time
            ).total_seconds()*1000.0
        http1_dict =  {
                "start_time": start_time,
            }
        http1_dict.update(entry['timings'])

        # print("BBhttp-1", http1_dict['blocked'])

        calc_absolute_points(start_time, http1_dict)
        # Calling this twice, but once should suffice...
        item['content_type'] = trim_content_type(entry['content_type'])
        item.update({
            'http1': http1_dict
        })
        new_json['times'].append(item)


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
                start_time = ( parse_started_date_time(item) - http2_global_start_time).total_seconds()*1000

                http2dict = {
                    "start_time": start_time,
                    "general_time": item['time']
                }
                http2dict.update({k:norm(v) for (k,v) in item["timings"].items()})
                calc_absolute_points(start_time, http2dict)
                entry['http2'] = http2dict

        if not found:
            entry['http2'] = None

    result = []
    timings_1 = []
    timings_2 = []
    for entry in new_json['times']:
        if not isfake(entry['http1']) and not isfake(entry['http2']):
            timings_1.append(entry['http1'])
            timings_2.append(entry['http2'])
            # print("timings-1 to add: ", entry['http1'])
            result.append(entry)
        else:
            # print("Discarded entry for url ", entry)
            pass

    # Use the timings 'http2' list to derive a dependency tree for
    # resource loads. The list below will contain pairs (predecessor_cause, triggered)
    # pairs.
    dependency_tree_as_list = []
    for (i,_) in enumerate(timings_2):
        dependency_tree_as_list.append( search_gaps(i,timings_2) )

    # print("HORROR: ", dependency_tree_as_list)

    # Let's create a fold object
    fold = PropagateF(
        partial(calc_new_begin_ends, timings_1, timings_2),
        (None, 0, 0),
        dependency_tree_as_list
    )
    # and use it
    new_timings_2 = timings_1.copy()
    for (i,tm) in enumerate( new_timings_2 ):
        _idx, new_start, new_end = fold(i)
        ntm = tm.copy()
        if i > 0:
            ntm['start_time'] = new_start

        # There is not much we can do to get a precise simulation of
        # what the sll times would be, but the others we can borrow
        # from the HTTP/1.1 fetch.
        new_total_time = 0
        if ( i > 0):
            ntm['ssl'] = -1
            ntm['dns'] = -1
            ntm['connect'] = -1
        else:
            ntm['ssl'] =  10
            new_total_time += ntm['ssl']
            ntm['dns'] = timings_1[0]['dns']
            new_total_time += ntm['dns']
            ntm['connect'] = timings_1[0]['connect']
            new_total_time += ntm['connect']
        ntm['blocked'] = timings_2[i]['blocked']
        new_total_time += ntm['blocked']
        new_total_time += ntm['send']
        new_total_time += ntm['wait']
        new_total_time += ntm['receive']

        ntm['time'] = new_total_time

        new_timings_2[i] = ntm

        # send, wait and recv times were already copied
        # from timings_1. Now it is just a matter of enhancing
        # with the absolute points
        calc_absolute_points(new_start, ntm)

    for (i,entry) in enumerate(result):
        entry['http2'] = new_timings_2[i]


    new_json['times'] = result
    new_json['effectiveness'] = settings.EFFECTIVENESS(r1, r2, r1r2)

    new_json['max_time'] = max( ( t['start_time'] + t['time'] ) for t in (timings_1+new_timings_2) )

    return new_json


def norm(v):
    if 0.0 <= v < 0.5:
        return 1.0
    else:
        return v


def isfake(entry):
    return entry is None


def parse_started_date_time(at_entry):
    s = at_entry['startedDateTime']
    if s.endswith('Z'):
        s = s[:-1]
    exact_stamp = datetime.strptime(s, "%Y-%m-%dT%H:%M:%S.%f")
    timings = at_entry['timings']
    # Now, if necessary, substract connect, ssl and dns times
    if timings['connect'] != -1:
        exact_stamp -= dt.timedelta(milliseconds=timings['connect'])
    if timings['ssl'] != -1:
        exact_stamp -= dt.timedelta(milliseconds=timings['ssl'])
    if timings['dns'] != -1:
        exact_stamp -= dt.timedelta(milliseconds=timings['dns'])
    return exact_stamp

def calc_absolute_points(starts, t):
    start_receiving = starts
    if t['dns'] != -1:
        start_receiving += t['dns']
    if t['connect'] != -1:
        start_receiving += t['connect']
    if t['ssl'] != -1:
        start_receiving += t['ssl']

    t['starts_sending'] = start_receiving
    start_receiving += t['send']
    start_receiving += t['wait']
    t['starts_receiving'] = start_receiving
    t['ends'] = start_receiving + t['receive']
    if 'start_time' not in t:
        print("start_time not in t")
    t['time'] = t['ends'] - t['start_time']


def search_gaps(i, others_list):
    """ Returns a pair (predecessor,i)"""
    e = others_list[i]
    best_candidate_idx = None
    best_candidate_d = 1e9
    for (j,o) in enumerate(others_list):
        d = e['start_time'] - o['ends']
        if o['ends'] > e['start_time'] > o['starts_receiving']:
            assert( d < 0 )
            if best_candidate_d < 0:
                # The one closer to the tail wins, in this situation
                # where both are overlapping d's
                if d > best_candidate_d:
                    # ^-- for the comparison above, we are talking about negative
                    #     numbers
                    best_candidate_d = d
                    best_candidate_idx = j
            # if old_d is > 0, do not replace it, unless...
            # ... we need to further refine this....
            elif -d < ( o['ends'] - o['start_time'] )/4. :
                best_candidate_d = d
                best_candidate_idx = j
            continue
        if d > 0 :
            if d < best_candidate_d :
                best_candidate_d = d
                best_candidate_idx = j
            continue
    return (best_candidate_idx, i)


def calc_new_begin_ends(timings_1, timings_2,
            prev,
            successor_idx):
    # Gaps will be taken from timings2, since they don't include probably
    # confusing blocked times, but absolute durations will  be taken from
    # timings_1
    (predecessor_idx, predecessor_begins, predecessor_tail) = prev

    pred_timings_1_ends = timings_1[predecessor_idx]['ends'] if predecessor_idx is not None else 0
    pred_timings_2_ends = timings_2[predecessor_idx]['ends'] if predecessor_idx is not None else 0
    succ_timings_1 = timings_1[successor_idx]
    succ_timings_2 = timings_2[successor_idx]
    # Take the gap from the timings of HTTP/2
    # gap_to_predecessor_1 = succ_timings_1['starts_sending'] - pred_timings_1_ends
    gap_to_predecessor_2 = succ_timings_2['starts_sending'] - pred_timings_2_ends
    gap_to_predecessor = gap_to_predecessor_2
    # print("fsfs ", predecessor_idx, successor_idx, predecessor_tail, gap_to_predecessor )
    # This is where the simulated request will start
    successor_begins = gap_to_predecessor + predecessor_tail

    # Now we use the very timings from 1 for the 'send', 'wait' and 'receive'
    # parts
    succ_tail = successor_begins + \
        succ_timings_1['send'] \
        + succ_timings_1['wait'] \
        + succ_timings_1['receive'] \
        + ( succ_timings_1['connect'] if succ_timings_1['connect'] != -1 else 0 ) \
        + ( succ_timings_1['ssl'] if succ_timings_1['ssl'] != 1 else 0) \
        + ( succ_timings_1['dns'] if succ_timings_1['dns'] != 1 else 0)

    return (successor_idx, successor_begins, succ_tail)


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

    if last_name == '//':
        last_name = '/'

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


class PropagateF(object):
    def __init__(self, f, unit, tree_list):
        self.f = f
        self.trigger2origin = {}
        for (origin,trigger) in tree_list:
            self.trigger2origin[trigger] = origin
        self.node2f = {}
        self.unit = unit

    def __call__(self, node):
        # Like an OOP fold
        if node is None:
            return self.unit
        else:
            x = self.node2f.get(node)
            if x is not None:
                return x
            else:
                predecessor = self.trigger2origin[node]
                v_for_predecessor = self(predecessor)
                v = self.f(v_for_predecessor, node)
                self.node2f[node] = v
                return v

    def data_for_node(self, node):
        return self.node2f[node]


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


def get_analysis_progress(result_dir):
    """

    :param result_dir: the dir of the analysis according with the analysis_id
    :return: a dict with the progress info
    """
    progress_file_path = os.path.join(
        result_dir,
        settings.ANALYSIS_RESULTS_PROCESSING_FILE_NAME
    )
    progress_info = open(progress_file_path).read()

    return {'progress': progress_info}  # for now