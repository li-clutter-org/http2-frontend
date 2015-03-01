'use strict';

/**
    * @ngdoc directive
    * @name http2.directives:svgFallback
    * @restrict C
    * @description
    *
    * Swaps SVG images with png fallbacks if svg is not supported
**/

angular.module('http2').directive('svgFallback', ['modernizr', function(modernizr){

    if(modernizr.svg) return {};

    return {
        restrict:'A',
        link: function(scope, element, attrs){
            element.attr('src', attrs.svgFallback);
        }
    }
}]);
