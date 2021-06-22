(function(){
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
            var id1 = sub_accounts.normal_key(keys.pub(), cid, 1);
            var id2 = sub_accounts.normal_key(keys.pub(), cid, 2);
            let sa1 = await sub_accounts.arpc(id1);
            let sa2 = await sub_accounts.arpc(id2);
            let p2p_contract = await rpc.apost(["read", 3, cid], default_ip(), 8090);
            //todo. we should verify that the p2p contract data matches some on-chain data.




            var txs = await rpc.apost(["txs"]);
            txs = txs.slice(1);
            var address_sink = await buy_veo_contract.get_deposit_address(cid, txs);
            console.log(address_sink);

            if((!(sa1 === 0)) || (!(sa2 === 0))){
                //about this p2p_contract
                if(p2p_contract === 0){
                    return(0);
                };
                var address_string = "<br />to address: undecided";
                if (address_sink.length > 0){
                    address_string = "<br />to address: ".concat(address_sink[0]);
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
                div.appendChild(br());
                div.appendChild(p);
                div.appendChild(br());
            }
            //display balances
            if(!(sa1 === 0)){
                var bal = sa1[1];
                var s = document.createElement("span");
                s.innerHTML = "you win "
                    .concat(bal)
                    .concat(" if the money is not delivered");
                div.appendChild(s);
                div.appendChild(br());
            }
            if(!(sa2 === 0)){
                var bal = sa2[1];
                var s = document.createElement("span");
                s.innerHTML = "you win "
                    .concat(bal)
                    .concat(" if the money is delivered");
                div.appendChild(s);
                div.appendChild(br());
            }
            //interface to combine
            if((!(sa1 === 0)) && (!(sa2 === 0)) && ((sa1[1] > 0)) && ((sa2[1] > 0))){
                combine_to_veo(cid, sa1, sa2);
                //todo if the child contract doesn't exist, can just combine to veo.
                //todo if the child contract exists, needs to convert both and then combine back to veo.
            };
            if((!(sa1 === 0)) || (!(sa2 === 0))){
                oracle_options(cid, p2p_contract, address_sink);
            };
        });
    };
    async function oracle_options(cid, p2p_contract, bitcoin_address){
        console.log(bitcoin_address);
        //todo. if the address was not revealed in time, then give a button to settle the contract. (bitcoin_address === [])
        var question = buy_veo_contract.make_oracle_question(reusable_settings, bitcoin_address);
        //todo if the oracle exists and isn't settled, link to the explorer for that oracle.
        //todo if the oracle exists and is settled, then give a button to convert your winnings to veo. Needs to convert to the child contract first.
        //todo if the oracle doesn't exist, give a button for creating it.


    };
})();
