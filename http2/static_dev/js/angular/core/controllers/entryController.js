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

                analyzerService.requestAnalysis(analysis_data).then(function(response) {
                    $scope.analysis.data = analysis_data = response;
                    if (analysis_data.data.state === 'sent' || analysis_data.data.state === 'processing') {
                        //startInterval();
                        $state.go("analysisStatus", {
                            "analysis_id": analysis_data.data.analysis_id
                        });
                    }
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