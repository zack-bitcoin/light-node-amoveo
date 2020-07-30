var subcurrency = (function(){

    var div = document.getElementById("subcurrency_spender");
    var display = document.createElement("p");
    div.appendChild(display);

    var contract_id = text_input("contract_id: ", div);
    div.appendChild(contract_id);
    div.appendChild(br());
    var type = text_input("type: ", div);
    div.appendChild(type);
    div.appendChild(br());
    var to = text_input("to: ", div);
    div.appendChild(to);
    div.appendChild(br());
    var amount = text_input("amount: ", div);
    div.appendChild(amount);
    div.appendChild(br());

    var button = button_maker2("send", send);
    div.appendChild(button);
    div.appendChild(br());

    function send(){
        var cid_key = contract_id.value;
        //var sub_key = btoa(array_to_string(sub_accounts.key(keys.pub(), cid_key, Type)));
            var Type = parseInt(type.value);
            merkle.request_proof("accounts", keys.pub(), function(account){
                var nonce = account[2] + 1;
                var fee = 152050;
                var tx = ["sub_spend_tx",
                          keys.pub(),
                          nonce,
                          fee,
                          to.value,
                          parseInt(amount.value),
                          contract_id.value,
                          Type];
                console.log(tx);
                console.log(JSON.stringify(tx));
                var stx = keys.sign(tx);
		rpc.post(["txs", [-6, stx]], function(x) {
                    console.log(x);
                    display.innerHTML = "successfully spent subcurrency with txid = ".concat(x);
                });
            });
    };
    return({contract_id: function(x) {contract_id.value = x},
            to: function(x) { to.value = x },
            amount: function(x) { amount.value = x },
            type: function(x) {type.value = x }
           });
})();
