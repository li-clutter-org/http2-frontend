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
                return $http.post(me.send_analysis.url, analysis);
            };

            service.getAnalysisState = function(analysis_id) {
                /**
                 * Returns a promise
                 */
                var url = '/api/get/analysis/state/' + analysis_id;
                var p = $http.get(url);
                var q = $q(function (resolve, reject) {
                    p.success(function(data, status, headers, config){
                        service.computeSummaries(data["json"]);
                        resolve(data, status, headers);
                    });
                    p.error(function(data, status, headers, config){
                        reject(data, status, headers, config);
                    });
                });
                return q;
            };

            function compute_median_on_view(view_function, d)
            {
                // Let's hope there is at least a length in d
                var element_count = d.length;
                var result_array = [];
                for( var i=0; i < element_count ; i++)
                {
                    // Oh jesus this is primitive.... loops!
                    // what age is this !??!? .... I want to go
                    // back to the future!!
                    var point = d[i];
                    result_array.push(
                        [view_function(point),point]
                    );
                }
                result_array.sort(function(a,b){ return a[0]<b[0];});
                if ( result_array.length > 1)
                    return result_array[element_count%2][1];
                else
                    return result_array[0][1];
            }

            service.computeSummaries = function(json)
            {
                var times = json["times"];
               // `times` is some nested data with this structure:

                //times: [{domain: "", content_type: "text/html",…}, {domain: "", content_type: "text/javascript",…},…]
                //0: {domain: "", content_type: "text/html",…}
                //    begin: "stackoverflow.com/questions/5886275"
                //    content_type: "text/html"
                //    domain: ""
                //    end: "print-a-stack-trace-to-stdout-on-errors-in-django-while-using-manage-py-runserve"
                //    http1: {blocked: 0, send: 0.06700004450970454, starts_receiving: 129.11300000269, ssl: -1,…}
                //    http2: {blocked: 0.698000018019229, send: 0.06700004450970454, connect: 39.9229999748059, ssl: 10,…}
                //    path: ""

                // This function takes the times and computes the medians ....

                // Of course if there is no data, I can't calculate anything.
                if (times == null)
                    return ;

                var view_timing_1 = function(x) {
                    var t = x["http1"];
                    return ( t["start_time"] + t["ends"] ) / 2.0 ;
                };

                var view_timing_2 = function(x) {
                    var t = x["http2"];
                    return ( t["start_time"] + t["ends"] ) / 2.0 ;
                };

                var median_http_1 = compute_median_on_view(view_timing_1, times);
                var median_http_2 = compute_median_on_view(view_timing_2, times);

                json['summary'] = {
                    'medians': {
                        'http1': median_http_1,
                        'http2': median_http_2
                    }
                };
            };

            return service;

        }
    ]);
