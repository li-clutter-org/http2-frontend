'use strict';

/**
    * @ngdoc object
    * @name http2.controllers:analyzerController
    * @description
    *
    * Used for the index page.
**/

 angular.module('http2')
    .controller('analyzerController', ['$scope', '$rootScope', '$interval', 'analyzerService',
         function($scope, $rootScope, $interval, analyzerService){

    var stopInterval = function() {
        $interval.cancel($scope.interval);
        $scope.interval = null;
    };

    var startInterval = function(){
        var analysis_data = $scope.analysis.data;
        stopInterval();

        $scope.interval =  $interval(function() {
            analyzerService.getAnalysisState(analysis_data).then(function(response) {
                $scope.analysis.data = analysis_data.data;
                if($scope.analysis.data.state === 'done' || $scope.analysis.data.state === 'failed'){
                    stopInterval();
                };
            });
        }, 10000);
    };

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
            if (analysis_data.data.state === 'sent' || analysis_data.data.state === 'processing') {
                startInterval();
            }
        });
    };

    $scope.$on('$stateChangeSuccess', stopInterval);
    $scope.$on('$destroy', stopInterval);

}]);
