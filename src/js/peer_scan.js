(function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    var view = document.createElement("div");
    function view_peers(p) {
        if ("[]" == JSON.stringify(p)) { return [];}
        console.log(JSON.stringify(p[0]));
        var ip = p[0][1][1];
        var port = p[0][1][2];
        var height = p[0][2][1];
        console.log(ip);
        console.log(port);
        console.log(height);
        return "<p>ip: ".concat(JSON.stringify(ip.slice(1))).concat("height: ").concat(JSON.stringify(height)).concat(", port: ").concat(JSON.stringify(port)).concat("</p>").concat(view_peers(p.slice(1)));
    };
    function main() {
        variable_public_get(["peers", 2], function(p) {
            console.log(JSON.stringify(p));
            var peers_string = view_peers(p.slice(1));
            view.innerHTML = peers_string;
        });
    };
    //var button = button_maker2("refresh", function(){ return main()});
    var button = button_maker2("refresh", main);
    div.appendChild(button);
    div.appendChild(view);
})();
