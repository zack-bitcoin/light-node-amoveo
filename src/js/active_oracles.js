(function() {
    var div = document.createElement("div");
    document.body.appendChild(div);
    rpc.post(["oracle_list", 2], function(X) {
        //console.log(JSON.stringify(X));
        return display_oracles(X.slice(1));
    });
    function display_oracles(L) {
        if ((JSON.stringify(L)) == "[]") {
            return [];
        }
        var L1 = L[0];
        var p = document.createElement("p");
        p.innerHTML = ("<font color=\"blue\">").concat(L1[2][1]).concat("</font>  ").concat(atob(L1[1]));
        div.appendChild(p);
        return display_oracles(L.slice(1));
    };
})();
