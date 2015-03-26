__author__ = 'alcides'


from fabric.api import *
import os


if "HTTP2_LOAD_IMPACT__PROJECT_DIR" not in os.environ:
    print("** Could not find HTTP2_LOAD_IMPACT__PROJECT_DIR, maybe you need "
          "   to do `source makeenv` first")

def grunt():
    "Executes Grunt"
    with lcd(os.environ.get("HTTP2_LOAD_IMPACT__PROJECT_DIR")):
        local("grunt build")

def install_grunt():
    "Installs grunt"
    with lcd(os.environ.get("HTTP2_LOAD_IMPACT__PROJECT_DIR")):
        local("npm install")



def local_deploy():
    execute(install_grunt)
    execute(grunt)
