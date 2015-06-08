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
        , '$timeout'

        , function($scope, $state, $location, $stateParams, $timeout) {

            $scope.base_url = $location.protocol() + '://' + $location.host();
            $scope.analysis_id = $stateParams.analysis_id;

            $scope.noShowText = function(){
                $scope.blur=true;
                $scope.focus=false;
                $scope.url_visible = false;
            }

            function noChange() {
                if ($scope.focus==false && $scope.url_visible==true){
                    $scope.url_visible = false;
                }
            }
            $scope.show_hide_url = function() {
                 $scope.url_visible = !$scope.url_visible;
            }

            $scope.hoverIn = function(){
                $scope.url_visible = true;
                $timeout(noChange, 20000);
            };

        }]);
