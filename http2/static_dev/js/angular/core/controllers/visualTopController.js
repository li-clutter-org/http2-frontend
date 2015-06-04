'use strict';

/**
    * @ngdoc object
    * @name http2.controllers:visualTopController
    * @description
    *
**/

angular.module('http2')
    .controller(
        'visualTopController',
        [
          '$scope'
        , '$state'
        , '$location'
        , '$stateParams'
        , 'analyzerService'

        , function($scope, $state, $location, $stateParams, analyzerService) {

            $scope.base_url = $location.protocol() + '://' + $location.host();
            $scope.analysis_id = $stateParams.analysis_id;

            setTimeout(function(){
                $scope.$apply(function(){
                    $scope.http1_time = analyzerService.data.json.max_time;
                    $scope.http2_time = analyzerService.data.json.max_time;
                    $scope.url_analyzed = analyzerService.data.json.url_analyzed;
                    $scope.effectiveness =  analyzerService.data.json.effectiveness;

                });

            }, 2000);

            $scope.show_hide_url = function() {
                 $scope.url_visible = !$scope.url_visible;
            }

        }]);
