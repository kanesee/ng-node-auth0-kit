var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression')
var api = require('./routes/api');

var app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); // to support URL-encoded bodies

// app.use(cors());

app.use(compression());




/*************************
 * Route REST calls
 ************************/

// Auth0
const auth = require('./shared/auth');
// optional Auth0
var authapp = express();
authapp.use(bodyParser.json({limit: '50mb'}));
authapp.use('/', require('./shared/auth.register'));
var authPort = 3334;
authapp.listen(authPort);
console.log('AuthService Listening on port '+authPort);

/**
 * Use this on any page that you want to check if the user is authenticated
 * before showing them the content. You can use this as a way to protect a page
 * though I recommend you just protect the page. This is useful when you have
 * a form on a page in which posting it will require authentication, and you want
 * to check if the user is authenticated before they go through the trouble of 
 * filling out the form just to find out they have to authenticate and it wipes
 * away their input.
 ***/
app.get('/auth/check'
       , auth.checkJwt
       , function(req, res) { res.send('authenticated'); }
       );


app.get('/api/public'
      , api.getPublicStuff);
app.get('/api/protected'
      , auth.checkJwt
      , api.getProtectedStuff);


app.use(express.static(__dirname+'/html'));

/*************************
 * Start Server
 ************************/


var httpPort = 3333;

app.listen(httpPort);

console.log('Listening on port '+httpPort);

