app.controller('authCtrl',
  ['$scope'
  , 'AuthService'
  , 'AUTH_EVENTS'
  , 'UserSession'
  , controllerFn
  ]);

function controllerFn($scope
                    , AuthService
                    , AUTH_EVENTS
                    , UserSession
                    ) {
  $scope.error = null;
  
  // private vars
  var self = this;
  
  this.init = function() {
    $scope.user = UserSession.getUser();
    
    $scope.$on(AUTH_EVENTS.loginSuccess, function() {
      console.log('receive loginSucess: ');
      $scope.user = UserSession.getUser();
    });
    
    $scope.$on(AUTH_EVENTS.logoutSuccess, function() {
      console.log('receive logoutSucess');
      $scope.user = null;
    })
  }
  
  $scope.logIn = function() {
    AuthService.login();
  }

  $scope.logOut = function() {
    AuthService.logout();
  }
  
  this.init();
}