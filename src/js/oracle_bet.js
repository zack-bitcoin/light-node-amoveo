(function(){
    var fee = 152050;
    var div = document.createElement("div");
    document.body.appendChild(div);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    var oid_element = text_input("oid: ", div);
    div.appendChild(br());
    var direction_element = text_input("true/false/bad: ", div);
    div.appendChild(br());
    var amount_element = text_input("amount: ", div);
    div.appendChild(br());
    var button = button_maker2("make bet", function(){
        console.log(parseFloat(amount_element.value));
        console.log(direction_element.value);
        return make_bet(oid_element.value, direction_element.value, Math.floor(parseFloat(amount_element.value) * token_units()));
    });
    div.appendChild(button);
    div.appendChild(br());
    function make_bet(oid, direction0, amount) {
        var direction;
        if (direction0 == "true") {
            direction = 1;
        } else if (direction0 == "false") {
            direction = 2;
        } else if (direction0 == "bad") {
            direction = 3;
        } else {
            status.innerHTML = "status: <font color=\"red\">bet type must be true, false, or bad.</font>";
            return 0;
        }
        var from = keys.pub();
        //merkle.request_proof("accounts", from, function(acc) {
        rpc.post(["account", from], function(acc) {
	    var nonce = acc[2] + 1;
            var tx = ["oracle_bet", from, nonce, fee, oid, direction, amount];
            var stx = keys.sign(tx);
            var txs = [stx];
            console.log(JSON.stringify(tx));
            console.log(JSON.stringify(stx));
            return post_txs(txs, function(msg){
                    status.innerHTML = msg;
                    keys.update_balance();
                });
//            return rpc.post(["txs", [-6].concat(txs)], function(x) {
//                status.innerHTML = "status: <font color=\"green\">successfully attempted to make a oracle_bet tx.</font>";
//                return 0;
//        });
        });
    };
})();
