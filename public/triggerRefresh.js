
var triggerRefresh = function($) {
    
    var url = "http://triggerrefresh.alexkey.c9.io/"
        , loginOk = $.Deferred()
        , getSocketIO = $.getScript(url + "socket.io/socket.io.js");
        //, getBBQ = $.getScript("http://cdnjs.cloudflare.com/ajax/libs/jquery.ba-bbq/1.2.1/jquery.ba-bbq.min.js");
    
    function connectSocket() {
        var socket = io.connect(url);
        socket.on('refresh', function(data) {
            console.log("refreshing...");
            setTimeout(function() {
                window.location = window.location;
            }, 300);
            

        });
        
        $("#refresh").on("click", function(event) {
            socket.emit("refresh");
        });
    }

    $.when(getSocketIO, loginOk).done(connectSocket);
    
    $("document").ready(function() {
        
        $("<button id='triggerRefreshOpenLogin'>login</button>").appendTo("body");
        $("<button id='refresh'>refresh</button>").appendTo("body");
        
        $("#triggerRefreshOpenLogin").on("click", function() {
             window.open(url);
        });
        
    });
    
    return {
        loggedIn: function() {
            loginOk.resolve();
        }
    };

}(jQuery);


