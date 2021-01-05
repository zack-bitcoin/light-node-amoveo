(function(){
    var fee = 152050;
    var div = document.createElement("div");
    document.body.appendChild(div);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    var oid_element = text_input("oid: ", div);
    div.appendChild(br());
    var button = button_maker2("close the oracle", function(){
        return make_bet(oid_element.value);
    });
    div.appendChild(button);
    div.appendChild(br());
    function make_bet(oid) {
        var from = keys.pub();
        //merkle.request_proof("accounts", from, function(acc) {
        rpc.post(["account", from], function(acc) {
	    var nonce = acc[2] + 1;
            var tx = ["oracle_close", from, nonce, fee, oid];
            var stx = keys.sign(tx);
            var txs = [stx];
            return rpc.post(["txs", [-6].concat(txs)], function(x) {
                console.log(x);
                status.innerHTML = "status: <font color=\"green\">successfully attempted to make a oracle_close tx.</font>";
                return 0;
            });
        });
    };
})();
