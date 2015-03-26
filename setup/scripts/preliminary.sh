#!/bin/bash
#
# Install a virtualenv and prepares fabric for working.
#
if [ -z "$HTTP2_LOAD_IMPACT__PROJECT_DIR" ]; then
    echo "Please do \"source makeenv\" first"
    exit 1
fi

VENV_DIR="$HTTP2_LOAD_IMPACT__PROJECT_DIR/venv"

# Start by setting up a virtualenv, if none is found...
# If you want to refresh the virtualenv, just delete the folder
# and execute this again.
if ! [ -d "$VENV_DIR" ] ; then
    virtualenv -p /usr/bin/python3 "$VENV_DIR"
    source "$VENV_DIR/bin/activate"
    pip install -r requirements.txt
fi
