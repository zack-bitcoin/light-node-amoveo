
function crosschain_tab_builder2(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var fee = 200000;
    var display = document.createElement("div");
    display.innerHTML = "ready.";
    var title = document.createElement("h3");
    title.innerHTML = "Crosschain Decentralized Exchange ";
    div.appendChild(title);
    var details = document.createElement("p");
    details.innerHTML = "Sell a currency on another blockchain to buy VEO. Manage these kinds of trades.";
    div.appendChild(details);
    div.appendChild(display);
    var IP = default_ip();

    //Make trade offer interface
    var trade_offer_title = document.createElement("h3");
    trade_offer_title.innerHTML = "Make Trade Offer";
    div.appendChild(trade_offer_title);
    var other_blockchain_input = text_input("Name of the other blockchain where you want to sell value. (i.e. Ethereum)", div);
    div.appendChild(br());
    var ticker_input = text_input("Name of the currency that you want to sell. (i.e. Eth)", div);
    div.appendChild(br());
    var spend_amount_input = text_input("Amount of currency you want to send. (i.e. 0.15)", div);
    div.appendChild(br());
    var receive_amount_input = text_input("Amount of VEO you want to receive. (i.e. 1.205)", div);
    div.appendChild(br());

    var advanced_div = document.createElement("div");
    advanced_div.appendChild(br());
    var advanced_interface = document.createElement("div");
    var more_button = button_maker2("more options", function(){
        advanced_div.innerHTML = "";
        advanced_div.appendChild(advanced_interface);
    });
    var less_button = button_maker2("less options", function(){
        advanced_div.innerHTML = "<br>";
    });
    div.appendChild(more_button);
    div.appendChild(less_button);
    div.appendChild(br());
    div.appendChild(advanced_div);

    var security_amount_input = text_input("How much currency should you need to lock into the contract as a security deposit to enforce that you actually deliver. (default is 10% the amount you are selling) (i.e. 0.015)", advanced_interface);
    advanced_interface.appendChild(br());
    var hours_input = text_input("How many hours do you have until the money needs to arrive in their account on the other blockchain. Don't make it too big, we need to wait this long to run the oracle, but also don't make it too small, as if you fail to deliver the currency in time, then you lose your safety deposit. (i.e. 48)", advanced_interface);
    hours_input.value = "48";
    advanced_interface.appendChild(br());
    //look at create_tab_builder to see about dates.
    var blocks_till_expires_text = text_input("How many Amoveo blocks until your trade offer should expire as invalid. (Amoveo has about 130 blocks per day)(i.e. 130)", advanced_interface);
    blocks_till_expires_text.value = "130";
    advanced_interface.appendChild(br());

    //test values
    other_blockchain_input.value = "Bitcoin";
    ticker_input.value = "BTC";
    receive_amount_input.value = "0.1";
    spend_amount_input.value = "0.000001";
    /*
    //security_amount_input.value = "0.3";
    hours_input.value = "48";
    blocks_till_expires_text.value = "30";
    */

    var button = button_maker3("make crosschain trade offer", crosschain_offer);
    div.appendChild(button);
    div.appendChild(br());

    async function crosschain_offer(button){
        var amount1 = Math.round(parseFloat(receive_amount_input.value, 10)*token_units());
        
        if("" === security_amount_input.value){
            security_amount_input.value =
                parseFloat(receive_amount_input.value) * 0.1
                .toString();
        };

        var d = new Date();
        var hours = parseFloat(hours_input.value, 10);
        if(hours > (24*7)){
            display.innerHTML = "you cannot make a trade that needs to wait more than a week to run the oracle.";
            return(0);
        };
        d.setTime(d.getTime() +
                  (hours * 60 * 60 * 1000)); 
        var date = d.toUTCString();
        var date = date.slice(5, 22).concat(" GMT");
        var Source = ZERO;
        var SourceType = 0;
        var block_height = headers_object.top()[1];
        var oracleStartHeight = block_height;
        var blockchain = other_blockchain_input.value;
        var ticker = ticker_input.value;
        var amount = spend_amount_input.value;
        var blocks_till_expires =
            parseInt(blocks_till_expires_text.value, 10);
        var addressTimeout = blocks_till_expires + block_height;

        var reusable_settings = buy_veo_contract.
            reusable_settings(
                oracleStartHeight, blockchain,
                amount, ticker, date);
        var salt = btoa(random_cid(32));
        var TID = swaps.id_maker(keys.pub(), salt);
        var settings = buy_veo_contract.
            settings(
                reusable_settings, addressTimeout,
                1, TID);
        var amount2 = Math.round(parseFloat(security_amount_input.value, 10)*token_units());
        
        //the swap offer
        var contract_bytes = buy_veo_contract.
            contract1bytes(settings);
        var cid = buy_veo_contract.
            make_cid(contract_bytes, 2, ZERO, 0);
        var offer = buy_veo_contract.buy_veo_offer(
            blocks_till_expires,
            amount2, amount1, 
            cid, salt);

        var offer99 = swaps.offer_99(
            swaps.unpack(offer));
        //this is the contract data we teach the p2p derivatives server.
        var Contract = [
            "contract", cid, Source, SourceType,
            addressTimeout, oracleStartHeight,
            btoa(blockchain), btoa(amount),
            btoa(ticker), btoa(date),
            TID, 0];
        var contract1bytes = await buy_veo_contract.contract_to_1bytes(Contract);
        console.log(date);
        console.log(JSON.stringify(contract1bytes));
        var cid2 = buy_veo_contract.make_cid(contract1bytes, 2, ZERO, 0);
        if(!(cid === cid2)){
            console.log("made bad contract");
            console.log(Contract);
            return(0);
        };

        const my_acc = await rpc.apost(["account", keys.pub()]);
        if(my_acc === 0){
            display.innerHTML = "Load your private key first.";
            return(0);
        };
        if(my_acc[1] < amount2){
            display.innerHTML = "Not enough VEO to make this offer.";
            return(0);
            };
        var nonce = my_acc[2];
        const x = await rpc.apost(["add", 4, Contract], IP, 8090);
        if(!(x === cid)){
            console.log("bad cid produced");
            return(0);
        };
        apost_offer(display, IP, offer, offer99);
    };

    var refresh_button = button_maker2("refresh available actions", refresh);
    div.appendChild(br());
    div.appendChild(refresh_button);
    div.appendChild(br());
    div.appendChild(br());
    var lists_div = document.createElement("div");
    div.appendChild(lists_div);

    /*
      normal
=========
      Alice offers to sell BTC, and she offers to sell her shares for 99% of their max value.
      Bob accepts and gives his address to receive BTC, and makes an offer to sell his shares for 99% of their value.
      Alice sends the bitcoin.
      Bob buys the winning shares for 99% of their value.
      Alice has type 2, Bob has type 1.

no delivery address
=======
      Alice offers to sell BTC, and she offers to sell her shares for 99% of their max value.
      Bob accepts, locking in his veo.
      After waiting a delay, Alice resolves the contract and withdraws all Bob's veo, or an untrusted third party buys Alice's winning shares and does it for her.

no btc delivery
======
      Alice offers to sell BTC, and she offers to sell her shares for 99% of their max value.
      Bob accepts and gives his address to receive BTC, and makes an offer to sell his shares for 99% of their value.
      Alice didn't deliver the BTC, so an untrusted third party buys Bob's winning shares, they create the oracle and get the money.

    */

    function refresh(){
        var temp_div = document.createElement("div");
        lists_div.innerHTML = "<h1>loading...</h1>";
        release_buttons(temp_div, function(){
            //this is also the where to send indicator for alice.
                //Bob
                //once you receive the bitcoin, you can release the funds. buys the winning shares for 99% of their value and combines. 
            active_offers(temp_div, function(){
                    //Bob
                    //accept an offer, provide a btc address, and make an offer to sell your tokens for 99% of their max value.
                    //Alice
                    //ability to cancel unmatched offers. increments your offer-nonce.
                console.log("done making buttons");
                lists_div.innerHTML = "";
                lists_div.appendChild(temp_div);
            });
        });
    };

    async function is_buy_veo_contract(contract, txs){
        var cid = contract[1];
        var b1 = (contract[0] === "contract");
        console.log(JSON.stringify(contract));
        var r = await buy_veo_contract.get_deposit_address(cid, txs);
        if(!(b1)){return(false)};
        if(!(r.address)){return(false)};
        return(r);
    };
    async function contract_api(cid){
        var contract =
            await buy_veo_contract
            .verified_p2p_contract(cid);
        return(contract);
    };
    function draw_deposit_address(
        cid, address, contract, temp_div){
        if(!(cid === (contract[1]))){
            console.log("weird error. maybe someone is trying to trick us into sending money to the wrong place.");
            return(0);
        };
        var send_to_p = document.createElement("p");
        var send_amount = atob(contract[7]);
        var blockchain = atob(contract[6]);
        var ticker = atob(contract[8]);
        var date = atob(contract[9]);
        send_to_p.innerHTML = "send amount "
            .concat(send_amount)
            .concat(" of ")
            .concat(ticker)
            .concat(", on blockchain: ")
            .concat(blockchain)
            .concat(", by date: ")
            .concat(date)
            .concat(", to address: ")
            .concat(address);
        temp_div.appendChild(send_to_p);
    };
    async function release_buttons(temp_div, callback){
        var txs = await rpc.apost(["txs"]);
        txs0 = txs.slice(1);
        txs = txs0.filter(function(stx){
            return((stx[1][0] === "contract_timeout_tx2"))});
        var timeout_subs = txs
            .map(function(stx){return(stx[1][4])});
        var filter = function(contract){
            return(is_buy_veo_contract(contract, txs0))
        };
        var l1 = await swap_offer_downloader.subaccounts(
            1, filter, contract_api,
            timeout_subs);
        var l2 = await swap_offer_downloader.subaccounts(
            2, filter, contract_api,
            timeout_subs);
        //[[cid, sa, contract, r]...]
        l1.map(function(x){
            var cid = x[0];
            var sa = x[1];
            var contract = x[2];
            var r = x[3];
            draw_release_button(cid, r, sa, contract, temp_div);
        });
        l2.map(function(x){
            var cid = x[0];
            var sa = x[1];
            var contract = x[2];
            var address = x[3].address;
            return(draw_deposit_address(
                cid, address, contract, temp_div));
        });
        return(callback());
    };
    function draw_release_button(
        cid, r, sa, contract, temp_div
    ){
        var balance = sa[1];
        var send_amount = atob(contract[7]);
        var blockchain = atob(contract[6]);
        var ticker = atob(contract[8]);
        var date = atob(contract[9]);
        var send_to_p = document.createElement("span");
        send_to_p.innerHTML = "if you have received "
                .concat(send_amount)
            .concat(" of ")
            .concat(ticker)
            .concat(", on blockchain: ")
            .concat(blockchain)
            .concat(", by date: ")
            .concat(date)
            .concat(", in address: ")
            .concat(r.address)
            .concat(", then click this button to release the veo.");
        temp_div.appendChild(send_to_p);
        var Source = contract[2];
        var SourceType = contract[3];
        var release_button = button_maker3("you have already been paid. release the veo.", async function(button){
            function cleanup(){
                button.value = "done";
                button.onclick = function(){return(0)};
            };
            let markets = await rpc.apost(["markets"], IP, 8090);
            markets = markets.slice(1);
            var market = find_market(markets, ZERO, 0, cid, 2);
            if(market === 0){
                //they didn't post their offer to sell for 99% of the value. I guess they want to use an oracle.
                return(cleanup());
            };
            var mid = market[2];
            let market_data = await rpc.apost(["read", mid], IP, 8090);
            market_data = market_data[1];
            var orders = market_data[7].slice(1);
            var order = lowest_price_order(orders);
            var tid = order[3];
            let trade = await rpc.apost(["read", 2, tid], IP, 8090);
            var swap = trade;
            var combine_tx = [
                "contract_use_tx", 0,0,0,
                r.sink, -balance, 2,
                Source, SourceType];
            var [winnings_tx, winnings_tx2] =
                await buy_veo_contract.both_winners(cid);
            swaps.make_tx(swap, 1000000, async function(txs){
                var tx = await multi_tx.amake(txs.concat([combine_tx, winnings_tx, winnings_tx2]));
                var stx = keys.sign(tx);
                let x = await rpc.apost(["txs", [-6, stx]]);
                if(x == "ZXJyb3I="){
                    display.innerHTML = "server rejected the tx";
                }else{
                    display.innerHTML = "accepted trade offer and published tx. the tx id is "
                        .concat(x);
                    cleanup();
                };
            });
        });
        temp_div.appendChild(release_button);
        temp_div.appendChild(br());
        temp_div.appendChild(br());
    };
    function lowest_price_order(orders) {
        if(orders.length === 1){
            return(orders[0]);
        };
        var order0 = orders[0];
        var order1 = orders[1];
        var price0 = order0[1];
        var price1 = order1[1];
        if(price0 < price1){
            return(lowest_price_order([order0].concat(orders.slice(2))));
        } else {
            return(lowest_price_order([order1].concat(orders.slice(2))));
        };
    };
    function find_market(markets, cid2, type2, cid1, type1){
        if(markets.length === 0){
            return(0);
        };
        var market = markets[0];
        var mcid1 = market[3];
        var mtype1 = market[4];
        var mcid2 = market[5];
        var mtype2 = market[6];
        if((cid2 === mcid2) &&
           (type2 === mtype2) &&
           (cid1 === mcid1) &&
           (type1 === mtype1)){
            return(market);
        }
        return(find_market(markets.slice(1), cid2, type2, cid1, type1));
    };
    function description_maker(cid1, type1, amount1, contract){
        var blockchain = contract[6];
        var other_chain_amount = contract[7];
        var ticker = contract[8];
        var date = contract[9];
        var description = document.createElement("span");
        var spend_stuff;
        if(cid1 === ZERO){
            spend_stuff = "VEO";
        } else {
            spend_stuff = cid1
                .concat(" type ")
                .concat(type1);
        };
        description.innerHTML = "you offered to receive "
            .concat((amount1/token_units())
                    .toFixed(8))
            .concat(" ")
            .concat(spend_stuff)
            .concat(" if you send ")
            .concat(atob(other_chain_amount))
            .concat(" of ")
            .concat(atob(ticker))
            .concat(" on the ")
            .concat(atob(blockchain))
            .concat(" blockchain by date ")
            .concat(atob(date));
        return(description);
    };
    async function active_offers(temp_div, callback){

        var swap_offers =
            await swap_offer_downloader.doit(
                2, "buy_veo");
            //[[contract, [[tid, signed_offer]...]]...]
        swap_offers.map(function(offer){
            var contract = offer[0];
            var tids = offer[1];
            tids.map(function(pair){
                var tid = pair[0];
                var trade = pair[1];
                display_button(
                    contract, tid, trade, temp_div);
            });
        });
        callback();
    };
    function display_button(contract, tid, trade, temp_div){
        var offer = swaps.unpack(trade);
        var block_height = headers_object.top()[1];
        if(!(offer.nonce === 1)){
            console.log("unexpected trade nonce");
            return(0);
        };
        var description = description_maker(
            offer.cid1, offer.type1,
            offer.amount2 - offer.amount1, contract);
        if(offer.acc1 === keys.pub()){
            var cancel_button = button_maker2("cancel the offer", async function(){
                var trade_cancel_tx = ["trade_cancel_tx", offer.acc1, 2, fee, offer.salt];
                var stx = keys.sign(trade_cancel_tx);
                var response = await apost_txs([stx]);
                display.innerHTML = " canceled the trade. response from server: "
                    .concat(response);
            });
            description.innerHTML =
                description.innerHTML
                .concat(" ; Offer expires in ")
                .concat(offer.end_limit - block_height)
                .concat(" blocks.");
            temp_div.appendChild(description);
            temp_div.appendChild(br());
            temp_div.appendChild(cancel_button);
            temp_div.appendChild(br());
            temp_div.appendChild(br());
            return(0);
        };
        
        if(!(block_height < offer.end_limit)){
            return(0);
        } 
        description.innerHTML =
            description.innerHTML.replace(
                /you offered to receive/,
                "they offered to buy")
            .replace(/if you send/,
                     "you will receive")
            .concat(" ; Offer expires in ")
            .concat(offer.end_limit - block_height)
            .concat(" blocks.");
        temp_div.appendChild(description);
        temp_div.appendChild(br());
        var btc_address_input = text_input("address on other blockchain where you get paid.", temp_div);
        btc_address_input.value = "test_address";
        var accept_button = button_maker2("accept the offer", async function(){
            var my_acc = await rpc.apost(["account", keys.pub()]);
            var nonce = my_acc[2] + 1;
            var deposit_address = btc_address_input.value;
            if(deposit_address.length < 5){
                display.innerHTML = "you need to choose an address on the other blockchain where you want to get paid.";
                return(0);
            };
            if(deposit_address === keys.pub()){
                display.innerHTML = "you need to choose an address on the other blockchain where you want to get paid.";
                return(0);
            };
            var oracle_start_height = contract[5];
            var blockchain = atob(contract[6]);
            var other_chain_amount = atob(contract[7]);
            var ticker = atob(contract[8]);
            var date = atob(contract[9]);
            var reusable_settings = buy_veo_contract.reusable_settings(oracle_start_height, blockchain, other_chain_amount, ticker, date);
            var contract1bytes = await buy_veo_contract.contract_to_1bytes(contract);
            
            var contract_txs = buy_veo_contract.choose_deposit_address_tx(
                deposit_address, contract1bytes,
                offer.acc1, reusable_settings,
                tid, nonce);
            swaps.make_tx(trade, 1, async function(swap_txs){
                var evidence0 = contract_txs[1];
                evidence0[2] = nonce + 1;
                var evidence = keys.sign(evidence0);
                var timeout0 = contract_txs[2];
                timeout0[2] = nonce+2;
                var timeout = keys.sign(timeout0);
                var txs = [contract_txs[0]]
                    .concat(swap_txs);
                var tx = await multi_tx.amake(txs);
                var stx = keys.sign(tx);
                var response = await apost_txs([stx, evidence, timeout])
                display.innterHTML = response;
                var offer99 = swaps.accept_99(offer);
                apost_offer(display, IP, offer99);
            });
        });
        temp_div.appendChild(br());
        temp_div.appendChild(accept_button);
        temp_div.appendChild(br());
        temp_div.appendChild(br());
        return(0);
    };
    return({
    });
};
