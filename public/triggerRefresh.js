/*
Url library from https://github.com/Mikhus/jsurl

Uglified version of
https://github.com/AlexKey/jsurl/blob/70abff1ca9cf4af77c298aefb4d38bb51bea7d8e/url.js
*/

var Url=function(){var a={protocol:"protocol",host:"hostname",port:"port",path:"pathname",query:"search",hash:"hash"},b=function(b,c){var e=document,f=e.createElement("a"),c=c||e.location.href,g=c.match(/\/\/(.*?)(?::(.*?))?@/)||[];f.href=c;for(var h in a)b[h]=f[a[h]]||"";b.protocol=b.protocol.replace(/:$/,""),b.query=b.query.replace(/^\?/,""),b.hash=b.hash.replace(/^#/,""),b.user=g[1]||"",b.pass=g[2]||"",f=null,delete f,d(b)},c=function(a){return a=a.replace(/\+/g," "),a=a.replace(/%([EF][0-9A-F])%([89AB][0-9A-F])%([89AB][0-9A-F])/g,function(a,b,c,d){var e=parseInt(b,16)-224,f=parseInt(c,16)-128;if(0==e&&32>f)return a;var g=parseInt(d,16)-128,h=(e<<12)+(f<<6)+g;return h>65535?a:String.fromCharCode(h)}),a=a.replace(/%([CD][0-9A-F])%([89AB][0-9A-F])/g,function(a,b,c){var d=parseInt(b,16)-192;if(2>d)return a;var e=parseInt(c,16)-128;return String.fromCharCode((d<<6)+e)}),a=a.replace(/%([0-7][0-9A-F])/g,function(a,b){return String.fromCharCode(parseInt(b,16))})},d=function(a){var b=a.query;a.query=new function(a){for(var b=/([^=&]+)(=([^&]*))?/g;match=b.exec(a);){var d=decodeURIComponent(match[1].replace(/\+/g," ")),e=match[3]?c(match[3]):"";this[d]?(this[d]instanceof Array||(this[d]=[this[d]]),this[d].push(e)):this[d]=e}this.toString=function(){var a="",b=encodeURIComponent;for(var c in this)if(!(this[c]instanceof Function))if(this[c]instanceof Array){var d=this[c].length;if(d)for(var e=0;d>e;e++)a+=a?"&":"",a+=b(c)+"="+b(this[c][e]);else a+=(a?"&":"")+b(c)+"="}else a+=a?"&":"",a+=b(c)+"="+b(this[c]);return a}}(b)};return function(a){this.toString=function(){return(this.protocol&&this.protocol+"://")+(this.user&&this.user+(this.pass&&":"+this.pass)+"@")+(this.host&&this.host)+(this.port&&":"+this.port)+(this.path&&this.path)+(""+this.query&&"?"+this.query)+(this.hash&&"#"+this.hash)},b(this,a)}}();

var triggerRefresh = function($) {
    
    var centralSite = "http://triggerrefresh.alexkey.c9.io/"
        , loginOk = $.Deferred()
        , getSocketIO = $.getScript(centralSite + "socket.io/socket.io.js")
        , alreadySetupQueryString = 'triggerRefreshLoaded';
    
    var url = new Url;
    
    function connectSocket() {
        var socket = io.connect(centralSite);
        socket.on('refresh', function(data) {

            if(alreadySetup()) {
                window.location = window.location;
            } else {
                window.location = appendAlreadySetup();
            }
            
        });
        
        $(document).on("keydown", function(e) {
            /*alt + r or alt + R*/
           if(e.altKey && (e.which == 114 || e.which == 82 )) {
                socket.emit('refresh');
            }
        });
    }
    
    function alreadySetup() {  
        return url.query[alreadySetupQueryString];
    }
    
    function appendAlreadySetup() {
        url.query[alreadySetupQueryString] = true;
        return url;
    }
    
    
    function hideLoginButton() {
        $("#triggerRefreshOpenLogin, #triggerRefreshModal").hide();
    }
    
    $.when(getSocketIO, loginOk).done(hideLoginButton,connectSocket);
    
    $("document").ready(function() {
        
        $("<div style='width:100%; height:100%; background-color:rgba(0,0,0,.8); position:absolute; top:0; left:0; display:none;' id='triggerRefreshModal'>" +
            "   <div style='top:30%; left:40%; position:relative; width:20%; height:20%; min-width:400px; min-height:300px; padding:15px; background-color:white;'>" +
            "       <h1>Trigger Refresh</h1>" +
            "       <p>Login, so we can sync your browsers</p>" +
            "       <form id='triggerRefreshLoginForm' action='"+ centralSite +"auth/openid' method='post' target='triggerRefreshSignIn'>" +
            "           <div>" +
            "               <label>OpenID:</label>" +
            "	            <input type='text' name='openid_identifier' value='https://www.google.com/accounts/o8/id' /><br/>" +
            "	        </div>" +
            "           <div>" +
            "    	        <input type='submit' value='Submit'/>" +
            "	        </div>" +
            "           <a href='" + centralSite + "/auth/openid?openid_identifier=https%3A%2F%2Fwww.google.com%2Faccounts%2Fo8%2Fid'>login with google</a>" + 
            "       </form>" +
            "   </div>" +
            "</div>").appendTo("body");
        
        $("#triggerRefreshLoginForm").on("submit", function() {
        
            var serviceWidth = 1000;
            var serviceHeight = 768;
            var left = Math.round(screen.width / 2);
            var top = Math.round(screen.height / 2);
            
            var signIn = window.open(centralSite, "triggerRefreshSignIn",
                "left=" + left + ",top=" + top + ",width=" + serviceWidth + ",height=" + serviceHeight +
                ",personalbar=0,toolbar=0,scrollbars=1,resizable=1"
            );
        });

        if(alreadySetup()) {
            loginOk.resolve();
        } else {
            $("#triggerRefreshModal").show();
        }
        
    });
    
    return {
        loggedIn: function() {
            loginOk.resolve();
        }
    };

}(jQuery);


