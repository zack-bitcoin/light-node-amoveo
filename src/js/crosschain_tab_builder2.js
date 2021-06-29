
function crosschain_tab_builder2(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var fee = 200000;
    var display = document.createElement("div");
    display.innerHTML = "ready.";
    var warning = document.createElement("h1");
    warning.innerHTML = "<font color='green'>This tab is in development. It doesn't do anything with money yet. To test it out, open the browser console and click 'make crosschain trade offer'.</font>";
    div.appendChild(warning);
    var title = document.createElement("h3");
    title.innerHTML = "Crosschain Decentralized Exchange ";
    div.appendChild(title);
    //div.appendChild(br());
    var details = document.createElement("p");
    details.innerHTML = "Sell a currency on another blockchain to buy VEO. Manage these kinds of trades.";
    div.appendChild(details);
    //div.appendChild(br());
    div.appendChild(display);
    //div.appendChild(br());
    //var IP = "159.89.87.58";
    var IP = default_ip();

    //Make trade offer interface
    var trade_offer_title = document.createElement("h3");
    trade_offer_title.innerHTML = "Make Trade Offer";
    div.appendChild(trade_offer_title);
    var other_blockchain_input = text_input("Name of the other blockchain where you want to sell value. (i.e. Ethereum)", div);
    div.appendChild(br());
    var ticker_input = text_input("Name of the currency that you want to sell. (i.e. Eth)", div);
    div.appendChild(br());
    /*
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "Currency you are buying: ";
    div.appendChild(selector_label);
    div.appendChild(contract_to_buy);
    div.appendChild(br());
    */
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
    receive_amount_input.value = "0.2";
    spend_amount_input.value = "0.01";
    /*
    //security_amount_input.value = "0.3";
    hours_input.value = "48";
    blocks_till_expires_text.value = "30";
    */

    var button = button_maker3("make crosschain trade offer", crosschain_offer);
    div.appendChild(button);
    div.appendChild(br());

    async function crosschain_offer(button){
        var amount1 = Math.round(parseFloat(receive_amount_input.value, 10)*100000000);
        
        if("" === security_amount_input.value){
            security_amount_input.value =
                parseFloat(receive_amount_input.value) * 0.1
                .toString();
        };

        var d = new Date();
        if(parseFloat(hours_input.value, 10) > (24*7)){
            display.innerHTML = "you cannot make a trade that needs to wait more than a week to run the oracle.";
            
            return(0);
        };
        d.setTime(d.getTime() + (parseFloat(hours_input.value, 10) * 60 * 60 * 1000)); 
        var date = d.toUTCString();
        var date = date.slice(5, 22).concat(" GMT");
        var Source = ZERO;
        var SourceType = 0;
        var block_height = headers_object.top()[1];
        var oracleStartHeight = block_height;
        var blockchain = other_blockchain_input.value;
        var ticker = ticker_input.value;
        var amount = spend_amount_input.value;
        var blocks_till_expires = parseInt(blocks_till_expires_text.value, 10);
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
        var amount2 = Math.round(parseFloat(security_amount_input.value, 10)*100000000);
        
        //the swap offer
        var contract_bytes = buy_veo_contract.
            contract1bytes(settings);
        var cid = buy_veo_contract.
            make_cid(contract_bytes, 2, ZERO, 0);
        var offer = buy_veo_contract.buy_veo_offer(
            blocks_till_expires,
            amount2, amount1, 
            cid, salt);

        var offer99 = {};
        offer99.start_limit = block_height - 1;
        offer99.end_limit = block_height + 1000;
        offer99.amount1 = amount1 + amount2;//should be 10% bigger??
        offer99.cid1 = cid;
        offer99.type1 = 2;
        offer99.type2 = 0;
        offer99.cid2 = ZERO;
        offer99.amount2 = Math.round((amount1*0.998) + (fee*5));
        
        offer99.acc1 = keys.pub();
        offer99.partial_match = true;

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
        console.log("this is the contract data that we teach to the p2p derivatives server.");
        console.log(JSON.stringify(Contract));

        const my_acc = await rpc.apost(["account", keys.pub()]);
        console.log(my_acc);
            //rpc.post(["account", keys.pub()], function(my_acc){
        if(my_acc === 0){
            display.innerHTML = "Load your private key first.";
            return(0);
        };
        if(my_acc[1] < amount2){
            display.innerHTML = "Not enough VEO to make this offer.";
            return(0);
            };
        var nonce = my_acc[2];
        console.log("teaching contract");
        console.log(JSON.stringify(Contract));
        const x = await rpc.apost(["add", 4, Contract], IP, 8090);
        console.log(x);
        //rpc.post(["add", 4, Contract], function(x){
        //post the offer
        console.log(JSON.stringify(offer));
        post_offer(offer, offer99);
        rpc.post(["read", 3, cid], function(y){
                    //checking that the contract got published correctly.
            console.log(JSON.stringify(y));
        }, IP, 8090);
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
        where_to_send_indicator(temp_div, function(){//alice. 
            release_buttons(temp_div, function(){
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
        });
    };

    async function where_to_send_indicator(temp_div, callback){
        //the deposit address is in the evidence of the contract_evidence_tx, and it is a part of the contract_timeout_tx.
        //we want to grab the address from the timeout tx, because false evidence could have been made.
        //we scan the sub accounts and txs in the mempool to see if we are trying to buy veo. For every offer where we are trying to buy veo, we scan the txs related to that contract, and also check the mempool for the contract_timeout_tx for that contract.
        console.log("where to send indicator");
        let txs = await rpc.apost(["txs"]);
        txs0 = txs.slice(1);
        txs = txs0.filter(function(tx){
            return(tx[1][0] === "contract_timeout_tx2");
        });
            //console.log(JSON.stringify(txs));
        const sids = txs.map(function(tx){
            return(tx[1][4]);
        });
        console.log(JSON.stringify(sids));


        let account = await rpc.apost(["account", keys.pub()], IP, 8091);
        if(account === "error"){
            return(callback());
        };
        account = account[1];
        var subaccounts = account[3].concat(sids);
        //console.log(JSON.stringify(subaccounts));
        return(where_to_send_indicator_loop(
            temp_div, subaccounts.slice(1), txs0,
            callback));
    };
    async function where_to_send_indicator_loop(
        temp_div, subaccounts, txs, callback){
        if(subaccounts.length === 0){
            return(callback());
        };
        var callback2 = function(){
            return(where_to_send_indicator_loop(
                temp_div, subaccounts.slice(1),
                txs,
                callback));
        };
        var cid = subaccounts[0];
        var id = sub_accounts.normal_key(keys.pub(), cid, 2);
        //console.log("checking sub account for cid: ");
        //console.log(cid);
        let sa = await sub_accounts.arpc(id);
        //sub_accounts.rpc(id, function(sa){
        if(sa === 0){
            return(callback2());
        };
        var balance = sa[1];
        if(balance < 100000){
            return(callback2());
        };
        //let contract = await rpc.apost(["read", 3, cid], IP, 8090);
        let contract = await buy_veo_contract.verified_p2p_contract(cid);
        if(contract === 0){
            //contract doesn't exist in the p2p derivatives explorer.
            return(callback2());
        };
        if(!(contract[0] === "contract")){
            //not a buy_veo contract.
            return(callback2());
        };

        var r = await buy_veo_contract.get_deposit_address(cid, txs);
        if(!(r.address)){
            return(callback2());
        };
        var send_to_p = document.createElement("p");
        //console.log(JSON.stringify(contract));
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
            .concat(r.address);
        temp_div.appendChild(send_to_p);
        return(callback2());
    };
    async function release_buttons(temp_div, callback){
        console.log("making release buttons");
        let txs = await rpc.apost(["txs"]);
        txs0 = txs.slice(1);
        txs = txs0.filter(function(tx){
            return(tx[1][0] === "contract_timeout_tx2");
        });
        const sids = txs.map(function(tx){
            return(tx[1][4]);
        });
        let account = await rpc.apost(["account", keys.pub()], IP, 8091);
        if(account === "error"){
            return(callback());
        };
        account = account[1];
        var subaccounts = account[3].concat(sids);
        return(release_subaccounts_loop(
            temp_div, subaccounts.slice(1).reverse(),
            txs0,
            callback));
    };

    async function release_subaccounts_loop(
        temp_div, subaccounts, txs, callback){
        if(subaccounts.length === 0){
            return(callback());
        };
        var callback2 = function(){
            return(release_subaccounts_loop(
                temp_div, subaccounts.slice(1),
                txs,
                callback));
        };
        var cid = subaccounts[0];
        var sid = sub_accounts.normal_key(keys.pub(), cid, 1);
        var sid2 = sub_accounts.normal_key(keys.pub(), cid, 2);
        let sa = await sub_accounts.arpc(sid);
        //sub_accounts.rpc(id, function(sa){
        if(sa === 0){
            return callback2();
        };
        var balance = sa[1];
        //console.log(JSON.stringify(cid));
        //console.log(JSON.stringify(balance));
        if(balance < 100000){
            return(callback2());
        };
        let contract = await rpc.apost(["read", 3, cid], IP, 8090);
        if(contract === 0){
            return(callback2());
        };
        if(!(contract[0] === "contract")){
            //not a buy_veo contract.
            //console.log("not a buy veo contract");
            return(callback2());
        };

        var r = await buy_veo_contract.get_deposit_address(cid, txs);
        if(!(r.address)){
            return(callback2());
        };
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
        var offer = {};
        var block_height = headers_object.top()[1];
        offer.start_limit = block_height - 1;
        offer.end_limit = block_height + 1000;
        offer.amount1 = balance;//amount to send
        offer.cid2 = Source;
        offer.cid1 = r.sink;
        offer.type2 = SourceType;
        offer.type1 = 1;
        offer.acc1 = keys.pub();
        offer.partial_match = true;
        var release_button = button_maker3("you have already been paid. release the veo.", async function(button){
            console.log("start release button");
            //release button to sell for 0.2% + fee.
            let my_acc = await rpc.apost(["account", keys.pub()]);
            offer.nonce = my_acc[2] + 1;
            offer.amount2 = Math.round((balance*0.002) + (fee*5));//new oracle, oracle report, oracle close, withdraw winnings, oracle winnings
            function cleanup(){
                button.value = "done";
                button.onclick = function(){return(0)};
            };
            function we_post_first(){
                post_offer(offer);
                cleanup();
            };
            //first we should look up if they already posted an offer to sell
            let markets = await rpc.apost(["markets"], IP, 8090);
            markets = markets.slice(1);
            var market = find_market(markets, ZERO, 0, cid, 2);
            if(market === 0){
                return(we_post_first());
            };
            var mid = market[2];
            let market_data = await rpc.apost(["read", mid], IP, 8090);
            market_data = market_data[1];
            var orders = market_data[7].slice(1);
            var order = lowest_price_order(orders);
            var tid = order[3];
            console.log("before trade");
            let trade = await rpc.apost(["read", 2, tid], IP, 8090);
            //rpc.post(["read", 2, tid], function(trade){
            console.log(JSON.stringify(trade));
            var swap = trade;
            var combine_tx = [
                "contract_use_tx", 0,0,0,
                r.sink,// offer.cid1,
                -offer.amount1, 2, offer.cid2, offer.type2];
            
            //var MAX = btoa(array_to_string(integer_to_array(-1, 4)));
            //var MIN = btoa(array_to_string(integer_to_array(0, 4)));
            //const matrix = [-6, [-6, MAX, MIN],[-6, MIN, MAX]];
            const matrix = buy_veo_contract.matrix();
            var row = matrix[1];
            var row2 = matrix[2];
            var winnings_tx = [
                "contract_winnings_tx", 0,0,0,
                cid, balance, sid, keys.pub(),
                buy_veo_contract.proof1(), row];
            var sid2 = sub_accounts.normal_key(keys.pub(), cid, 2);
            let sa2 = await sub_accounts.arpc(sid2);
            var balance2 = sa2[1];
            var winnings_tx2 = [
                "contract_winnings_tx", 0,0,0,
                cid, balance2, sid2, keys.pub(),
                buy_veo_contract.proof2(), row2];
            swaps.make_tx(swap, 1000000, function(txs){
                multi_tx.make(txs.concat([combine_tx, winnings_tx, winnings_tx2]), async function(tx){
                    var stx = keys.sign(tx);
                    let x = await rpc.apost(["txs", [-6, stx]]);
                    if(x == "ZXJyb3I="){
                        display.innerHTML = "server rejected the tx";
                    }else{
                        display.innerHTML = "accepted trade offer and published tx. the tx id is "
                            .concat(x);
                        cleanup();
                    }
                }); 
            });
        });
        
        temp_div.appendChild(release_button);
        temp_div.appendChild(br());
        temp_div.appendChild(br());
        
        return(callback2());
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
            .concat((amount1/100000000).toFixed(8))
            .concat(" ")
            .concat(spend_stuff)
            .concat(" for sending ")
            .concat(atob(other_chain_amount))
            .concat(" of ")
            .concat(atob(ticker))
            .concat(" on the ")
            .concat(atob(blockchain))
            .concat(" blockchain by date ")
            .concat(atob(date));
        return(description);
    };
    function post_offer(offer, second_offer){
        var signed_second_offer;
        if(!(second_offer)){
            signed_second_offer = 0;
        } else {
            var signed_second_offer = swaps.pack(second_offer);
        }
        var signed_offer;
        if(!(offer[0] === "signed")){
            signed_offer = swaps.pack(offer);
        } else {
            signed_offer = offer;
        };
        //console.log("packed offer");
        //console.log(JSON.stringify(signed_offer));
        rpc.post(["add", signed_offer, signed_second_offer], function(z){
            display.innerHTML = "successfully posted your crosschain offer. ";
            var link = document.createElement("a");
            link.href = "contracts.html";
            link.innerHTML = "Your trade can be viewed on this page.";
            link.target = "_blank";
            //display.appendChild(link);
        }, IP, 8090);//8090 is the p2p_derivatives server
    };
    function active_offers(temp_div, callback){
        rpc.post(["markets"], function(markets){
            markets = markets.slice(1);
            //console.log(JSON.stringify(markets));
            active_offers_from_markets(markets, temp_div, callback);
        }, IP, 8090);
    };
    function active_offers_from_markets(
        markets, temp_div, callback
    ){
        if(markets.length === 0) {
            return(callback());
        };
        function callback2(){
            return(active_offers_from_markets(markets.slice(1), temp_div, callback));
        };
        var market = markets[0];
        var mid = market[2];
        var cid2 = market[5];
        var type2 = market[6];
        if(!(type2 === 2)){
            return(callback2());
        };
        rpc.post(["read", 3, cid2], function(contract){
            //todo. only display the contract if the choose_address_timeout is in the future.
            //todo. only display the contract if the oracle_start_height is in a reasonable timeframe.
            if(contract === 0){
                return(callback2());
            };
            console.log(JSON.stringify(contract));
            if(!(contract[0] === "contract")){
                console.log("not this one\n");
                return(callback2());
            };
            rpc.post(["read", mid], function(market_data){
                //console.log(JSON.stringify(market_data));
                market_data = market_data[1];
                var orders = market_data[7];
                display_active_offers_orders(orders.slice(1), temp_div, contract, callback2);
            }, IP, 8090);
        }, IP, 8090);
    };
    function display_active_offers_orders(orders, temp_div, contract, callback){
        var Source = contract[2];
        var SourceType = contract[3];
        var tid0 = contract[10];

        if(orders.length === 0){
            return(callback());
        };
        function callback2(){
            return(display_active_offers_orders(orders.slice(1), temp_div, contract, callback));
        };
        console.log(JSON.stringify(orders));
        var order = orders[0];
        var price = order[1];
        var amount = order[2];
        var tid = order[3];
        if(!(tid === tid0)){
            console.log("tids not equal");
            console.log(JSON.stringify([tid, tid0]));
            return(0);
        };
        rpc.post(["read", 2, tid], function(trade){
            var swap_offer2 = trade[1];
            var from = swap_offer2[1];
            var expires = swap_offer2[3];
            var amount1 = swap_offer2[6];
            var amount2 = swap_offer2[9];
            var cid1 = swap_offer2[4];
            var type1 = swap_offer2[5];
            var cid2 = swap_offer2[7];
            var salt = swap_offer2[10];
            var trade_nonce = swap_offer2[11];
            var block_height = headers_object.top()[1];
            if(!(trade_nonce === 1)){
                console.log("unexpected trade nonce");
                return(0);
            };
                

            if(from === keys.pub()){
                console.log(JSON.stringify(swap_offer2));
                var cancel_button = button_maker2("cancel the offer", function(){
                
                    //-record(trade_cancel_tx, {acc, nonce, fee, salt}).
                    var trade_cancel_tx = ["trade_cancel_tx", from, 2, fee, salt];
                    var stx = keys.sign(trade_cancel_tx);
                    post_txs([stx], function(response){

                        console.log(JSON.stringify(response));
                        display.innerHTML = " canceled the trade. response from server: "
                            .concat(response);
                    });
                });
            var description = description_maker(
                cid1, type1, amount2 - amount1, contract);
            description.innerHTML =
                description.innerHTML
                .concat(" ; Offer expires in ")
                .concat(expires - block_height)
                .concat(" blocks.");
            temp_div.appendChild(description);
            temp_div.appendChild(br());
            temp_div.appendChild(cancel_button);
            temp_div.appendChild(br());
            temp_div.appendChild(br());
                
                return(callback2());
            };

            var description = description_maker(
                cid1, type1, amount2 - amount1, contract);
            //ticker,
             //   blockchain, date,
            //  other_chain_amount);

            if(!(block_height < expires)){
                return(callback2());
            } 
            description.innerHTML =
                description.innerHTML.replace(
                        /you offered to receive/,
                    "they offered to buy")
                .concat(" ; Offer expires in ")
                .concat(expires - block_height)
                .concat(" blocks.");
            temp_div.appendChild(description);
            temp_div.appendChild(br());
            var btc_address_input = text_input("address on other blockchain where you get paid.", temp_div);
            btc_address_input.value = "test_address";
            var accept_button = button_maker2("accept the offer", function(){
                //console.log("accepting the offer");
                rpc.post(["account", keys.pub()], async function(my_acc){
                    var nonce = my_acc[2] + 1;
                    var deposit_address = btc_address_input.value;
                    if(deposit_address.length < 5){
                        display.innerHTML = "you need to choose an address on the other blockchain where you want to get paid.";
                        return(0);
                    };
                    //var address_timeout = contract[4];
                    var oracle_start_height = contract[5];
                    var blockchain = atob(contract[6]);
                    var other_chain_amount = atob(contract[7]);
                    var ticker = atob(contract[8]);
                    var date = atob(contract[9]);
                    var reusable_settings = buy_veo_contract.reusable_settings(oracle_start_height, blockchain, other_chain_amount, ticker, date);
                    //var settings = buy_veo_contract.settings(reusable_settings, address_timeout, trade_nonce, tid);
                    //var contract1bytes = buy_veo_contract.contract1bytes(settings);
                    var contract1bytes = await buy_veo_contract.contract_to_1bytes(contract);

                    var contract_txs = buy_veo_contract.choose_deposit_address_tx(
                        deposit_address, contract1bytes,
                        from, reusable_settings,
                        tid, nonce);
                    swaps.make_tx(trade, 1, function(swap_txs){
                        var evidence0 = contract_txs[1];
                        evidence0[2] = nonce + 1;
                        var evidence = keys.sign(evidence0);
                        var timeout0 = contract_txs[2];
                        timeout0[2] = nonce+2;
                        var timeout = keys.sign(timeout0);
                        var txs = [contract_txs[0]]
                            .concat(swap_txs);
                console.log("making multi tx");
                        multi_tx.make(txs, function(tx){
                            var stx = keys.sign(tx);
                            console.log("posting txs");
                            console.log(JSON.stringify([stx, evidence, timeout]));
                            post_txs([stx, evidence, timeout], function(response){
       display.innterHTML = response;
       var amount2_from_swap_offer = swap_offer2[9];
       var cid2_from_swap_offer = swap_offer2[7];
       var offer = {};
       var block_height = headers_object.top()[1];
       offer.start_limit = block_height - 10;
       offer.end_limit = block_height + 2000;
       offer.amount1 = amount2_from_swap_offer;
       offer.cid1 = cid2_from_swap_offer;
       offer.type1 = 1;
       offer.amount2 = Math.round((amount2_from_swap_offer * 0.995) - (fee*5));
       offer.cid2 = ZERO;//cid1_from_swap_offer;
       offer.type2 = 0;//type1_from_swap_offer;
       offer.acc1 = keys.pub();
       offer.partial_match = true;
       offer.nonce = nonce + 3;
       post_offer(offer);
   });
                        });
                    });
                });

            });
            temp_div.appendChild(br());
            temp_div.appendChild(accept_button);
            temp_div.appendChild(br());
            temp_div.appendChild(br());
            return(callback2());
        }, IP, 8090);
    };
    return({
        post_offer: post_offer
    });
};
