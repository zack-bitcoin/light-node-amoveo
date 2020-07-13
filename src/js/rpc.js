var rpc = (function() {
    function url(port, ip) {
        return "http://".concat(ip).concat(":").
            concat(port.toString()).concat("/"); }
    function main(cmd, callback, ip, port) {
        if (ip == undefined){
            ip = get_ip();
        }
        if (port == undefined){
            port = get_port();
        }
        var u = url(port, ip);
        return talk(cmd, u, callback);
    }
    function talk(cmd, u, callback) {
        var xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST",u,true);
        xmlhttp.send(JSON.stringify(cmd));
        return listen(xmlhttp, cmd, u, callback, 100);
    };
    function listen(x, cmd, u, callback, n) {
        if (n < 1) { return "failed to connect"; }
        else if (x.status == 400) {
            //the data we sent to the server got mixed up along the way, so it looks invalid to the server.
            //So lets re-send the command.
            setTimeout(function() {
                return talk(cmd, u, callback);
            }, 200); }
        else if (x.status == 0) {
            //this means that the server got our message, and it is still processing a response for us. So lets wait a bit, and then check if it is ready.
            setTimeout(function() {
                return listen(x, cmd, u, callback, n - 1);
            }, 150);
        }
        //else if (xml_check(x)) {
        else if ((x.readyState === 4) && (x.status === 200)) {
            //this means that the server got our message, and it sent a response. The response is ready to read, so lets read it.
            //p = JSON.parse(xml_out(x));
            p = JSON.parse(x.responseText);
            return callback(p[1]);
        }
        else {
            //console.log(x.readyState);
            //console.log(x.status);
            setTimeout(function() {return listen(x, cmd, u, callback, n);}, 10);}
    };
    return {post: main};
})();
