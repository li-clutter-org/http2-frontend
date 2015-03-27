'use strict';

/**
    * @ngdoc directive
    * @name http2.directives:d3Chars
    * @restrict C
    * @description
    *
    * Swaps SVG images with png fallbacks if svg is not supported
**/

angular.module('http2').directive('d3Chars', [function() {

    return {
        restrict:'EA',
        link: function(scope, element, attrs) {
            d3.select("#timechart").call(d3.timechart(scope.analysis.data.json));
        }
    }
}]);
