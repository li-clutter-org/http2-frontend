#
#
# Bash script to be sourced as a subroutine file ...

# 
if [ -z "$HTTP2_LOAD_IMPACT__PROJECT_DIR" ] ; then 
    >&2 echo "Ensure that we reach this point with a valid HTTP2_LOAD_IMPACT__PROJECT_DIR environment variable"
fi 

export PATH="$HTTP2_LOAD_IMPACT__PROJECT_DIR/venv/bin":$PATH
export PYTHONPATH="$HTTP2_LOAD_IMPACT__PROJECT_DIR/http2"