/************************************
 * Auth0
 ***********************************/
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
require('dotenv').config();


if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file';
}

/***
 * Using this middleware will require a valid authorization header
 **/
exports.requireAuth = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  credentialsRequired: true,
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

/***
 * Using this middleware will make authorization header optional
 * but if it exists, it will decode it so you have access to the 
 * req.user object
 **/
exports.decodeAuthIfExist = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  credentialsRequired: false,
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

exports.checkEmailVerification = function(req, res, next) {
//  console.log(req.user)
  if( req.user['https://'+process.env.AUTH0_DOMAIN+'/email_verified'] ) {
    return next();
  } else {
    res.status(491).send('unverified email')
  }
}

exports.sendEmailVerification = function(req, res) {
  var userid = req.params.userid;
  
  getMgmtToken()
    .then(function(accessToken) {
//      res.send(accessToken)
      var headers = {
        'Authorization':'Bearer '+accessToken
      }
      var reqBody = {
        'user_id': userid,
        'client_id': process.env.AUTH0_CLIENT_ID
      }
      var options = {
        uri: 'https://'+process.env.AUTH0_DOMAIN+'/api/v2/jobs/verification-email',
        method: 'POST',
        json: true,
        headers: headers,
        body: reqBody,
        json: true
      };
      return rp(options);
    })
    .then(function(body) {
      res.send('ok')
    })
    .catch(function(err) {
      console.error('sendEmailVerification error: '+err);
    })
}

function getMgmtToken() {
  var tokenReqBody = {
    "grant_type": "client_credentials",
    "client_id": process.env.AUTH0_API_CLIENT_ID,
    "client_secret": process.env.AUTH0_API_CLIENT_SECRET,
    "audience": 'https://'+process.env.AUTH0_DOMAIN+'/api/v2/'
  };
  var options = {
    uri: 'https://'+process.env.AUTH0_DOMAIN+'/oauth/token',
    method: 'POST',
    json: true,
    body: tokenReqBody,
    json: true
  };
  
  return rp(options)
    .then(function(bodyRes) {
      if( bodyRes ) {
        return bodyRes.access_token;
      } else {
        return null;
      }
    })
}
