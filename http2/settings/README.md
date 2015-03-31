# This directory contains the settings files for all environments

settings files to follow the pattern described in the Two Scoops book.

## The various settings files

This directory will eventually contain:

 * `base.py` -- the general settings that applies across all environments.
 * `local.py` -- the settings that are the same across all developers' local environments.
 * `prod.py` -- the environment specific settings for production.
 * `tests.py` -- the settings specific for running the unit tests.

Additionally, there will be a range of `local_SOMENAME.py` files, that contains settings specific to the environment of each developer (e.g. `local_vlad.py` for Vladir's personal settings).

## Import hierarchy

`local.py`, `prod.py`, and `tests.py` all start by importing `base.py`, followed by environment specific settings. Your local settings file _must_ start by including `local.py`, followed by your local settings. Please refrain from importing `local.py` at the end of the file.

## Your own setting

For your local development needs, add your own settings file in this directory and call it `local_YOURNAME.py` -- you can use another personal, local settings for reference.

Having personal settings files under revision is good, as it makes it a lot easier to fix your own settings based on the settings file of someone else, e.g. if another developer added a new setting that you otherwise weren't aware of.

## Running Django

Our `manage.py` (and other files that similarly automatically detects the settings file to use) have been altered to detect the proper settings file _only_ based on the `DJANGO_SETTINGS_MODULE` environment variable. If this is not defined, an exception will be raised (i.e. not even the `--settings` flag for `manage.py` will work).

For your local development use, `DJANGO_SETTINGS_MODULE` should be set to something like `settings.local_YOURNAME`.

There are a range of different ways to set the environment variable. Some are listed here, the first one probably being the best way.

 * In your `virtualenv`, there is a file called `bin/activate`. This file is sourced when you activate your virtual environment. Define your `DJANGO_SETTINGS_MODULE` in here (i.e. by `export DJANGO_SETTINGS_MODULE="settings.local_YOURNAME"`), and it will automatically be set whenever you activate your virtual environment. On Windows, this should be added to the end of `bin/activate.bat`: `setx DJANGO_SETTINGS_VARIABLE settings.local_YOURNAME`.
 * In your terminal, run `export DJANGO_SETTINGS_MODULE="settings.local_YOURNAME"` once, and the environment variable will be set for the rest of this terminal session.
 * When running `manage.py` commands, prefix it with a definition of the environment variable, e.g `DJANGO_SETTINGS_MODULE=settings.local_YOURNAME python manage.py [options]`. This will set the environment variable only while this specific command is run. This may be useful even when using one of the other methods, as a way of using a different settings file just once (e.g. to use the test settings to run the unit tests).
