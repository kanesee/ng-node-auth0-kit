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

In shared folder, copy
- auth.js
- auth.routes.js

In auth.routes.js, modify registerUser() to fit your user model.
You'll need to create a corresponding Post User Registration Hook in Auth0. You can start with this code template:
```
module.exports = function (user, context, cb) {
  var request = require('request');
  
  var url = 'http://YOUR_SERVER:3333/auth/register';
  var data = {
    userid: user.id,
    name: user.username,
    email: user.email
  }
  var options = {
    uri: url,
    method: 'POST',
    json: true,
    headers: {
        "content-type": "application/json",
        },
    body: data
  };
  request(options, function(error, response, body) {
    if( error) {
      console.error(error)
    } else {
      console.log('sucessfully logged registration')
    }    
    cb();

  })
};
```


In server.js, copy the two lines to your server.js file
```
const auth = require('./shared/auth');
app.use('/', require('./shared/auth.routes'));
```


## Angular Side ##

Copy the html/assets/auth0 folder.

Modify auth0.variables.js

Copy html/ng/authCtrl for a template that demonstrates how to manually log in, log out, and display the user name.

