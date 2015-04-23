
// Ensure that bootstrap doesn't happen before all the modules have been loaded....
document.addEventListener("DOMContentLoaded", function() {
        angular.bootstrap(document, ['http2']);  }, false );