(function(){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var buy_div1 = document.getElementById("buy_veo_contracts");
    var refresh_div = document.createElement("div");
    buy_div1.appendChild(refresh_div);

    var refresh_button = button_maker2("refresh", refresh);
    refresh_div.appendChild(refresh_button);
    refresh_div.appendChild(br());

    var div = document.createElement("div");
    buy_div1.appendChild(div);

    async function refresh(){
        let account = await rpc.apost(["account", keys.pub()], default_ip(), 8091);
        if(account === "error"){
            console.log("account does not exist");
            return(0);
        };
        div.innerHTML = "";
        account = account[1];
        var subaccounts = account[3].slice(1);
        
        subaccounts.map(async function(cid){
            var option_div = document.createElement("div");
            div.appendChild(option_div);
            var id1 = sub_accounts.normal_key(keys.pub(), cid, 1);
            var id2 = sub_accounts.normal_key(keys.pub(), cid, 2);
            let sa1 = await sub_accounts.arpc(id1);
            let sa2 = await sub_accounts.arpc(id2);
            let p2p_contract = await buy_veo_contract.verified_p2p_contract(cid);
            if(p2p_contract === 0){
                return(0);
            };
            var txs = await rpc.apost(["txs"]);
            txs = txs.slice(1);
            var address_sink = await buy_veo_contract.get_deposit_address(cid, txs);
            //console.log(JSON.stringify(address_sink));

            if(((!(sa1 === 0)) && (sa1[1] > 0)) ||
               ((!(sa2 === 0)) && (sa2[1] > 0))){
            //if((!(sa1 === 0)) ||
            //   (!(sa2 === 0))){
                //about this p2p_contract
                var address_string = "<br />to address: undecided";
                if (address_sink.address){
                    address_string = "<br />to address: ".concat(address_sink.address);
                };
                var s = ""
                    .concat(atob(p2p_contract[7]))
                    .concat(" of ")
                    .concat(atob(p2p_contract[8]))
                    .concat("<br />in blockchain ")
                    .concat(atob(p2p_contract[6]))
                    .concat(address_string)
                    .concat("<br /> is delivered by date: ")
                    .concat(atob(p2p_contract[9]))
                    .concat(" contract id: ")
                    .concat(cid);
                var p = document.createElement("span");
                p.innerHTML = s;
                option_div.appendChild(br());
                option_div.appendChild(p);
                option_div.appendChild(br());
            } else {
                return(0);
            };
            //display balances
            if((!(sa1 === 0)) && (sa1[1] > 0)){
                var bal = sa1[1];
                var s = document.createElement("span");
                s.innerHTML = "you win "
                    .concat(bal)
                    .concat(" if the money is not delivered");
                option_div.appendChild(s);
                option_div.appendChild(br());
            }
            if((!(sa2 === 0)) && (sa2[1] > 0)){
                var bal = sa2[1];
                var s = document.createElement("span");
                s.innerHTML = "you win "
                    .concat(bal)
                    .concat(" if the money is delivered");
                option_div.appendChild(s);
                option_div.appendChild(br());
            }
            //interface to combine
            if((!(sa1 === 0)) && (!(sa2 === 0)) && ((sa1[1] > 0)) && ((sa2[1] > 0))){
                combine_to_veo(cid, sa1, sa2, address_sink.consensus_state_contract, option_div);
            };
            if((!(sa1 === 0)) || (!(sa2 === 0))){
                oracle_options(cid, p2p_contract, address_sink.address, address_sink.consensus_state_contract, address_sink.sink, sa1, sa2, option_div);
            };
        });
    };
    async function oracle_options(cid, p2p_contract, bitcoin_address, cs_contract, sink, sa1, sa2, option_div){
        //console.log(bitcoin_address);
        var choose_address_timeout = p2p_contract[4];
        var height_now = headers_object.top()[1];
        var oracle_start_height = p2p_contract[5];
        var blockchain = atob(p2p_contract[6]);
        var amount = atob(p2p_contract[7]);
        var ticker = atob(p2p_contract[8]);
        var date = atob(p2p_contract[9]);
        var reusable_settings = buy_veo_contract.reusable_settings(oracle_start_height, blockchain, amount, ticker, date);
        if((!(bitcoin_address)) &&
           (cs_contract[7] === ZERO) &&
           (sa1[1] > 0) &&
           (height_now > choose_address_timeout)){
            //they ran out of time to deliver the veo.
            //todo. test
            var out_of_time_button = button_maker2("they ran out of time", async function(){
                console.log("if you have winning shares, withdraw your winnings.");
                var contract1bytes = await buy_veo_contract.contract_to_1bytes(p2p_contract);
                console.log(JSON.stringify(contract1bytes));
                var my_acc = await rpc.apost(["account", keys.pub()]);
                var nonce = my_acc[2] + 1;
                var [evidence, timeout] = buy_veo_contract.evidence_of_no_deposit_address(contract1bytes, nonce);
                if(!(cid === evidence[5])){
                    console.log(JSON.stringify([cid, evidence[5]]));
                    return(0);
                }
                var payout_vector = buy_veo_contract.matrix()[0];
                var sub_account = sub_accounts.normal_key(keys.pub(), cid, 1);
                var winnings = ["contract_winnings_tx", 0,0,0, cid, sa1[1], sub_account, keys.pub(), payout_vector,0];
                var nonce2 = timeout[2];
                var txs = [timeout, winnings];
                var multi = await multi_tx.amake(txs);
                evidence = keys.sign(evidence);
                multi = keys.sign(multi);
                console.log(JSON.stringify(evidence));
                post_txs([evidence, multi], function(response){
                    var span = document.createElement("span");
                    span.innerHTML = response;
                    option_div.appendChild(br());
                    option_div.appendChild(span);
                    option_div.appendChild(br());
                });
                return(0);
            });
            option_div.append(out_of_time_button);
            option_div.append(br());
            return(0);
        };
        //console.log(reusable_settings);
        //console.log(bitcoin_address);
        var question = buy_veo_contract.oracle_question(reusable_settings, bitcoin_address);
        //console.log(question);
        var oid = id_maker(oracle_start_height, 0, 0, question);
        var consensus_oracle;
        var dip = default_ip();
        if(dip === "0.0.0.0"){
            consensus_oracle = await rpc.apost(["oracles", oid]);
        } else {
            consensus_oracle = await merkle.arequest_proof("oracles", oid);
        };
        if((consensus_oracle === 0) &&
           (!(cs_contract[7] === ZERO))){
            //if the oracle doesn't exist, give a button for creating it.
            var fee = 152050;
            var new_oracle_button = button_maker2("create the oracle for this contract", async function(){
                var acc = await merkle.arequest_proof("accounts", keys.pub());
                var nonce = acc[2] + 1;
                var tx = ["oracle_new", keys.pub(), nonce, Math.round(fee*1.1), btoa(question), oracle_start_height, oid, 0, 0, 0];
                var stx = keys.sign(tx);
                post_txs([stx], function(response){
                    console.log(JSON.stringify(tx));
                    var span = document.createElement("span");
                    span.innerHTML = response;
                    option_div.appendChild(br());
                    option_div.appendChild(span);
                    option_div.appendChild(br());
                });
            });
            option_div.appendChild(new_oracle_button);
            return(0);
        };
        if(consensus_oracle[2] === 0){
            //if the oracle exists and isn't settled, link to the explorer for that oracle.
            var a = document.createElement("a");
            a.href = "oracle_explorer.html?oid="
                .concat(oid);
            a.innerHTML = "the oracle is live. you can see details about it here.";
            a.target = "_blank";
            option_div.appendChild(a);
            return(0);
        };
            //if the oracle is settled and you have winning shares, then give a button to convert your winnings to veo. Converts to the child contract first.
            // todo. test when we need to simplify.
            // todo. test when we don't need to simplify.
        var resolved = (cs_contract[6] === 1);
        var sinked = (cs_contract[10] === sink);
        var rns = resolved && sinked;
        var txs = [];

        const matrix = buy_veo_contract.matrix();
        var show_button = false;
        if((consensus_oracle[2] === 2) &&
           (sa1[1] > 1)){
            show_button = true;
            var row = matrix[1];
            if(rns){
                var simplify_tx = buy_veo_contract.simplify_tx(cid, sink, row, 0);
                txs = txs.concat([simplify_tx]);
            }
            var winnings_tx = [
                "contract_winnings_tx", 0,0,0,
                cid, sa1[1], sid, keys.pub(),
                //buy_veo_contract.proof1(), row];
                row, 0];
            txs = txs.concat([winnings_tx]);

        };
        if((consensus_oracle[2] === 1) &&
           (sa2[1] > 1)){
            show_button = true;
            var row2 = matrix[2];
            if(rns){
                var simplify_tx = buy_veo_contract.simplify_tx(cid, sink, row2, 0);
                txs = txs.concat([simplify_tx]);
            };
            var winnings_tx2 = [
                "contract_winnings_tx", 0,0,0,
                cid, sa2[1], sid2, keys.pub(),
                //buy_veo_contract.proof2(), row2];
                row2, 0];
            txs = txs.concat([winnings_tx]);

        };
        var multi = await multi_tx.amake(txs);
        var win_button = button_maker2("the oracle resolved and you won. click here to get your winnings.", async function(){
            post_txs([multi], function(response){
                var span = document.createElement("span");
                span.innerHTML = response;
                option_div.appendChild(br());
                option_div.appendChild(span);
                option_div.appendChild(br());
            });
        });
        if(show_button){
            option_div.appendChild(win_button);
            refresh_div.appendChild(br());
        };
    };
    async function combine_to_veo(cid, sa1, sa2, consensus_contract, option_div){
        console.log(JSON.stringify(consensus_contract));
        var closed = consensus_contract[6];
        var button = button_maker2("combine both share types back to veo", async function(){
            var tx;
            var amount = Math.min(sa1[1], sa2[1]);
            if(closed === 0){
                //if the child contract doesn't exist, can just combine to veo.
                var acc = await rpc.apost(["account", keys.pub()]);
                var nonce = acc[2]+1;
                var fee = 152050;
                tx = ["contract_use_tx",
                      keys.pub(),nonce,fee,
                      cid, -amount, 2, ZERO, 0];
            } else {
                //if the child contract exists, needs to convert them both to the child contract, and then combine back to veo.
                var sink = consensus_contract[10];
                var use_tx = ["contract_use_tx",
                              0,0,0, sink, -amount,
                              2, ZERO, 0];
                var sid1 = sub_accounts.normal_key(keys.pub(), cid, 1);
                var sid2 = sub_accounts.normal_key(keys.pub(), cid, 2);
                const matrix = buy_veo_contract.matrix();
                var row = matrix[1];
                var winnings_tx = [
                    "contract_winnings_tx", 0,0,0,
                    cid, sa1[1], sid1, keys.pub(),
                    buy_veo_contract.proof1(), row];
                var row2 = matrix[2];
                var winnings_tx2 = [
                    "contract_winnings_tx", 0,0,0,
                    cid, sa2[1], sid2, keys.pub(),
                    buy_veo_contract.proof2(), row2];
                var txs = [use_tx, winnings_tx, winnings_tx2]
                tx = await multi_tx.amake(txs);
                
            };
            var stx = keys.sign(tx);
            post_txs([stx], function(response){
                console.log(JSON.stringify(response));
                var span = document.createElement("span");
                span.innerHTML = response;
                option_div.appendChild(br());
                option_div.appendChild(span);
                option_div.appendChild(br());
            });
        });
        option_div.appendChild(button);
    };
})();
