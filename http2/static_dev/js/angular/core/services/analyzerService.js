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
            send_analysis:{
                url: "/api/send/analysis",
                redirectUrl: "/results"
            }
        };

        service.requestAnalysis = function(analysis) {
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
            console.log(analysis)

            return $http.post(me.send_analysis.url, analysis)
                .then(function(response){
                    analysis.data = response.data;

                    growl.removeMessage('Sending analysis');
                    growl.addSuccessMessage('Analysis sent', {ttl: 1000});
                });
        };

        service.getAnalysisState = function(analysis) {
            var url = '/api/get/analysis/state/' + analysis.analysis_id;
            return $http.get(url)
                .then(function(response){
                    analysis.data = response.data;
                });
        };


        return service;

    }]);
