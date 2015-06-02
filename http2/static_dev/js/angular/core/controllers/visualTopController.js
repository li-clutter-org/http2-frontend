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

        , function($scope, $state, $location, $stateParams) {
            $scope.base_url = $location.protocol() + '://' + $location.host();
            $scope.analysis_id = $stateParams.analysis_id;

            $scope.show_hide_url = function() {
                 $scope.url_visible = !$scope.url_visible;
            }

        }]);
