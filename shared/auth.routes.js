var express = require('express');
var dbp = require('../shared/db-promise.js');
const router = express.Router();
const auth = require('./auth');

/**
 * Use this on any page that you want to check if the user is authenticated
 * before showing them the content. You can use this as a way to protect a page
 * though I recommend you just protect the page. This is useful when you have
 * a form on a page in which posting it will require authentication, and you want
 * to check if the user is authenticated before they go through the trouble of 
 * filling out the form just to find out they have to authenticate and it wipes
 * away their input.
 ***/
router.get('/auth/check'
       , auth.checkJwt
       , function(req, res) { res.send('authenticated'); }
       );

router.post('/auth/register'
//        , auth.checkJwt
        , registerUser);

/***************************************
 * Register user with hashed password
 **************************************/
function registerUser(req, res) {
  var userid = req.body.userid;
  var username = req.body.name;
  var email = req.body.email;

  var sql = 'INSERT INTO user(userid,username,email) VALUES(?,?,?)';
  dbp.pool.query(sql, [userid, username, email])
    .then(function(result) {
      res.send('registered');
    })
    .catch(function(err) {
      if( err.code == 'ER_DUP_ENTRY' ) {
        res.status(409).send('UserId already taken');
      } else {
        console.log('failed registerUser');

        res.writeHead(500, {'Content-Type':'text/plain'});
        res.end(err);
      }
    });
}

module.exports = router;