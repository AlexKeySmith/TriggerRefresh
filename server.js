
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , passport = require('passport')
  , util = require('util')
  , OpenIDStrategy = require('passport-openid').Strategy
  , passportSocketIo = require("passport.socketio")
  , io = require('socket.io').listen(server);


    
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the OpenID identifier is serialized and
//   deserialized.
passport.serializeUser(function(user, done) {
  done(null, user.identifier);
});

passport.deserializeUser(function(identifier, done) {
  done(null, { identifier: identifier });
});

// Use the OpenIDStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier), and invoke a callback
//   with a user object.
passport.use(new OpenIDStrategy({
    returnURL: 'http://triggerrefresh.alexkey.c9.io/auth/openid/return',
    realm: 'http://triggerrefresh.alexkey.c9.io/'
  },
  function(identifier, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's OpenID identifier is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the OpenID identifier with a user record in your database,
      // and return that user instead.
      return done(null, { identifier: identifier })
    });
  }
));


// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'mooomomasdoiasdoiha' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
});



io.set("authorization", passportSocketIo.authorize({
    key: 'express.sid', //the cookie where express (or connect) stores its session id.
    secret: 'mooomomasdoiasdoiha', //the session secret to parse the cookie
    store: express.sessionStorage, //the session store that express uses
    fail: function(data, accept) { // *optional* callbacks on success or fail
        accept(null, false); // second param takes boolean on whether or not to allow handshake
    },
    success: function(data, accept) {
        accept(null, true);
    }
}));
  

//'verify', // Verification URL (yours) 'http://triggerrefresh.azurewebsites.net/verify'

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

    
// POST /auth/openid
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in OpenID authentication will involve redirecting
//   the user to their OpenID provider.  After authenticating, the OpenID
//   provider will redirect the user back to this application at
//   /auth/openid/return
app.post('/auth/openid', 
  passport.authenticate('openid', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


// GET /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/openid/return', 
  passport.authenticate('openid', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


io.sockets.on('connection', function (socket) {
  socket.emit('connected');
  socket.on('refresh', function (data) {
    console.log("refresh: " + data);
    socket.broadcast.emit("refresh");
  });
});

app.listen(process.env.PORT || 80);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}



