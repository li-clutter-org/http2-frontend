'use strict';

/**
    * @ngdoc object
    * @name http2.controllers:analyzerController
    * @description
    *
    * Used for the index page.
**/

 angular.module('http2')
    .controller('analyzerController', ['$scope', 'analyzerService', function($scope, analyzerService){

         $scope.send = function() {
            /**
                 * @ngdoc method
                 * @name http2.controllers:analyzerController
                 * @methodOf http2.controllers:analyzerController
                 * @description
                 *
                 * Requests analysis
            **/

            var analysis_data = $scope.analysis.data;

            analyzerService.requestAnalysis(analysis_data).then(function(response) {
                $scope.analysis.data = analysis_data.data;
            });
        };

    }]);
