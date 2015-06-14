'use strict';

/**
    * @ngdoc object
    * @name http2.controllers:analyzerController
    * @description
    *
    * Used for the index page.
**/

 angular.module('http2')
    .controller(
        'analyzerController',
        [
          '$scope'
        , '$stateParams'
        , '$location'
        , '$rootScope'
        , '$interval'
        , 'analyzerService'

        , function($scope, $stateParams, $location, $rootScope, $interval, analyzerService)
        {

            var base_url = $location.protocol() + '://' + $location.host(),
                analysis_id = null;

            var stopInterval = function() {
                $interval.cancel($scope.interval);
                $scope.interval = null;
            };

            var startInterval = function() {
                check_scope_analysis_data();
                var analysis_data = $scope.analysis.data;
                stopInterval();

                $scope.interval = $interval(function() {
                    getAnalysisState(analysis_data.analysis_id);

                }, 10000);
            };

            var getAnalysisState = function(analysis_id) {
                analyzerService.getAnalysisState(analysis_id)
                    .then(
                        // Then part
                        function(data, status, headers, config) {
                            // Updating the scope, and stopping the polling properly if the response is a success.
                            $scope.analysis.data = data;
                            $rootScope.analysis = $scope.analysis;
                            if($scope.analysis.data.state === 'done' || $scope.analysis.data.state === 'failed' || $scope.analysis.data.state === 'queuefull'){
                                stopInterval();
                            }
                        },
                        // Failure part...
                        function(data, status, headers, config) {
                            // Stopping the polling if the response was an error and setting the state as failed.
                            if(!$scope.analysis) {
                                $scope.analysis = {
                                'data': {
                                    'state': 'failed'
                                    }
                                }
                            }
                            else {
                                $scope.analysis.data.state = 'failed'
                            }
                            stopInterval();
                        }
                    );
            };

            $scope.$on('$stateChangeSuccess', function(e) {
                stopInterval();
                analysis_id = $stateParams.analysis_id;

                if (analysis_id) {
                    $rootScope.analysis = {};
                    check_scope_analysis_data();
                    // We just arrived here, so let's be sure we
                    // fetch the rest of the data from somewhere.
                    getAnalysisState(analysis_id);
                    startInterval();
                }
            });

            var check_scope_analysis_data = function() {
                if($scope.analysis || !$scope.analysis.data) {
                    $scope.analysis = {
                        'data': {
                            'analysis_id': analysis_id,
                            'state': 'processing'
                        },
                        'base_url': base_url
                    }
                }
            };

            $scope.$on('$destroy', stopInterval);

            $scope.$watch('analysis.data.analysis_id', function(newValue, oldValue) {
                if ($scope.analysis) {
                    if (!$scope.analysis.base_url) {
                        $scope.analysis['base_url'] = base_url;
                    }
                }

            }, true);

}]);
