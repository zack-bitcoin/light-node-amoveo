(function(){
    var view = document.createElement("div");
    var div = document.createElement("div");
    document.body.appendChild(div);
    function list_to_string(x) {
        if(x.length == 1){ return(x[0].toString());}
        return (x[0].toString().concat(".").concat(
            list_to_string(x.slice(1))));
    };
    async function view_peers(p) {
        if(p.length == 0){ return([]);}
        var ip = p[0][1][1];
        var port = p[0][1][2];
        var height = p[0][2][1];
        var r = await rpc.apost(["version", 3], list_to_string(ip.slice(1)), 8080);
        //function c(r){
        var m = "";
            //console.log(JSON.stringify(r))
        m += "<p>ip: ".concat(JSON.stringify(ip.slice(1))).concat("height: ").concat(JSON.stringify(height)).concat(", port: ").concat(JSON.stringify(port));
        if(r) {
            m += (", fork number: ").concat(JSON.stringify(r));
        };
        m += "</p>";
        view.innerHTML += m;
        //};
        view_peers(p.slice(1));
    };
    async function main() {
        view.innerHTML = "";
        //rpc.post(["peers", 2], function(p) {
        var p = await rpc.apost(["peers", 2]);
        view_peers(p.slice(1));
    //});
    };
    var button = button_maker2("refresh", main);
    div.appendChild(button);
    div.appendChild(view);
})();
