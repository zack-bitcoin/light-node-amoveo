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

    async function doit(){
        console.log("get account");
        var account = await rpc.apost(["account", keys.pub()]);
        if(account == "empty"){
            display.innerHTML = "load an account first";
            return(0);
        };
        //var contract = await merkle.arequest_proof("contracts", contract_id.value);
        console.log("get contract");
        var contract = await rpc.apost(["contracts", contract_id.value]);
        console.log("got contract");
        if(contract == "empty"){
            console.log("that contract does not exist");
            display.innerHTML = "that contract does not exist";
            return(0);
        };
        var nonce = account[2] + 1;
        var fee = 152050;
        var many_types = contract[2];
        var amount = parseInt(amount_input.value);
        var source = contract[8];
        var source_type = contract[9];
        var tx = ["contract_use_tx",
                  keys.pub(),
                  nonce,
                  fee,
                  contract_id.value,
                  amount,
                  many_types,
                  source,
                  source_type
                 ];
        console.log(tx);
        var stx = keys.sign(tx);
        var msg = await apost_txs([stx]);
        display.innerHTML = msg;
    };
    async function amount_calc(N, amount, cid, callback) {
        if(N == 0){
            return(callback(amount));
        };
        var key = sub_accounts.key(keys.pub(), cid, N);
        key = btoa(array_to_string(key));
        var sa = await merkle.arequest_proof("sub_accounts", key);
        var sub_amount = sa[1];
        amount_calc(N-1, Math.min(sub_amount, amount), cid, callback);
    };
    return({
        contract_id: function(x){ contract_id.value = x},
        amount: function(x){ amount_input.value = x},
        doit: doit
    });
})();
