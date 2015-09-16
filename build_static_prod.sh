#!/bin/bash

#  I... can't understand Gruntfile's. Because you need to understand about a truckload
#  of "options", one for each tool, and then the syntax for input and output files, 
#  and then to have some sort of idea of how everything works together. 
#
#  So, for now, I'm going with this shell-script to put things in production.
#

UGLIFY_COMMAND="uglifyjs --compress --mangle --screw-ie8"

function separator()
{
    echo "---------------------------------------------------------------------"
    echo $1
    echo "---------------------------------------------------------------------"
}

# {{{
USED_JS_FILES=("js/lib/modernizr.js" \
        "js/lib/underscore-min.js" \
        "js/lib/Promise.js" \
        "js/lib/sprintf.js" \
        "js/lib/jquery-1.11.3.js" \
        "js/lib/jquery.main.js" \
        "js/lib/bootstrap.js" \
        \
        "js/lib/angular.js" \
        "js/lib/angular-ui-router.js" \
        "js/lib/angular-animate.js" \
        "js/lib/angular-cookies.js" \
        "js/lib/angular-sanitize.js" \
        "js/lib/angular-growl.js" \
        "js/lib/angular-route.js" \
        "js/lib/angular-touch.js" \
        "js/lib/angular-messages.js" \
        "js/lib/angular-social-links.js" \
        \
        "js/angular/core/app.js" \
        "js/angular/core/config.js" \
        "js/angular/core/routes.js" \
        \
        "js/angular/core/filters/capitalize.js" \
        \
        "js/angular/core/services/modernizr.js" \
        "js/angular/core/services/analyzerService.js" \
        \
        "js/angular/core/controllers/404controller.js" \
        "js/angular/core/controllers/analyzerController.js" \
        "js/angular/core/controllers/entryController.js" \
        "js/angular/core/controllers/visualTopController.js" \
        "js/angular/core/controllers/visualTopControllerIdle.js" \
        \
        "js/angular/core/directives/monkey-patches/growlAddons.js" \
        "js/angular/core/directives/fallbacks/svgFallback.js" \
        "js/angular/core/directives/d3_chars.js" \
        \
        "js/timechart.js" \
    )
# }}}

#-----------------------------------------------------------------------------------
separator "SASS"
sass --style=nested http2/static_dev/css/sass/config.scss http2/static_dev/build/css/style.css

#-----------------------------------------------------------------------------------
separator "UGLIFY"
$UGLIFY_COMMAND http2/static_dev/js/lib/d3.js -o http2/static_dev/build/js/d3.js

for js_file in ${USED_JS_FILES[*]}
do 
    output="http2/static_dev/build/$js_file"
    output_dir=`dirname $output`
    mkdir -p $output_dir
    $UGLIFY_COMMAND "http2/static_dev/$js_file" -o $output
done

#-----------------------------------------------------------------------------------
separator "IMAGES"
mkdir -p http2/static_dev/build/images/
rsync -avz http2/static_dev/images/* http2/static_dev/build/images/

#------------------------------------------------------------------------------------
# We keep our javascript dependencies in a list
cp "http2/static_dev/js/d3.json"      "http2/static_dev/build/js/d3.json"
cp "http2/static_dev/js/general.json" "http2/static_dev/build/js/general.json"
