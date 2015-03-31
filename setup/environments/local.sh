export DJANGO_SETTINGS_MODULE="settings.local_alve"
export PYTHONPATH="$HTTP2_LOAD_IMPACT__PROJECT_DIR/http2"
export PATH=/opt/node10/bin:$PATH

# This is the remote path where results are stored.. This is useful for
# deployment: you set this environment variable and let the /run/sync.py
# script to run. The script then synces files to the local computer, using
# the directory provided in the settings module, by the setting ANALYSIS_RESULT_PATH
export HTTP2_LOAD_IMPACT__REMOTE_RESULTS_PATH="/home/ubuntu/mimic/hars"