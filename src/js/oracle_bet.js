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
    async function make_bet(oid, direction0, amount) {
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
        var acc = await rpc.apost(["account", from]);
	var nonce = acc[2] + 1;
        var tx = ["oracle_bet", from, nonce, fee, oid, direction, amount];
        var stx = keys.sign(tx);
        var txs = [stx];
        var msg = await apost_txs(txs);
        status.innerHTML = msg;
        keys.update_balance();
    };
})();
