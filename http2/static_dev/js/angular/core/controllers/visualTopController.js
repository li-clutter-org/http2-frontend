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
<<<<<<< HEAD
        , '$timeout'
        , 'analyzerService'

        , function($scope, $state, $location, $stateParams, $timeout, analyzerService) {
=======

        , function($scope, $state, $location, $stateParams) {
>>>>>>> 28dbb0983ae4437cc757a4fc3c3b483c285324b9

            $scope.base_url = $location.protocol() + '://' + $location.host();
            $scope.analysis_id = $stateParams.analysis_id;

<<<<<<< HEAD
            $scope.noShowText = function(){
                $scope.blur=true;
                $scope.focus=false;
                $scope.url_visible = false;
            }

            function noChange() {
                if ($scope.focus==false && $scope.url_visible==true){
                    $scope.url_visible = false;
                }
=======
            $scope.show_hide_url = function() {
                 $scope.url_visible = !$scope.url_visible;
>>>>>>> 28dbb0983ae4437cc757a4fc3c3b483c285324b9
            }

            $scope.hoverIn = function(){
                $scope.url_visible = true;
                $timeout(noChange, 20000);
            };

        }]);
