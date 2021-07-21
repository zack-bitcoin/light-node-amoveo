var subcurrency_combiner = (function(){
    
    var div = document.getElementById("subcurrency_combiner");
    var display = document.createElement("p");
    div.appendChild(display);


    var contract_id = text_input("contract_id: ", div);
    div.appendChild(contract_id);
    div.appendChild(br());
    var button = button_maker2("combine subcurrencies into veo", doit);
    div.appendChild(button);
    div.appendChild(br());

    async function doit(){
        //merkle.request_proof("accounts", keys.pub(), function(account){
        var account = await rpc.apost(["account", keys.pub()]);
            //merkle.request_proof("contracts", contract_id.value, function(contract){
        var contract = await merkle.arequest_proof("contracts", contract_id.value);
        var nonce = account[2] + 1;
        var fee = 152050;
        var many_types = contract[2];
                //amount_calc(many_types, 10000000000000000, contract_id.value, function(amount){
        var amount = await amount_calc(many_types, 10000000000000000, contract_id.value);
        if(amount > -1) {
            display.innerHTML = "You don't have a complete set of shares for this market. you cannot withdraw to source currency."
            return(0);
        }
        var source = contract[8];
        var source_type = contract[9];
        var txs = [];
        var use_tx = ["contract_use_tx",
                  keys.pub(),
                  nonce,
                  fee,
                  contract_id.value,
                  amount,
                  many_types,
                  source,
                  source_type
                     ];
        var is_closed = contract[6];
        var sink = contract[10];
        if(is_closed === 1){
            [win1, win2] = await buy_veo_contract.both_winners(contract_id.value);
            use_tx[4] = sink;
            txs = txs.concat([win1, win2]);
        };
        txs = txs.concat([use_tx]);
        var tx = await multi_tx.amake(txs);
        console.log(JSON.stringify(tx));
        var stx = keys.sign(tx);
        //rpc.post(["txs", [-6, stx]],
        var x = await rpc.apost(["txs", [-6, stx]]);
        //function(x) {
        if(x == "ZXJyb3I="){
            display.innerHTML = "server rejected the tx";
        }else{
            display.innerHTML = "accepted trade offer and published tx. the tx id is ".concat(x);
        };
    //});
    //});
    //});
    //});
    };
    async function amount_calc(N, amount, cid) {
        if(N == 0){
            //return(callback(-amount));
            return(-amount);
        };
        var key = sub_accounts.key(keys.pub(), cid, N);
        key = btoa(array_to_string(key));
        //merkle.request_proof("sub_accounts", key, function(sa){
        //rpc.post(["sub_accounts", key], function(sa){
        var sa = await rpc.apost(["sub_accounts", key]);
        console.log(sa);
        var sub_amount = sa[1];
        return(amount_calc(N-1, Math.min(sub_amount, amount), cid));
        //});
        
    };

    return({
        contract_id: function(x){ contract_id.value = x}
    });
})();
