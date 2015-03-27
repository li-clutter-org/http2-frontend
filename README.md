
The http2\_loadimpact project
=============================

Local setup
-----------

Step 1: Start by customizing your path so that the following
tools are found:

- node, npm, grunt
- virtualenv
- fab (The entry point script of fabric).

To customize your path, create a file at project-path/setup/environments  
that just assign values to the environment variables. For example:

    # File /setup/environments/alve.sh
    PATH=/opt/node10/bin:$PATH

Then symlink that file to localenv:

    $ ln -s setup/environments/alve.sh localenv

You can (and should) use your own file for setting up the environment, according
to the way in which you have installed your tools and goodies in your computer.

Step 2: Do "makeenv"

    $ source makeenv

Step 2: Have an automatic bootstrap of the virtualenv

    $ scripts/preliminary.sh

Step 3: Do a local deployment:

    $ fab -f setup/scripts/fabric_local.py local_deploy