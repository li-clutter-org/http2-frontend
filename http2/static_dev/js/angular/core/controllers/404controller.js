'use strict';

/**
    * @ngdoc object
    * @name http2.controllers:404controller
    * @description
    *
    * Used for the 404 page. Gets the last resolved route
    * for sessionStorage and set's the "Go back" link to it
**/

 angular.module('http2')
    .controller('404controller', ['$scope', function($scope){
        var data = JSON.parse(sessionStorage.getItem('prevRoute'))

        $scope.data = data;
    }]);
