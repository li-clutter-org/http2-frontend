#!/bin/bash

# She-bang line up is to pacify the IDE, but otherwise counter-producing. This
# script SHOULD NOT be executed as ./script.sh, but sourced instead.

export DJANGO_SETTINGS_MODULE="settings.local_alve"
export PYTHONPATH="$HTTP2_LOAD_IMPACT__PROJECT_DIR/http2"
export HTTP2_LOAD_IMPACT__REMOTE_RESULTS_PATH="/home/ubuntu/mimic/hars"