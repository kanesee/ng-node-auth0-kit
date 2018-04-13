var app = angular.module('app',
            ['ngRoute'
            ,'ui.router'
            ,'ui.bootstrap'
            ,'auth0.auth0'
            ]);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/ng/home/template.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
]);

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
  
  /// Comment out the line below to run the app
  // without HTML5 mode (will use hashes in routes)
//  $locationProvider.html5Mode(true);  
}]);

