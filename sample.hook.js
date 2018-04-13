/*****
 * This is an Auth0 Post User Registration Hook sample.
 * Use this if you want Auth0 to send your app a request
 * when a new user signs up. You'll need to incorporate
 * the corresponding auth.register.js file
 *****/
module.exports = function (user, context, cb) {
  var request = require('request');
  
  var url = 'http://YOUR_SERVER:3334/auth/register';
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