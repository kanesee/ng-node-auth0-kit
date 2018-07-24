app.controller('emailUnverifiedCtrl',
  ['$scope'
  ,'$routeParams'
  ,'$http'
  ,'AuthService'
  ,'errorService'
  , controllerFn
  ]);

function controllerFn($scope
                    , $routeParams
                    , $http
                    , AuthService
                    , errorService
                    ) {
  
  var PAGE_ID = 'EMAIL_UNVERIFIED'
  
  $scope.isEmailed = false;
  $scope.userid = $routeParams.userid;
  
  // private vars
  var self = this;

  $scope.resendVerifyEmail = function() {
    $scope.isEmailed = false;
    if( $scope.userid ) {
      var url = '/auth/email/verification/send/' + $scope.userid
              ;
      $http.post(url)
        .then(function(resp) {
          $scope.error = null;
          $scope.isEmailed = true;
        })
        .catch(function(err) {
          $scope.error =
            errorService.handle(err
                              ,PAGE_ID
                              ,'RESEND_VERIFY_EMAIL'
                              ,err.status
                               );
        });
    }
  }
  
  $scope.logIn = function() {
    AuthService.login();
  }
  

}