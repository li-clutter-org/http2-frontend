
The http2\_loadimpact project
=============================

This README.md lists things you want to know if you want to deploy or *run* the website. Please check below 
for the comments regarding using the manage.py script of Python.

Local setup
-----------

Step 1: Start by customizing your path so that the following
tools are found:

- node, npm, grunt
- virtualenv
- fab (The entry point script of fabric)
- A recent OpenSSL and curl version. There is an easy to setup 
  binary version for Ubuntu 64 bits in a [Trello card](https://trello.com/c/7lgxp6mc/29-recent-curl-is-needed-how-to-install-it).

To customize your path, create a file at project-path/setup/environments  
that just assign values to the environment variables. For example:

    # File /setup/environments/myenv.sh
    PATH=/opt/node10/bin:/opt/openssl-1.0.2/bin:$PATH
    LD_LIBRARY_PATH=/opt/openssl-1.0.2/lib

Then symlink that file to localenv:

    $ ln -s setup/environments/myenv.sh localenv

You can (and should) use your own file for setting up the environment, according
to the way in which you have installed your tools and goodies in your computer.

Step 2: Do "makeenv"

    $ source makeenv

Step 2: Have an automatic bootstrap of the virtualenv

    $ setup/scripts/preliminary.sh

Step 3: Do a local deployment:

    $ fab -f setup/scripts/fabric_local.py local_deploy


You will also need SASS installed somewhere... TODO: Write how to do that in a 
correct way.

Remote setup at Amazon EC2
--------------------------

This one is simpler. You need to have awscli correctly configured to connect to your 
instances, and said instances need to be tagged (take a look to the script setup/scripts/findout_instance-ips.py). Once you have got the instances and they are correctly tagged,

if you need to do a partial deploy, do:

    $ fab -f setup/scripts/fabric_ec2.py refresh_running_state

If you need to do a complete deploy, do:

    $ fab -f setup/scripts/fabric_ec2.py complete_remote_deploy

Running manage.py the easy way
------------------------------

After you do

    $ ln -s setup/environments/my_favourite_environment.sh localenv

if you don't want to set DJANGO\_SETTINGS\_MODULE by hand all the time, you can 
locally use 

    $ ./manage.sh runserver 

or 

    $ ./manage.sh migrate

The wrapper script takes care of setting an environment for the `manage.py`  Django 
script.


Running grunt for generating css in the development environment
---------------------------------------------------------------

    $ grunt sass:build
