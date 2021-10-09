var scalar_contract_winnings = (function(){
    var div = document.getElementById("scalar_contract_winnings");
    var display = document.createElement("p");
    div.appendChild(display);

    var contract_id = text_input("contract id: ", div);
    div.appendChild(br());
    var oracle_id = text_input("oracle id: ", div);
    div.appendChild(br());
    var button = button_maker2("claim your prize", claim);
    div.appendChild(button);
    div.appendChild(br());

    async function claim(){
        
        //-record(contract_winnings_tx, {from, nonce, fee, contract_id, amount, sub_account, winner, proof, row}).
        var cid = contract_id.value;
        var oid = oracle_id.value;
        //merkle.request_proof("contracts", cid, async function(contract){
        var contract = await merkle.arequest_proof("contracts", cid);
        var oracle = await rpc.apost(["oracles", oid]);
        if(contract == "empty") {
            display.innerHTML = "that contract does not exist";
                return(0);
        };
        if(oracle == "empty") {
            display.innerHTML = "first make the oracle to enforce the outcome. the oracle does not exist yet.";
            return(0);
        };
        var acc = await rpc.apost(["account", keys.pub()]);
        if(acc == "empty") {
            display.innerHTML = "no account loaded.";
            return(0);
        }
        var nonce = acc[2] + 1;
        var many = contract[2];
        var payout_vector;
        var full = btoa(array_to_string([255,255,255,255]));
        var empty = btoa(array_to_string([0,0,0,0]));
        if(!(oracle[2] == 1)) {
            display.innerHTML = "that oracle is not yet resolved";
            return 0;
        }
        var question_hash = oracle[3];
        var text = await rpc.apost(["oracle", 2, question_hash]);
        var is = atob(text).match(/max.0, min.MaxVal, .B . MaxVal . MaxPrice.. is \d*/)[0].match(/\d*$/)[0];
        var price = parseInt(is, 10);
        var maximum =  4294967295; 
        payout_vector =
            [-6,
             btoa(array_to_string(integer_to_array(price, 4))),
             btoa(array_to_string(integer_to_array(maximum - price, 4)))];
        claim2(many, cid, nonce, payout_vector);
    };
    async function claim2(N, cid, nonce, payout_vector){
        if(N<1){
            return(0);
        }
        var key = sub_accounts.normal_key(keys.pub(), cid, N);
        var sa = await merkle.arequest_proof("sub_accounts", key);
        console.log(sa);
        if(!(sa == "empty")){
            var bal = sa[1];
            if(bal > 0){
                var fee = 152050;
                var tx = [
                    "contract_winnings_tx",
                    keys.pub(), nonce, fee,
                    cid, bal,
                    key, keys.pub(),
                    payout_vector, 0];
                var stx = keys.sign(tx);
                var r = await apost_txs([stx]);
                if(r === "server rejected the tx"){
                    display.innerHTML = r;
                }else{
                    claim2(N-1, cid, nonce+1, payout_vector);
                    display.innerHTML = "accepted trade offer and ".concat(r);
                };
            };
        };
        return(claim2(N-1, cid, nonce, payout_vector));
    };

    return({
        contract_id: function(x){contract_id.value = x},
        oracle_id: function(x){oracle_id.value = x},
        claim: claim
    });
})();
