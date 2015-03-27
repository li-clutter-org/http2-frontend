"""
This deploys the server at our remote instance

"""


from __future__ import with_statement, print_function
from fabric.api import local, settings, abort, run, sudo, cd, hosts, env, execute, lcd
from fabric.contrib.console import confirm
from fabric.operations import put, get
from fabric.contrib.project import rsync_project
import re
import os
import subprocess as sp 
import os.path 
from StringIO import StringIO
from findout_instance_ips import findout_instance_ips



LOCAL_FILES_TO_SYNC = [
    "Gruntfile.js",
    "makeenv",
    "newrelic.ini",
    "package.json",
    "README.md",
    "requirements.txt",
    "SNIPPETS.md"
]


EC2_REMOTE_DIR="/home/ubuntu/http2_loadimpact"

POSTGRESQL_PASSWORD = "233feeA4af"

if "HTTP2_LOAD_IMPACT__PROJECT_DIR" not in os.environ:
    print("** Could not find HTTP2_LOAD_IMPACT__PROJECT_DIR, maybe you need "
          "   to do `source makeenv` first")
else:
	local_project_dir = os.environ["HTTP2_LOAD_IMPACT__PROJECT_DIR"]


hosts_list = [ "ubuntu@" + findout_instance_ips()["serversInstance"] ]
env["hosts"] = hosts_list

# TODO: Put a proper deployment mechanism here.
env.key_filename = '/home/alcides/.ssh/zunzun_ec2_keypair_0.pem'

current_dir = os.path.dirname(os.path.realpath(__file__))


def _rsync_subdirs(*subdirs):
	for subdir_name in subdirs:
		rsync_project(
			local_dir = os.path.join( local_project_dir, subdir_name),
			remote_dir = os.path.join(EC2_REMOTE_DIR,    os.path.dirname(subdir_name))
			)


def rsync_subdirs():
	_rsync_subdirs("conf", "http2", "run", "setup")


def rsync_resources():
	with lcd(local_project_dir):
		for filename in  LOCAL_FILES_TO_SYNC:
			put(
				local_path  = filename, 
				remote_path = EC2_REMOTE_DIR
				)
		put(
			local_path = "setup/scripts/staging_run.sh",
			remote_path = "/usr/bin/env_run",
			use_sudo = True 
			)
		sudo("chmod ugo+x /usr/bin/env_run")


def run_preliminary_script():
	with cd(EC2_REMOTE_DIR):
		run(
			"setup/scripts/preliminary.sh \"{0}\"".format(EC2_REMOTE_DIR)
		)


def config_supervisord():
	with lcd(local_project_dir):
		put(
			local_path="setup/scripts/supervisord_upstart.conf",
			remote_path="/etc/init/supervisord.conf",
			use_sudo=True
		)
		put(local_path="setup/scripts/supervisord_ec2.conf", 
			remote_path = os.path.join(
				EC2_REMOTE_DIR, 
				"setup/scripts/supervisord_ec2.conf"
				)
			)
	sudo("service supervisord restart")


def install_node():
	# sudo("sudo apt-get update")
	sudo("sudo apt-get install -y nodejs npm")
	# For some reason we need a symbolic link
	sudo("ln -s `which nodejs` /usr/local/bin/node")


def install_global_python_packages():
	sudo("apt-get install -y python-pip python-virtualenv python-dev python3-dev")
	sudo("pip install supervisor --pre")


def install_newrelic_agent():
	sudo("env_run pip install newrelic")


def install_nginx():
	sudo("apt-get install nginx")


def configure_nginx():
	with lcd(local_project_dir):
		put(
			local_path  = "conf/prod/vhost.conf",
			remote_path = "/etc/nginx/sites-available/http2django.conf",
			use_sudo = True
		)
	# Do a symlink
	sudo("ln -sf /etc/nginx/sites-available/http2django.conf /etc/nginx/sites-enabled/http2django.conf")
	sudo("service nginx restart")


def create_empty_directories():
	"Logs ..."
	run("mkdir -p /home/ubuntu/logs/")
	# Specific logs for Nginx
	run("mkdir -p /home/ubuntu/logs/http2_prod/")
	run("mkdir -p /home/ubuntu/logs/supervisord/")

def install_ruby_pieces():
	sudo("gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3")
	sudo("curl -sSL https://get.rvm.io | bash -s stable")
	sudo("rvm install ruby-2.0.0-p598")
	sudo("rvm --default use 2.0")
	sudo("gem install sass")


def grunt():
    "Executes Grunt"
    with cd(EC2_REMOTE_DIR):
        run("grunt build")


def install_grunt():
    "Installs grunt"
    with cd(EC2_REMOTE_DIR):
        sudo("npm install -g grunt-cli")
        sudo("npm install")


def complete_remote_deploy():
	hosts_list = [
		findout_instance_ips()["serversInstance"]
	]
	print( "Proceeding with hosts_list: {0}".format(hosts_list) )
	with settings(hosts=hosts_list):
		install_node()
		install_postgresql()
		create_empty_directories() # <-- Logging information for example
		install_ruby_pieces()
		rsync_resources()
		run_preliminary_script()
		install_global_python_packages()
		install_nginx()
    	install_grunt()
    	grunt()
    	install_newrelic_agent()
    	config_supervisord()
    	configure_nginx()


def collect_static():
	with cd(EC2_REMOTE_DIR):
		run("env_run python http2/manage.py collectstatic --noinput")


def syncdb():
	with cd(EC2_REMOTE_DIR):
		run("env_run python http2/manage.py syncdb")


def resetdb():
	with cd(EC2_REMOTE_DIR):
		sudo("""sudo -u postgres psql -U postgres -d postgres -c "DROP DATABASE http2django ;" """
	    )
		sudo("""sudo -u postgres psql -U postgres -d postgres -c "CREATE DATABASE http2django WITH OWNER = http2django;" """
	    )

def install_postgresql():
	sudo("sudo apt-get install -y postgresql postgresql-contrib postgresql-client libpq-dev")


def configure_postgresql():
	sudo("""sudo -u postgres psql -U postgres -d postgres -c "alter user postgres with password '{0}';" """.format(
		POSTGRESQL_PASSWORD)
	)
	sudo("""sudo -u postgres psql -U postgres -d postgres -c "CREATE USER http2django with password '{0}';" """.format(
		POSTGRESQL_PASSWORD)
	)
	sudo("""sudo -u postgres psql -U postgres -d postgres -c "CREATE DATABASE http2django WITH OWNER = http2django;" """
	)

def refresh_running_state():
	hosts_list = [
		findout_instance_ips()["serversInstance"]
	]
	print( "Proceeding with hosts_list: {0}".format(hosts_list) )
	with settings(hosts=hosts_list):
		rsync_subdirs()
		rsync_resources()
		# The one below also happens to trigger a restart of the services...
    	config_supervisord()
    	grunt()
    	collectstatic()