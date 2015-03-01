'use strict';

/**
    * @ngdoc service
    * @name http2.service:analyzerService
    * @requires http2.service:analyzerService
    *
    * @description
    *
    * Used to send data to the server, and get data once processed.
**/

angular.module('http2')
    .service('analyzerService', ['$http', '$q', '$location', '$state', 'growl', function ($http, $q, $location, $state, growl) {

        var service = {
            analyzer:{
                url: "/api/analyzer",
                redirectUrl: "/results"
            }
        };

        service.requestAnalysis = function(analyzer) {
            /**
                 * @ngdoc method
                 * @name http2.service:analyzerService#requestAnalysis
                 * @methodOf http2.service:analyzerService
                 * @description
                 *
                 * Requests the analysis of the given url.
                 *
                 * @param {string} url The url to analyze
                 * @returns {promise} Resolved when the analysis has been sent.
            **/

            var me = service;

            growl.addInfoMessage('Sending analysis', {ttl: 15000});

            return $http.post(me.analyzer.url, analyzer)
                .then(function(response){
                    analyzer.data = response.data;

                    growl.removeMessage('Sending analysis');
                    growl.addSuccessMessage('Analysis sent', {ttl: 1000});
                });
        };


        return service;

    }]);
