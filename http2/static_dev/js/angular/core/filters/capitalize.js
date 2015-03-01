'use strict';

angular.module('http2').filter('capitalize', function(){
  /**
      * @ngdoc filter
      * @name http2.filters:capitalize
      * @function
      * @description
      *
      * Capitalizes the supplied string
  **/

  return function(text){

    if(text){
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return text;
  };
});
