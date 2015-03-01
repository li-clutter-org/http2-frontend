'use strict';

angular.module('http2').config(['$interpolateProvider', '$httpProvider', '$locationProvider', 'growlProvider',
    function ($interpolateProvider, $httpProvider, $locationProvider, growlProvider) {

    $interpolateProvider.startSymbol("{[{");
    $interpolateProvider.endSymbol("}]}");

    growlProvider.globalTimeToLive(10000);
    growlProvider.globalEnableHtml(false);
    growlProvider.onlyUniqueMessages(true);

    $locationProvider.html5Mode(!!(window.history && history.pushState));

    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';

    $httpProvider.interceptors.push(['$q', function($q){
        var growl = growlProvider.$get();

        return {
            request: function(config){
                if(config.url.indexOf('partials/') > -1){
                    config.url = '/static/' + config.url;
                };

                return config;
            },
            responseError: function(response){
                var status = response.status;

                growl.removeAllMessages();

                if(!response.config.silenceGrowl){
                    if(status === 500){
                        growl.addErrorMessage('Internal server error');
                    }
                    else if(status === 408){
                        growl.addErrorMessage('Request timeout');
                    }
                    else if(status === 405){
                        growl.addErrorMessage('Not allowed');
                    }
                    else if(status === 404){
                        growl.addErrorMessage('Not found');
                    }
                    else if(status === 403){
                        growl.addErrorMessage('Forbidden');
                    }
                    else{
                        growl.addErrorMessage('Generic error');
                    };
                };

                return $q.reject(response);
            }
        }
    }]);

}])
.run(['$location', '$rootScope', 'modernizr', function($location, $rootScope, modernizr) {
    if(modernizr.touch){
        FastClick.attach(document.body);
    };

    if(!$location.$$html5){
        // fixes the router on browsers w/o HTML5 History API
        // it still leaves the old url inside, but at least
        // the routing works
        $rootScope.$on("$locationChangeStart", function() {
            var loc = window.location;

            if(!loc.hash){
                $location.path(loc.pathname);
            };
        });
    };

    $rootScope.$on('$stateChangeSuccess', function(){

        requestAnimationFrame(function(){
            window.scroll(0, 0);
        });
    });
}]);
