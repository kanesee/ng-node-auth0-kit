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

  function init() {
    console.log('authService init');
    angularAuth0.checkSession({
        scope:'openid profile email'
      },
      function (err, authResult) {
        var redirectToNextPath = false;
        _handleAuthentication(err, authResult, redirectToNextPath)
      });
  }
  init();

  function login() {
    var path = $location.path();
    if( path.indexOf('/auth-required') == -1
    &&  path.indexOf('/email-unverified') == -1 ) {
      console.log('track url to redirect to after login: '+path)
      $window.localStorage.setItem('nextPath', path);
    }
    
    angularAuth0.authorize({
      scope:'openid profile email'
    });
  }

  function handleAuthentication() {
    angularAuth0.parseHash(function(err, authResult) {
      var redirectToNextPath = true;
      _handleAuthentication(err, authResult, redirectToNextPath)
    });
  }
  
  function _handleAuthentication(err, authResult, redirectToNextPath) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        setSession(authResult);
        if( redirectToNextPath ) {
          var nextPath = $window.localStorage.nextPath;
          console.log('redirecting to '+nextPath);
          if( nextPath ) {
            $location.path(nextPath);
          }
        }        
      } else if (err) {
        // console.error(err);
        if( err.errorDescription
        &&  err.errorDescription.indexOf('Please verify your email before logging in.') === 0 ) {
          var userid = err.errorDescription.substring(err.errorDescription.indexOf('[')+1)
          userid = userid.substring(0, userid.length-1);
//          console.log('userid: '+userid);
          $location.url('/email-unverified/'+userid);
        } else
        if( err.error == 'login_required' ) {
          console.log('No auth0 logins found');
        } else {
          console.log(err);
          alert('Error: ' + err.error + '. Check the console for further details.');
        }
      }
  }


  function setSession(authResult) {
//      console.log(authResult);
    let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
    console.log('auth expires at '+expiresAt)
    var user = {
        userid: authResult.idTokenPayload.sub
      , email: authResult.idTokenPayload.email
      , name: authResult.idTokenPayload.nickname
      , expiresAt: expiresAt
    }
    UserSession.create(user, authResult.accessToken);
  }

  function logout() {
    UserSession.destroy();
    
    var currentUrl = window.location.href;
    console.log(currentUrl)
    window.location.href ='https://'+AUTH0_DOMAIN+'/v2/logout'
                         +'?client_id='+AUTH0_CLIENT_ID
                         +'&returnTo='+currentUrl
                         ;
    
  }

  function isAuthenticated() {
    return !!UserSession.getUser();
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
      var thisUser = null;
      switch(SESSION_PERSISTANCE) {
        case USER_ACTIVE_UNTIL.pageRefresh:
          thisUser = user;
          break;
        case USER_ACTIVE_UNTIL.sessionExpires:
          thisUser = $window.sessionStorage.user;
          if( thisUser ) {
            thisUser = JSON.parse(thisUser);
          }
          break;
        case USER_ACTIVE_UNTIL.forever:
          thisUser = $window.localStorage.user;
          if( thisUser ) {
            thisUser = JSON.parse(thisUser);
          }
          break;
      }
      if( thisUser
      &&  thisUser.expiresAt > new Date().getTime()) {
        return thisUser;
      } else {
        this.destroy();
        return null;
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
  , '$location'
  , '$window'
  , 'UserSession'
  , 'AuthService'
  , function($q
           , $location
           , $window
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
          var path = $location.path();
          if( path.indexOf('/auth-required') == -1
          &&  path.indexOf('/email-unverified') == -1 ) {
            console.log('track url to redirect to after login: '+path)
            $window.localStorage.setItem('nextPath', path);
          }
          $location.url("/auth-required");
        }

        if (rejection != null && rejection.status === 491) {
          $location.url("/email-unverified");
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


