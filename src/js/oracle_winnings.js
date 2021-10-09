(function(){
    var fee = 152050;
    var div = document.createElement("div");
    document.body.appendChild(div);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    var oid_element = text_input("oid: ", div);
    div.appendChild(br());
    var button = button_maker2("publish tx", function(){
        return make_bet(oid_element.value);
    });
    div.appendChild(button);
    div.appendChild(br());
    async function make_bet(oid) {
        var from = keys.pub();
        var acc = await rpc.apost(["account", from]);
	var nonce = acc[2] + 1;
        var tx = ["oracle_winnings", from, nonce, fee, oid];
        var tx2 = ["unmatched", from, nonce+1, fee, oid];
        var stx = keys.sign(tx);
        var stx2 = keys.sign(tx2);
        var msg1 = await apost_txs([stx]);
        status.innerHTML = msg1;
        var msg2 = await apost_txs([stx2]);
        status.innerHTML = msg1
            .concat("<br>")
            .concat(msg2);
    };
})();
