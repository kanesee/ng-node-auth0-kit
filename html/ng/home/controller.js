app.controller('homeCtrl',
  ['$scope'
  ,'$http'
  ,homeCtrl
  ]);

function homeCtrl($scope
                , $http
                      ) {
  $scope.error = null;
  $scope.message = null;
    
  // private vars
  var self = this;
  
  // private functions
  this.init = function() {

  }
  
  // scope functions
  
  $scope.getPublicStuff = function() {
    $http.get('/api/public')
      .then(function(res) {
        $scope.message = res.data;
      })
  }
 
  $scope.getProtectedStuff = function() {
    $http.get('/api/protected')
      .then(function(res) {
        $scope.message = res.data;
      })
  }
  
  this.init();
}