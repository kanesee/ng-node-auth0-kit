app.controller('authRequiredCtrl',
  ['$scope'
  , 'AuthService'
  , controllerFn
  ]);

function controllerFn($scope
                    , AuthService
                    ) {

  // private vars
  var self = this;

  $scope.logIn = function() {
    AuthService.login();
  }

}