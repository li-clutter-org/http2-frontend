angular.module('http2').config(['$stateProvider', '$locationProvider', '$urlRouterProvider',
    function($stateProvider, $locationProvider, $urlRouterProvider) {

    var defaultState = ['$state', function($state){
        $state.go('entry');
    }];

    $urlRouterProvider.when('/', defaultState);

    $urlRouterProvider.when('', defaultState);

    $urlRouterProvider.otherwise('404', ['$state', function($state){
        $state.go('404');
    }]);

    $stateProvider
        .state('entry', {
            url: '/entry/',
            title: "HTTP/2 Goody!",
            views: {
                'mainView': {
                    templateUrl: 'partials/http2/entry.html',
                    controller: 'entryController'
                }
            },
            extras: {
                bodyClass: 'index'
            }
        })
        .state('analysisStatus', {
            url: '/analysis/status/:analysis_id',
            title: 'Analysis status',
            views: {
                'mainView':{
                    templateUrl: 'partials/http2/analyzer.html',
                    controller: 'analyzerController'
                }
            },
            extras: {
                bodyClass: 'index'
            }
        })
        .state('404', {
            url: '/404',
            title: 'Page not found',
            views: {
                'mainView':{
                    templateUrl: 'partials/http2/404.html',
                    controller: '404controller'
                }
            },
            extras: {
                bodyClass: 'errors'
            }
        });
}])
.run(['$rootScope', '$state', '$location', 'growl', function($rootScope, $state, $location, growl) {

    $rootScope.$on("$stateChangeStart", function(event, next){
        growl.removeAllMessages();
    });

    $rootScope.$on("$stateChangeSuccess", function(){
        var currentState = $state.current;

        $rootScope.title = currentState.title;
        $rootScope.bodyClass = currentState.extras.bodyClass;

        if(currentState.name !== '404'){
            sessionStorage.setItem('prevRoute', JSON.stringify({
                name: currentState.name,
                params: $state.params
            }));
        };
    });

}]);
