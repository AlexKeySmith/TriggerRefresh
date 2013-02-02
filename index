
var openid = require('openid');
var url = require('url');
var server = require('http').createServer(
    function(req, res)
    {
        var parsedUrl = url.parse(req.url, true);
        if(parsedUrl.pathname == '/verify')
        {
            // Verify identity assertion
            var result = openid.verifyAssertion(req); // or req.url
            res.writeHead(200);
            res.end(result.authenticated ? 'Success  ' : 'Failure  ');
        }
        else if(parsedUrl.pathname == '/authenticate')
        {
            // Resolve identifier, associate, build authentication URL
            openid.authenticate(
                parsedUrl.query.openid_identifier, // user supplied identifier
                'http://triggerrefresh.azurewebsites.net/verify', // our callback URL
                null, // realm (optional)
                false, // attempt immediate authentication first?
                function(authUrl)
                {
                    res.writeHead(302, { Location: authUrl });
                    res.end();
                });
        }
        else
        {
            // Deliver an OpenID form on all other URLs
            res.writeHead(200);
            res.end('<!DOCTYPE html><html><body>'
                + '<form method="get" action="/authenticate">'
                + '<p>Login using OpenID</p>'
                + '<input name="openid_identifier" />'
                + '<input type="submit" value="Login" />'
                + '</form></body></html>');
        }
    });
server.listen(process.env.PORT);