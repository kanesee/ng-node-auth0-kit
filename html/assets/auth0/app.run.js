(function () {

  'use strict';

  app
    .run(run);

  run.$inject = ['AuthService'];
    
  function run(authService) {
    // Handle the authentication
    // result in the hash
    authService.handleAuthentication();
  }

})();