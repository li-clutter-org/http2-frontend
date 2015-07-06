#!/bin/bash

# 
# This is a simple "prefix script" that we can use to ensure that 
# commands in the server run with the appropriate set of environment 
# variables in scope.
# 

export HTTP2_LOAD_IMPACT__PROJECT_DIR="/home/ubuntu/http2_loadimpact/"
export PATH="$HTTP2_LOAD_IMPACT__PROJECT_DIR/venv/bin:$PATH"
export PYTHONPATH="$HTTP2_LOAD_IMPACT__PROJECT_DIR/http2"
export DJANGO_SETTINGS_MODULE="settings.staging"
export NEW_RELIC_CONFIG_FILE="$HTTP2_LOAD_IMPACT__PROJECT_DIR/newrelic.ini"
export NEWRELIC_ADMIN="$HTTP2_LOAD_IMPACT__PROJECT_DIR/venv/bin/newrelic-admin"

# And then execute the rest of the arguments
if [ -e  "$NEWRELIC_ADMIN" ] && [ -x "$NEWRELIC_ADMIN" ]  ; then
    $NEWRELIC_ADMIN run-program $@
else
    $@
fi
