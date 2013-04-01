var openid = require('openid');
var url = require('url');
var querystring = require('querystring');
var relyingParty = new openid.RelyingParty(
    'http://triggerrefresh.alexkey.c9.io/verify', // Verification URL (yours) 'http://triggerrefresh.azurewebsites.net/verify'
    null, // Realm (optional, specifies realm for OpenID authentication)
    false, // Use stateless verification
    false, // Strict mode
    []); // List of extensions to enable and include

var fs = require('fs');

var server = require('http').createServer(
    function(req, res)
    {
        var parsedUrl = url.parse(req.url);
        
        if (parsedUrl.pathname == '/index.html') {
            fs.readFile(__dirname + '/index.html',

            function(err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }

                res.writeHead(200);
                res.end(data);
            });
  
        }
        
        else if(parsedUrl.pathname == '/authenticate')
        { 
          // User supplied identifier
          var query = querystring.parse(parsedUrl.query);
          var identifier = query.openid_identifier;

          // Resolve identifier, associate, and build authentication URL
          relyingParty.authenticate(identifier, false, function(error, authUrl)
              {
                if (error)
                {
                  res.writeHead(200);
                  res.end('Authentication failed: ' + error.message);
                }
                else if (!authUrl)
                {
                  res.writeHead(200);
                  res.end('Authentication failed');
                }
                else
                {
                  res.writeHead(302, { Location: authUrl });
                  res.end();
                }
              });
        }
        else if(parsedUrl.pathname == '/verify')
        {
            // Verify identity assertion
            // NOTE: Passing just the URL is also possible
            relyingParty.verifyAssertion(req, function(error, result)
            {
                console.log(result);
              res.writeHead(200);
              res.end(!error && result.authenticated 
                  ? 'Success :) :-)'
                  : 'Failure :(');
            });
        }
        else
        {
            // Deliver an OpenID form on all other URLs
            res.writeHead(200);
            res.end('<!DOCTYPE html><html><body>'
                + '<form method="get" action="/authenticate">'
                + '<p>Login using OpenID</p>'
                + '<input name="openid_identifier" value="https://www.google.com/accounts/o8/id" />'
                + '<input type="submit" value="Login" />'
                + '</form></body></html>');
        }
    });
server.listen(process.env.PORT || 80);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('refresh', function (data) {
    console.log("refresh: " + data);
    socket.broadcast.emit("refresh")
  });
});

