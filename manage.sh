#!/bin/bash

##### STANDARD snippet to have something good to run the project with... ##########
current_dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
export HTTP2_LOAD_IMPACT__PROJECT_DIR=$current_dir
# Bring other environment variables onboard
source $HTTP2_LOAD_IMPACT__PROJECT_DIR/setup/scripts/prepare_local_environ.sh
# Bring deployment specific environment variables onboard 
source  "$HTTP2_LOAD_IMPACT__PROJECT_DIR/localenv"
####################################################################################

python $HTTP2_LOAD_IMPACT__PROJECT_DIR/http2/manage.py $@