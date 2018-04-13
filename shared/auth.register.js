/******
 * Include this if you want to register new users into your app
 *
 * Make sure to edit the registerUser() function below to fit your user model.
 *****/

var express = require('express');
var dbp = require('../shared/db-promise.js');
const router = express.Router();


router.post('/auth/register'
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