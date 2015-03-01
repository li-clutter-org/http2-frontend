/**
    * @ngdoc directive
    * @name http2.directives:GrowlAddons
    *
    * @description
    *
    * Extra features for the growl module
**/


angular.module('angular-growl').config(['$provide', function($provide) {
    // we need to add some extra time to live because of the transition
    var extraTtl = Modernizr.csstransforms ? 300 : 0;

    $provide.decorator("growl", ['$delegate', '$rootScope', function($delegate, $rootScope){
        var provider = $delegate;

        provider.removeAllMessages = function(){
            $rootScope.$broadcast('growlRemoveAllMessages');
        };

        provider.removeMessage = function(text) {
            $rootScope.$broadcast('growlRemoveMessage', text);
        };

        return provider;

    }]);

    $provide.decorator("growlDirective", ['$delegate', '$rootScope', '$timeout', function($delegate, $rootScope, $timeout){
        var directive = $delegate[0];
        var arr = directive.controller;
        var lastIndex = arr.length - 1;
        var ctrl = arr[lastIndex];

        arr[lastIndex] = function($scope){
            var index = -1;
            var originalTimeout = _.find(arguments, function(current, currentIndex){
                var condition = current === $timeout;

                if(condition){
                    index = currentIndex;
                };

                return condition;
            });

            // proxy the $timeout provider because we need to associate the timeouts
            // with the messages and we need to log them because we need to
            // cancel/clean them up inside deleteMessage
            if(originalTimeout){
                arguments[index] = function(callback, interval){
                    var newInterval = interval + extraTtl;
                    var timer = originalTimeout.apply(this, [callback, newInterval]);

                    return _.last($scope.messages).time = timer; // we can assume it's the last element in the array because it was just added
                };
            };

            $rootScope.$on('growlRemoveAllMessages', function(){
                angular.forEach($scope.messages, function (msg) {
                    // no we can't use deleteMessage
                    $timeout.cancel(msg.time);
                });

                $scope.messages = [];
            });

            $rootScope.$on('growlRemoveMessage', function (event, text) {
                var match = _.find($scope.messages, function(msg){
                    return text === msg.text;
                });

                if(match){
                    $scope.deleteMessage(match);
                    $timeout.cancel(match.time); // we need to clean these otherwise it can become a big mess
                };
            });

            ctrl.apply(this, arguments);
        };

        return $delegate;
    }]);

}]);
