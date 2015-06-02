#!/usr/bin/env python
#
# This script keeps a local path synchronized with remote contents from the server instance.
# This is needed so that we can see in the locally running Django application analysis results.
#
import paramiko
import os
import os.path
import json
import sys
import subprocess as sp
import threading
import django
from functools import partial

django.setup()
from django.conf import settings


# The number of seconds to wait for an event before triggering...
PAUSE_TO_TRIGGER = 1.0

# Global state
project_dir = None
server_ip = None


def fetch_server_ip():
    instance_ips_json = sp.check_output([
        "python2", # <-- Python 2 is needed here
        os.path.join(project_dir, "setup/scripts/findout_instance_ips.py")
    ])
    instance_ips = json.loads(instance_ips_json.decode("utf-8"))
    return instance_ips["serversInstance"]


class SyncWorker(object):
    def __init__(self, local_dir, remote_dir):
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.load_system_host_keys()
        client.connect(
            server_ip,
            username="ubuntu",
            key_filename=os.environ["HTTP2_LOAD_IMPACT__SSH_KEY"]
            )
        self._client     = client 
        self._remote_dir = remote_dir 
        self._local_dir  = local_dir

        # Threads
        self._watcher = threading.Thread(target=self._wait_for_remote_changes)
        self._watcher.start()
        self._waker = None

        # Finishing?
        self._finishing = False
        self._trigger()

    def _wait_for_remote_changes(self):
        client = self._client
        stdin, stdout, stderr = client.exec_command(
            'inotifywait -r -m -e modify,create,close_write,delete {0}'.format(self._remote_dir),
            bufsize=1, # <-- Line buffering.... 
            )
        stderr_reporter_thread = threading.Thread(
            target = partial(self._watch_stderr, stderr) )
        stderr_reporter_thread.start()
        for line in stdout:
            # print(line)
            # Got a line, activate the alarm
            if isinstance(self._waker, threading.Timer):
                self._waker.cancel()
            self._waker = threading.Timer(PAUSE_TO_TRIGGER, self._trigger)
            self._waker.start()

    def _watch_stderr(self, stderr):
        for line in stderr:
            print(line)

    def join(self):
        self._watcher.join()

    def _trigger(self):
        # So, do an rsync....
        cmd = [
            "rsync", "-avz",
            "-e", "ssh -i {0}".format(os.environ["HTTP2_LOAD_IMPACT__SSH_KEY"]),
            "ubuntu@" + server_ip+":" + self._remote_dir + "/*",
            self._local_dir
        ]
        sp.check_call(cmd)


def main():
    global project_dir, server_ip
    if "HTTP2_LOAD_IMPACT__PROJECT_DIR" not in os.environ:
        print("ERROR: Could not find HTTP2_LOAD_IMPACT__PROJECT_DIR... (did you forget to source makeenv?)",
              file=sys.stderr)
        exit(2)

    project_dir = os.environ["HTTP2_LOAD_IMPACT__PROJECT_DIR"]
    server_ip = fetch_server_ip()

    print("Remote dir:  ", os.environ["HTTP2_LOAD_IMPACT__REMOTE_RESULTS_PATH"])
    print("Local dir: ", settings.ANALYSIS_RESULT_PATH)

    sync_worker = SyncWorker(
        local_dir = settings.ANALYSIS_RESULT_PATH,
        remote_dir = os.environ["HTTP2_LOAD_IMPACT__REMOTE_RESULTS_PATH"]
    )
    sync_worker.join()


if __name__ == "__main__":
    main()
