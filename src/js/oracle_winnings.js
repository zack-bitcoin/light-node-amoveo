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
    function make_bet(oid) {
        var from = keys.pub();
        //merkle.request_proof("accounts", from, function(acc) {
        rpc.post(["account", from], function(acc) {
	    var nonce = acc[2] + 1;
            var tx = ["oracle_winnings", from, nonce, fee, oid];
            var tx2 = ["unmatched", from, nonce+1, fee, oid];
            var stx = keys.sign(tx);
            var stx2 = keys.sign(tx2);
            var txs = [stx, stx2];
            return post_txs(txs, function(x){
                //return rpc.post(["txs", [-6].concat(txs)], function(x) {
                //console.log(x);
                //status.innerHTML = "status: <font color=\"green\">successfully attempted to make a oracle_close tx.</font>";
                status.innerHTML = x;
                //return 0;
            });
        });
    };
})();
