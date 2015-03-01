'use strict';

/**
     * @ngdoc service
     * @name http2.service:modernizr
     * @description
     *
     * Injectable proxy of the global Modernizr object
**/

angular.module('http2').provider('modernizr', [function(){
    var modernizr = window.Modernizr;

    this.$get = function(){
        return modernizr;
    };
}]);
