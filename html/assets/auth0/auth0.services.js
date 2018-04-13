/**********
 * Auth0 
 *********/

const USER_ACTIVE_UNTIL = {
  pageRefresh: 'localvar',
  sessionExpires: 'sessionStorage',
  forever: 'localStorage'
}

/** For Auth0, you should only use forever **/
const SESSION_PERSISTANCE = USER_ACTIVE_UNTIL.forever;


app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

//app.constant('USER_ROLES', {
//  all: '*',
//  admin: 'admin',
//  editor: 'editor',
//  guest: 'guest'
//});


app.config(['$stateProvider','angularAuth0Provider', 
            function($stateProvider, angularAuth0Provider) {
              
    
  angularAuth0Provider.init({
    clientID: AUTH0_CLIENT_ID,
    domain: AUTH0_DOMAIN,
    responseType: 'token id_token',
//    audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
    audience: AUTH0_AUDIENCE,
    redirectUri: AUTH0_CALLBACK_URL,
    scope: 'openid'
  });
}]);


app.service('AuthService', 
['$state'
,'angularAuth0'
,'$timeout'
,'$window'
,'$location'
,'UserSession'
, function authService($state
                      ,angularAuth0
                      ,$timeout
                      ,$window
                      ,$location
                      ,UserSession
                      ) {

  function login() {
    console.log('track url to redirect to after login: '+$location.path())
    $window.localStorage.setItem('nextPath', $location.path());
    
    angularAuth0.authorize({
      scope:'openid profile email'
    });
  }

  function handleAuthentication() {
    angularAuth0.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        setSession(authResult);
//        $state.go('home');
        var nextPath = $window.localStorage.nextPath;
        console.log('redirecting to '+nextPath);
        if( nextPath ) {
          $location.path(nextPath);
        }
        
      } else if (err) {
        $timeout(function() {
          $state.go('home');
        });
        console.log(err);
        alert('Error: ' + err.error + '. Check the console for further details.');
      }
    });
  }

  function setSession(authResult) {
//      console.log(authResult);
//      let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    var user = {
        userid: authResult.idTokenPayload.sub
      , email: authResult.idTokenPayload.email
      , name: authResult.idTokenPayload.nickname
    }
    UserSession.create(user, authResult.accessToken);
  }

  function logout() {
    UserSession.destroy();
//      $state.go('home');
  }

  function isAuthenticated() {
    // Check whether the current time is past the 
    // access token's expiry time
//      let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
//      return new Date().getTime() < expiresAt;
    return !!UserSession.user;
  }

  return {
    login: login,
    handleAuthentication: handleAuthentication,
    logout: logout,
    isAuthenticated: isAuthenticated
  }
}]);

app.service('UserSession', ['$window',
                            '$rootScope',
                            'AUTH_EVENTS',
  function($window,
           $rootScope,
           AUTH_EVENTS
           ) {
    var user;
    var token;
  
    this.create = function (user, token) {
      switch(SESSION_PERSISTANCE) {
        case USER_ACTIVE_UNTIL.pageRefresh:
          user = user;
          token = token;
          break;
        case USER_ACTIVE_UNTIL.sessionExpires:
          $window.sessionStorage.setItem('user', JSON.stringify(user));
          $window.sessionStorage.setItem('token', JSON.stringify(token));
          break;
        case USER_ACTIVE_UNTIL.forever:
          $window.localStorage.setItem('user', JSON.stringify(user));
          $window.localStorage.setItem('token', JSON.stringify(token));
          break;
      }
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
    };

    this.destroy = function () {
      user = null;
      token = null;
      $window.sessionStorage.removeItem('user');
      $window.sessionStorage.removeItem('token');
      $window.localStorage.removeItem('user');
      $window.localStorage.removeItem('token');
      $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);

    };

    this.getUser = function() {
      switch(SESSION_PERSISTANCE) {
        case USER_ACTIVE_UNTIL.pageRefresh:
          return user;
        case USER_ACTIVE_UNTIL.sessionExpires:
          var user = $window.sessionStorage.user;
          if( user ) {
            user = JSON.parse(user);
          }
          return user;
        case USER_ACTIVE_UNTIL.forever:
          var user = $window.localStorage.user;
          if( user ) {
            user = JSON.parse(user);
          }
          return user;
      }
    }
    
    this.getToken = function() {
      switch(SESSION_PERSISTANCE) {
        case USER_ACTIVE_UNTIL.pageRefresh:
          return token;
        case USER_ACTIVE_UNTIL.sessionExpires:
          var token = $window.sessionStorage.token;
          if( token ) {
            token = JSON.parse(token);
          }
          return token;
        case USER_ACTIVE_UNTIL.forever:
          var token = $window.localStorage.token;
          if( token ) {
            token = JSON.parse(token);
          }
          return token;
      }
    }
  }
])

/************************************
 * Intercepts requests and responses
 * for authentication purpose
 ***********************************/
app.factory('authHandler', [
    '$q'
  , 'UserSession'
  , 'AuthService'
  , function($q
           , UserSession
           , AuthService
           ) {
    return {
      request: function(config) {
        config.headers = config.headers || {};
        var token = UserSession.getToken();
        if( token
        &&  !config.headers.Authorization
        ) {
            config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
      },
      responseError: function(rejection) {
        if (rejection != null && rejection.status === 401) {
          UserSession.destroy();
          AuthService.login();
        }

        return $q.reject(rejection);
      }
    };
}]);

app.config(['$httpProvider',
  function($httpProvider) {  
    $httpProvider.interceptors.push('authHandler');
  }
]);


