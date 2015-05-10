'use strict';

/**
    * @ngdoc object
    * @name http2.controllers:entryController
    * @description
    *
    * Used for the landing page: there is a text-entry box, but no 
    * contents yet....
**/

angular.module('http2')
    .controller(
        'entryController',
        [
          '$scope'
        , '$state'
        , 'analyzerService'

        , function($scope, $state, analyzerService) 
        {

            $scope.send = function() {
                /**
                     * @ngdoc method
                     * @name http2.controllers:entryController
                     * @methodOf http2.controllers:entryController
                     * @description
                     *
                     * Requests analysis
                **/

                var analysis_data = $scope.analysis.data;
                // No state at this point.
                $scope.analysis.data.state = null;

                analyzerService.requestAnalysis(analysis_data).
                    success(function(data, status, headers, config) {
                        // Updating the scope, and stopping the polling properly if the response is a success.
                        $scope.analysis.data = data;
                        if($scope.analysis.data.state === 'sent' || $scope.analysis.data.state === 'processing') {
                            $state.go("analysisStatus", {
                                "analysis_id": $scope.analysis.data.analysis_id
                            });
                        };
                    }).
                    error(function(data, status, headers, config) {
                        $scope.analysis.data = data;
                    });
            };

            $scope.analysis = {
                "data": {
                    "state": null,
                    "url_analyzed": null
                }
            }

        }]
    );