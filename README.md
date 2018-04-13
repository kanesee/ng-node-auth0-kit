# angular-nodejs-auth0 starter kit


## Auth0 side ##

Create an account.

Create a new Client
 - Select Single-Page Web Applications
 - note the Domain, Client ID (you'll need these later)
 - add a Callback URL to http://YOUR_SERVER/callback

Create a new API
 - give it an Identifier and note it (you'll need it later)
 - signing algorithm: RS256

## Node Side ##

Copy "sample.env" to ".env" and modify the values to your Auth0 app

In server.js, copy these lines to your server.js file
```
// Auth0
const auth = require('./shared/auth');

// optional Auth0 user registration
var authapp = express();
authapp.use(bodyParser.json({limit: '50mb'}));
authapp.use('/', require('./shared/auth.routes'));
var authPort = 3334;
authapp.listen(authPort);
console.log('AuthService Listening on port '+authPort);

// optional Auth0 authentication check
app.get('/auth/check'
       , auth.checkJwt
       , function(req, res) { res.send('authenticated'); }
       );
```
The first optional piece includes an endpoint to register user users into your app. If you do not need to know about new users, and just trust that auth0 users are legitimate, then you can leave it out.
If you choose to include the user registration then note that the reason we serve the auth0 routes on a separate port is because the user registration cannot be protected. The hook you're about to include below has no way to including authentication info during the user registration process. So you must use firewall rules to protect this endpoint specifically. We separate it out so that it's easier to firewall that port since there's no way to firewall an endpoint.

The second optional piece is useful when you have
a form on a page in which posting it will require authentication, and you want
to check if the user is authenticated before they go through the trouble of 
filling out the form just to find out they have to authenticate and it wipes
away their input as it redirects them to login.

In shared folder, copy
- auth.js
- auth.routes.js

In auth.routes.js, modify registerUser() to fit your user model.
You'll need to create a corresponding Post User Registration Hook in Auth0. You can start with the code template in sample.hook.js. Make sure to modify the url.



## Angular Side ##

Copy the html/assets/auth0 folder.

Modify auth0.variables.js

Copy html/ng/authCtrl for a template that demonstrates how to manually log in, log out, and display the user name.

