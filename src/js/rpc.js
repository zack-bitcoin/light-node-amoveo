var rpc = (function() {
    function url(port, ip) { return "http://".concat(ip).concat(":").concat(port.toString().concat("/")); }
    function xml_check(x) {
        return ((x.readyState === 4) && (x.status === 200)); };
    function xml_out(x) { return x.responseText; }
//    function request_default(cmd, callback) {
//        request(cmd, get_ip(), get_port(),
//                callback);
//    }
    function request(cmd, callback, ip, port) {
        if (ip == undefined){
            var ip = get_ip();
        }
        if (port == undefined){
            var port = get_port();
        }
        var u = url(port, ip);
        return request3(cmd, u, callback);
    }
    function request3(cmd, u, callback) {
        var xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST",u,true);
        xmlhttp.send(JSON.stringify(cmd));
        return request2(xmlhttp, cmd, u, callback, 100);
    };
    function request2(x, cmd, u, callback, n) {
        if (n < 1) { return "failed to connect"; }
        else if (x.status == 400) {
            //the data we sent to the server got mixed up along the way, so it looks invalid to the server.
            //So lets re-send the command.
            setTimeout(function() {
                return request3(cmd, u, callback);
            }, 200); }
        else if (x.status == 0) {
            //this means that the server got our message, and it is still processing a response for us. So lets wait a bit, and then check if it is ready.
            setTimeout(function() {
                return request2(x, cmd, u, callback, n - 1);
            }, 150);
    }
        else if (xml_check(x)) {
            //this means that the server got our message, and it sent a response. The response is ready to read, so lets read it.
            p = JSON.parse(xml_out(x));
            return callback(p[1]);
        }
        else {
            //console.log(x.readyState);
            //console.log(x.status);
            setTimeout(function() {return request2(x, cmd, u, callback, n);}, 10);}
    };
    return {post: request};
})();
