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
    .service(
        'analyzerService', 
        [
          '$http'
        , '$q'
        , '$location'
        , 'growl'
         
        , function ($http, $q, $location, growl) 
        {
            var service = {
                send_analysis:{
                    url: "/api/send/analysis"
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

                return $q(
                    function(resolve, reject) {
                        $http.post(me.send_analysis.url, analysis).then(
                            function (response) {
                                growl.removeMessage('Sending analysis');
                                growl.addSuccessMessage('Analysis sent', {ttl: 1000});
                                resolve(response);
                            }, reject);
                    }
                );
            };

            service.getAnalysisState = function(analysis_id) {
                /**
                 * Returns a promise
                 */
                var url = '/api/get/analysis/state/' + analysis_id;
                return $http.get(url);
            };

            return service;

        }
    ]);
