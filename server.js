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
app.use('/', require('./shared/auth.routes'));

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

