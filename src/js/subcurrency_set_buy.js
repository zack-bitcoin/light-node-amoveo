var subcurrency_set_buy = (function(){
    
    var div = document.getElementById("subcurrency_set_buy");
    var display = document.createElement("p");
    div.appendChild(display);

    var contract_id = text_input("contract_id: ", div);
    div.appendChild(contract_id);
    div.appendChild(br());
    var amount_input = text_input("amount: ", div);
    div.appendChild(amount_input);
    div.appendChild(br());
    var button = button_maker2("buy/sell the complete set of subcurrencies for one market", doit);
    div.appendChild(button);
    div.appendChild(br());

    function doit(){
        merkle.request_proof("accounts", keys.pub(), function(account){
            merkle.request_proof("contracts", contract_id.value, function(contract){
                var nonce = account[2] + 1;
                var fee = 152050;
                var many_types = contract[2];
                var amount = parseInt(amount_input.value);
                var tx = ["contract_use_tx",
                          keys.pub(),
                          nonce,
                          fee,
                          contract_id.value,
                          amount,
                          many_types];
                var stx = keys.sign(tx);
                rpc.post(["txs", [-6, stx]],
                         function(x) {
                             if(x == "ZXJyb3I="){
                                 display.innerHTML = "server rejected the tx";
                             }else{
                                 display.innerHTML = "accepted trade offer and published tx. the tx id is ".concat(x);
                             }
                         });
                
            });
        });
    };
    function amount_calc(N, amount, cid, callback) {
        if(N == 0){
            return(callback(amount));
        };
        var key = sub_accounts.key(keys.pub(), cid, N);
        key = btoa(array_to_string(key));
        merkle.request_proof("sub_accounts", key, function(sa){
            var sub_amount = sa[1];
            amount_calc(N-1, Math.min(sub_amount, amount), cid, callback);
        });
        
    };

    return({
        contract_id: function(x){ contract_id.value = x}
    });
})();
