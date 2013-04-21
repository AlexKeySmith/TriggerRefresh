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
        
        $("#refresh").on("click", function(event) {
            socket.emit("refresh");
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
        $("#triggerRefreshOpenLogin").hide();
    }
    
    $.when(getSocketIO, loginOk).done(hideLoginButton,connectSocket);
    
    $("document").ready(function() {
        
        $("<button id='triggerRefreshOpenLogin'>login</button>").appendTo("body");
        $("<button id='refresh'>refresh</button>").appendTo("body");
        
        $("#triggerRefreshOpenLogin").on("click", function() {
             window.open(centralSite);
        });
        
        if(alreadySetup()) {
            loginOk.resolve();
        }
        
    });
    
    return {
        loggedIn: function() {
            loginOk.resolve();
        }
    };

}(jQuery);


