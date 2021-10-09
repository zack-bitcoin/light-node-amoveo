var rpc = (function() {
    function url(port, ip) {
        return "http://".concat(ip).concat(":").
            concat(port.toString()).concat("/"); }
    function messenger(cmd, callback){
        var u = url(8088, get_ip());
        return talk(cmd, u, callback, 10000);
    };
    /*
    function main(cmd, callback, ip, port) {
        if (ip == undefined){
            ip = get_ip();
        }
        if (port == undefined){
            port = get_port();
        }
        var u = url(port, ip);
        return talk(cmd, u, callback, 10000);//use up to 10 seconds for this request
    }
    */
    async function main2(cmd, ip, port) {
        if (ip == undefined){
            ip = get_ip();
        }
        if (port == undefined){
            port = get_port();
        }
        var u = url(port, ip);
        return atalk(cmd, u);//use up to 10 seconds for this request
    }
    async function atalk(cmd, u) {
        return new Promise(function(resolve, reject){
            let xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", u);
            xmlhttp.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve(JSON.parse(xmlhttp.response)[1]);
                } else {
                    reject({
                        status: this.status,
                        statusText: xmlhttp.statusText
                    });
                }
            };
            xmlhttp.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xmlhttp.statusText
                });
            };
            xmlhttp.send(JSON.stringify(cmd));
        });
    };
    /*
    function talk(cmd, u, callback, n) {
        var xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST",u,true);
        xmlhttp.send(JSON.stringify(cmd));
        return listen(xmlhttp, cmd, u, callback, n);
    };
    var verbose = false;
    function listen(x, cmd, u, callback, n) {
        if (n < 1) { return "failed to connect"; }
        else if (x.status == 400) {
            if(verbose){ console.log("data sent to server got mixed up and looks invalid. attempting to re-send");}
            setTimeout(function() {
                return talk(cmd, u, callback, n - 100);
            }, 100); }
        else if (x.status == 0) {
            if(verbose){ console.log("the server got our message and is processing a response. lets wait a bit for the response");}
            setTimeout(function() {
                return listen(x, cmd, u, callback, n - 20);
            }, 20);
        }
        else if (x.readyState == 3) {
            if(verbose){ console.log("currently receiving a response. lets wait a bit for the rest of the data to arrive"); };
            setTimeout(function() {return listen(x, cmd, u, callback, n-10);}, 10);
        }
        else if ((x.readyState === 4) && (x.status === 200)) {
            if(verbose){ console.log("received a response from the server.");}
            p = JSON.parse(x.responseText);
            return callback(p[1]);
        }
        else {
            console.log(x.readyState);
            console.log(x.status);
            if(verbose){console.log("unhandled state. wait a bit and hopefully it ends.");}
            setTimeout(function() {return listen(x, cmd, u, callback, n-50);}, 50);}
    };
    */
    return {//post: main,
            apost: main2
           };
})();
