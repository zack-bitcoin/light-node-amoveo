var rpc = (function() {
    function url(port, ip) {
        return "http://".concat(ip).concat(":").
            concat(port.toString()).concat("/"); }
    function messenger(cmd, callback){
        var u = url(8088, get_ip());
        return talk(cmd, u, callback, 10000);
    };
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
    return {
            apost: main2
           };
})();
