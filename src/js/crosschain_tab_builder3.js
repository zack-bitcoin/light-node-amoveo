function crosschain_tab_builder3(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    //crypto to crypto exchange
    /*
      It starts with alice having 1 unit of btc and 1.2 veo. Bob has 1 unit of eth and 0.1 veo.
    

Contract 1 is a sell veo contract, where alice is buying eth.
Contract 2 is a buy veo contract, where alice is selling her btc.

Alice should only have an incentive to send her btc if she has already receive the eth.
so contract 2 should be priced in contract 1 type 2, which is only valuable if the eth has already been delivered.

Alice's first swap offer is that she sends 1 veo if she receives 1.2 contract1 (sell veo) type 1.
The second is that she sends 0.1 veo if she receives 1.2 contract2 (buy veo) type 2.

To accept this offer, bob needs a big multitx to create both contracts, deposit 1.2 veo into contract 1, deposit 1.2 of contract 1 type 2 into contract 2, then he can accept the swap offers to refund his 1.1 veo with the flash loan.


todo: plan what swap offers we need so that beginner users don't need to deal with oracles or enforcement.
* bob doesn't deliver eth.
  - alice sells contract1 type1
* bob chooses an invalid address or runs out of time.
  - alice sells contract2 type2
* alice doesn't deliver btc.
  - bob sells contract2 type1
     */

    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var fee = 200000;
    var display = document.createElement("div");
    display.innerHTML = "ready.";
    var warning = document.createElement("h1");
    warning.innerHTML = "<font color='green'>This tab is in development. To test it out, open the browser console and click 'make crosschain trade offer'. It is recommended to not use this with real money on mainnet.</font>";
    div.appendChild(warning);
    var title = document.createElement("h3");
    title.innerHTML = "Crosschain Decentralized Exchange ";
    div.appendChild(title);
    div.appendChild(br());
    var details = document.createElement("p");
    details.innerHTML = "Sell a currency on another blockchain to buy VEO. Manage these kinds of trades.";
    div.appendChild(details);
    div.appendChild(display);
    var IP = default_ip();

    //Make trade offer interface
    var trade_offer_title = document.createElement("h3");
    trade_offer_title.innerHTML = "Make Trade Offer";
    div.appendChild(trade_offer_title);
    var spend_blockchain_input = text_input("Name of the other blockchain where you want to sell value. (i.e. Ethereum)", div);
    div.appendChild(br());
    var spend_ticker_input = text_input("Name of the currency that you want to sell. (i.e. ETH)", div);
    div.appendChild(br());
    /*
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "Currency you are buying: ";
    div.appendChild(selector_label);
    div.appendChild(contract_to_buy);
    div.appendChild(br());
    */
    var spend_amount_input = text_input("Amount of currency you want to send. (i.e. 0.15 ETH)", div);
    div.appendChild(br());

    
    var receive_blockchain_input = text_input("Name of the other blockchain where you want to receive value. (i.e. Bitcoin)", div);
    div.appendChild(br());
    var receive_ticker_input = text_input("Name of the currency that you want to receive. (i.e. BTC)", div);
    div.appendChild(br());
    var receive_amount_input = text_input("Amount of currency you want to receive. (i.e. 0.03 BTC)", div);
    div.appendChild(br());
    var receive_address_input = text_input("Your address on the other blockchain where you will get paid. Needs to be a fresh address that has never received currency before", div);
    div.appendChild(br());
    var veo_amount_input = text_input("Amount of veo to collateralize the contracts. Should be worth a little more than either of the other 2 currencies. (i.e. 1.25). The VEO leaves your wallet once someone accepts the trade.", div);
    div.appendChild(br());


    var advanced_div = document.createElement("div");
    advanced_div.appendChild(br());
    var advanced_interface = document.createElement("div");

    var veo_cooperation_deposit_input = text_input("Amount of veo to incentivize cooperative finalization of the contract. Should be worth a fraction of the VEO collateral.", advanced_interface);
    advanced_interface.appendChild(br());


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

    //var security_amount_input = text_input("How much currency should you need to lock into the contract as a security deposit to enforce that you actually deliver. (default is 10% the amount you are selling) (i.e. 0.015)", advanced_interface);
    //advanced_interface.appendChild(br());
    var hours_input = text_input("How many hours do you have until the money needs to arrive in their account on the other blockchain. Don't make it too big, we need to wait this long to run the oracle, but also don't make it too small, as if you fail to deliver the currency in time, then you lose your safety deposit. (i.e. 48)", advanced_interface);
    hours_input.value = "48";
    advanced_interface.appendChild(br());
    //look at create_tab_builder to see about dates.
    var blocks_till_expires_text = text_input("How many Amoveo blocks until your trade offer should expire as invalid. (Amoveo has about 130 blocks per day)(i.e. 130)", advanced_interface);
    blocks_till_expires_text.value = "130";
    advanced_interface.appendChild(br());

    //test values
    spend_blockchain_input.value = "Ethereum";
    receive_blockchain_input.value = "Bitcoin";
    spend_ticker_input.value = "ETH";
    receive_ticker_input.value = "BTC";
    spend_amount_input.value = "0.002";
    receive_amount_input.value = "0.000001";
    receive_address_input.value = "test_address";
    veo_amount_input.value = "1.00";
    veo_cooperation_deposit_input.value = "";
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

        /*
        if("" === security_amount_input.value){
            security_amount_input.value =
                parseFloat(receive_amount_input.value) * 0.1
                .toString();
        };
        */
        
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
        var spend_blockchain = spend_blockchain_input.value;
        var receive_blockchain = receive_blockchain_input.value;
        var spend_ticker = spend_ticker_input.value;
        var receive_ticker = receive_ticker_input.value;
        var spend_amount = read_float(spend_amount_input.value);
        var receive_amount = read_float(receive_amount_input.value);
        var receive_address = receive_address_input.value;
        var veo_collateral = Math.round(parseFloat(veo_amount_input.value, 10) * 100000000);
        var blocks_till_expires = parseInt(blocks_till_expires_text.value, 10);
        var addressTimeout = blocks_till_expires + block_height;
        var vcdi = veo_cooperation_deposit_input.value;
        var security_lockup;
        if(vcdi){
            security_lockup = Math.round(parseFloat(veo_cooperation_deposit_input.value, 10) * 100000000);
        } else {
            security_lockup = Math.round(veo_collateral / 10);
        };

        //making the buy veo contract.
        var reusable_settings = buy_veo_contract.
            reusable_settings(
                oracleStartHeight,
                spend_blockchain,
                spend_amount, spend_ticker, date);
        var salt = btoa(random_cid(32));
        var TID = swaps.id_maker(keys.pub(), salt);
        var settings = buy_veo_contract.
            settings(
                reusable_settings, addressTimeout,
                1, TID);
        var amount2 = veo_collateral;//Math.round(parseFloat(veo_collateral, 10)*100000000);
        
        //making the sell veo contract
        var [sell_cid, oracle_text] =
            await sell_veo_contract.oid(
                receive_blockchain_input.value,
                receive_address_input.value,
                //receive_amount_input.value,
                receive_amount,
                receive_ticker_input.value,
                date)

        var sell_offer = {};
        //should send 1 unit of veo in exchange for (1 + (security * 2)) units of contract1 type1
        var block_height = headers_object.top()[1];
        //var veo_all = veo_collateral + (2 * security_lockup);
        var veo_all = veo_collateral + (security_lockup);
        sell_offer.start_limit = block_height - 1;
        sell_offer.end_limit = block_height + parseInt(blocks_till_expires_text.value, 10);
        sell_offer.amount1 = veo_collateral;
        sell_offer.amount2 = veo_all;
        sell_offer.cid1 = ZERO;
        sell_offer.cid2 = sell_cid;
        sell_offer.type1 = 0;
        sell_offer.type2 = 1;
        sell_offer.acc1 = keys.pub();
        sell_offer.partial_match = false;

        var sell_offer99 = swaps.offer_99(sell_offer);
        console.log(JSON.stringify(buy_offer));
        console.log(JSON.stringify(buy_offer99));
        
        var contract_bytes = buy_veo_contract.
            contract1bytes(settings);
        var buy_cid = buy_veo_contract.
            make_cid(contract_bytes, 2, sell_cid, 2);
        var buy_offer = buy_veo_contract.buy_veo_offer(
            blocks_till_expires,
            //security_lockup, veo_collateral + security_lockup, 
            security_lockup, veo_collateral, 
            buy_cid, salt);
        var buy_offer99 = swaps.offer_99(swaps.unpack(buy_offer));

        //this is the contract data we teach the p2p derivatives server.
        var BuyContract = [
            "contract", buy_cid,
            sell_cid, 2,
            addressTimeout, oracleStartHeight,
            btoa(spend_blockchain), btoa(spend_amount),
            btoa(spend_ticker), btoa(date),
            TID, 0];
        var contract1bytes = await buy_veo_contract.contract_to_1bytes(BuyContract);
        var cid2 = buy_veo_contract.make_cid(contract1bytes, 2, sell_cid, 2);
        if(!(buy_cid === cid2)){
            console.log("made bad contract");
            console.log(BuyContract);
            return(0);
        };
        const my_acc = await rpc.apost(["account", keys.pub()]);
        if(my_acc === 0){
            display.innerHTML = "Load your private key first.";
            return(0);
        };
        if(my_acc[1] < amount2){
            display.innerHTML = "Not enough VEO to make this offer.";
            console.log(my_acc);
            console.log(amount2);
            return(0);
            };
        var nonce = my_acc[2];
        const add_contract_response = await rpc.apost(["add", 4, BuyContract], IP, 8090);

        await apost_offer(display, IP, buy_offer, buy_offer99);
        await apost_offer(display, IP, sell_offer, sell_offer99);

        rpc.post(["read", 3, buy_cid], function(y){
            rpc.post(["read", 3, sell_cid], function(y2){
                    //checking that the contract got published correctly.
                console.log(JSON.stringify(y));
                console.log(JSON.stringify(y2));
                refresh();
            }, IP, 8090);
        }, IP, 8090);
    };


    var refresh_button = button_maker2("refresh available actions", refresh);
    div.appendChild(br());
    div.appendChild(refresh_button);
    div.appendChild(br());
    div.appendChild(br());
    var lists_div = document.createElement("div");
    div.appendChild(lists_div);

    function refresh(){
        var temp_div = document.createElement("div");
        lists_div.innerHTML = "<h1>loading...</h1>";
        where_to_send_indicator(temp_div, function(){
            //alice and bob both need to see addresses for where to send.
            //also release buttons.
            //Bob
            //once you receive the bitcoin, you can release the funds. buys the winning shares for 99% of their value and combines. 
            accept_cancel_buttons(temp_div, function(){
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

    async function buy_contract_api(cid){
        var contract =
            await buy_veo_contract
            .verified_p2p_contract(cid);
        return(contract);
    };
    async function sell_contract_api(cid){
        var r = await rpc.apost(
            ["read", 3, cid], IP, 8090);
        return(r);
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
        const sids = txs.map(function(tx){
            return(tx[1][4]);
        });

        var filter = function(contract){
            return(buy_veo_contract
                   .is_buy_veo_contract(contract, txs0)
                   && is_child_of_scalar(contract));
        };
        var l = await swap_offer_downloader
            .subaccounts(
                1, filter, buy_contract_api, sids);
        var l2 = await swap_offer_downloader
            .subaccounts(
                2, filter, buy_contract_api, sids);
        //is type 2 in the other page...
        //[[cid, sa, contract, r]...]

        l.map(async function(x){
            //the account that Accepted the swap offer.
            //this is for buying the winnings and losings from the other account, and combining them all back to veo.
            var cid = x[0];
            var sa = x[1];
            var contract = x[2];
            var r = x[3];
            await draw_deposit_address1(
                cid, r.address, contract,
                txs0, temp_div);
            await draw_release_button(cid, r, sa, contract, temp_div);
        });
        l2.map(async function(x){
            //the account that Publish the swap offer.
            //this is for making an offer to sell your losing shares for the cost of using the oracle.
            var cid = x[0];
            var sa = x[1];
            var contract = x[2];
            var r = x[3];
            await draw_deposit_address2(
                cid, r.address, contract,
                txs0, temp_div);
            await draw_release_sub_button(cid, r, sa, contract, temp_div);
        });
        return(callback());
    };
    async function draw_release_sub_button(
        cid, r, sa, contract, temp_div
    ){
        // make an offer to sell sell_contract type 1 for the cost of using the oracle.
        // if the offer already exists, don't display the button todo
        var balance = sa[1];
        var dc = dex_tools.buy_veo_contract_decoder(contract);
        var sell_contract = await sell_contract_api(dc.source);
        var dcs = dex_tools.sell_veo_contract_decoder(
            sell_contract);
        var swap = await dex_tools.lowest2(
            ZERO, 0, dc.source, IP, 1);//01%
        var price = (swap[1][9] - (5 * fee)) / swap[1][6];
        console.log(JSON.stringify(swap));
        console.log(JSON.stringify(price));
        if(price < 0.051){
            var p = document.createElement("p");
            p.innerHTML = "you have already released the subcurrency.";
            temp_div.appendChild(p);
            return(0);
        };
        var release_button = button_maker3("you have already been paid. release the subcurrency.", async function(button){
            function cleanup(){
                button.value = "done";
                button.onclick = function(){return(0)};
            };
            var offer01 = {};
            var block_height = headers_object.top()[1];
            offer01.start_limit = block_height - 1;
            offer01.end_limit = block_height + 2000;
            offer01.amount1 = balance;
            offer01.amount2 = Math.round((balance * 0.005) + (fee*5));
            offer01.cid1 = dc.source;
            offer01.cid2 = ZERO;
            offer01.type2 = 0;
            offer01.type1 = 1;
            offer01.acc1 = keys.pub();
            offer01.partial_match = true;
            await apost_offer(display, IP, offer01);
            refresh();
        });
        temp_div.appendChild(release_button);
    };
    async function draw_release_button(
        cid, r, sa, contract, temp_div
    ){
        //the account that Accepted the swap offer.
        //this is for buying the winnings and losings from the other account with 2 swap offers, and combining them all back to veo.
        var balance = sa[1];
        var dc = dex_tools.buy_veo_contract_decoder(contract);
        var sell_contract = await sell_contract_api(dc.source);
        var dcs = dex_tools.sell_veo_contract_decoder(
            sell_contract);
        //temp_div.appendChild(send_to_p);

        //todo. only display this button if they already released the subcurrency.
        var swap = await dex_tools.lowest2(
            ZERO, 0, dc.source, IP, 1);//01%
        console.log(JSON.stringify(swap));
        var price = (swap[1][9] - (5 * fee)) / swap[1][6];
        console.log(price);
        if(price > 0.051){
            var p = document.createElement("p");
            p.innerHTML = "waiting for them to release the subcurrency.";
            temp_div.appendChild(p);
            return(0);
        };
        var release_button = button_maker3("you have already been paid. release the veo.", async function(button){
            //todo. should accept _both_ of the swap offers, and do _2_ combine tx to get back to veo.

            function cleanup(){
                button.value = "done";
                button.onclick = function(){return(0)};
            };
            var swap2 = await dex_tools.lowest2(
                ZERO, 0, dc.cid, IP, 2);//99%
            var consensus_state_contract =
                await rpc.apost(["contracts", cid]);
            var sink = consensus_state_contract[10];
            var buy_combine_tx = [
                "contract_use_tx", 0,0,0,
                sink, -balance, 2,
                dc.source, dc.source_type];
            var sell_combine_tx = [
                "contract_use_tx", 0,0,0,
                dc.source, -balance, 2,
                ZERO, 0];
            var [winnings_tx, winnings_tx2] =
                await buy_veo_contract.both_winners(dc.cid);
            swaps.make_tx(swap, 1000000, async function(txs){
                swaps.make_tx(swap2, 1000000, async function(txs2){
                    var tx = await multi_tx.amake(
                        txs
                            .concat(txs2)
                            .concat([
                                buy_combine_tx,
                                winnings_tx,
                                winnings_tx2,
                                sell_combine_tx
                            ]));
                    var stx = keys.sign(tx);
                    var msg = await apost_txs([stx]);
                    display.innerHTML = msg;
                    if(!(msg === "server rejected the tx")){
                        cleanup();
                    };
                });
            });
        });
        temp_div.appendChild(release_button);
        //temp_div.appendChild(br());
        //temp_div.appendChild(br());
    };
    function is_child_of_scalar(contract){
        var dc = dex_tools
            .buy_veo_contract_decoder(contract);
        var Source = dc.source;
        var SourceType = dc.source_type;
        if(Source === ZERO) {
            return(false);
        };
        return(true);
    }
    async function draw_deposit_address2(
        cid, address, contract, txs, temp_div
    ){
        //the account that Publish the swap offer.
        var dcb = dex_tools.buy_veo_contract_decoder(
            contract);
        var sell_contract = await sell_contract_api(dcb.source);
        var dcs = dex_tools.sell_veo_contract_decoder(
            sell_contract);
        var description = document.createElement("span");
        var buy_address = await buy_veo_contract.
            get_deposit_address(dcb.cid, txs);
        description.innerHTML = "first confirm that you have received "
            .concat(dcs.receive)
            .concat(" at ")
            .concat(dcs.address)
            .concat(" by ")
            .concat(dcs.date)
            .concat(" with enough confirmations. Then send ")
            .concat(dcb.amount)
            .concat(" ")
            .concat(dcb.ticker)
            .concat(" in blockchain ")
            .concat(dcb.blockchain)
            .concat(" at address ")
            .concat(buy_address.address)
            .concat(" by date ")
            .concat(dcb.date)
            .concat(" and release your subcurrency so that they can release the veo to you. ")
        ;
        temp_div.appendChild(description);
    };
    async function draw_deposit_address1(
        cid, address, contract, txs, temp_div
    ){
        //this is for buying buy_contract type 2 for 99% of it's max, so you can combine cancel back to veo.
        //the account that Accepted the swap offer.
        var dcb = dex_tools.buy_veo_contract_decoder(
            contract);
        var sell_contract = await sell_contract_api(dcb.source);
        console.log(JSON.stringify(dcb.source));
        console.log(JSON.stringify(sell_contract));
        var dcs = dex_tools.sell_veo_contract_decoder(
            sell_contract);
        var description = document.createElement("span");
        var buy_address = await buy_veo_contract.
            get_deposit_address(dcb.cid, txs);
        description.innerHTML = "send "
            .concat(dcs.receive)
            .concat(" to ")
            .concat(dcs.address)
            .concat(" by ")
            .concat(dcs.date)
            .concat(" then wait to receive ")
            .concat(dcb.amount)
            .concat(" of ")
            .concat(dcb.ticker)
            .concat(" in blockchain ")
            .concat(dcb.blockchain)
            .concat(" at address ")
            .concat(buy_address.address)
            .concat(" by date ")
            .concat(dcb.date)
            .concat(" before releasing the veo ")
        ;
        temp_div.appendChild(description);
    };
    function new_description_maker(sell_contract, sell_offer, buy_contract, buy_offer){
        var buy2 = buy_contract;
        var sell2 = sell_contract;
        var description = document.createElement("span");
        var block_height = headers_object.top()[1];
        var r = "an offer to sell "
            .concat(buy2.amount)
            .concat(" of ")
            .concat(buy2.ticker)
            .concat(" on blockchain ")
            .concat(buy2.blockchain)
            .concat(" to gain ")
            .concat(sell2.receive)
            .concat(" to ")
            .concat(sell2.address)
            .concat(" ; Offer expires in ")
            .concat(sell_offer.end_limit - block_height)
            .concat(" blocks.");
        description.innerHTML = r;
        return(description);
    };
    async function accept_cancel_buttons(
        temp_div, callback
    ){
        var sell_offers =
            await swap_offer_downloader.doit(
                1, "sell_veo");
        //l: [[contract, [[tid, offer]...]]...]
        var buy_offers =
            await swap_offer_downloader.doit(
                2, "buy_veo");
        //l: [[contract, [[tid, signed_offer]...]]...]

        //we are looking for a pair of contracts.
        //contract 1: sell veo.
        //contract 2: buy veo. priced in contract 1 type 2
        var pairs = find_pairs(
            to_triples(sell_offers),
            to_triples(buy_offers));
        //[[[scontract, tid, offer], sswap, [bcontract, tid, offer], bswap]...]
        //todo, find lots more relationships between pairs of offers that can be enforced for security. Some amounts need to match for example.
        pairs.map(function(f){
            var raw_sell_contract = f[0][0];
            var sell_contract = dex_tools.sell_veo_contract_decoder(f[0][0]);
            var sell_offer = f[1];
            var sell_tid = f[0][1];
            var raw_sell_offer = f[0][2];
            var buy_contract = dex_tools.buy_veo_contract_decoder(f[2][0]);
            var buy_tid = f[2][1];
            var raw_buy_offer = f[2][2];
            var buy_offer = f[3];
            var description = new_description_maker(
                sell_contract, sell_offer,
                buy_contract, buy_offer);
            if(keys.pub() === f[1].acc1){
                console.log("cancel button");
                var cancel_button = button_maker2("cancel the offer", async function(){
                    var trade_cancel_tx = ["trade_cancel_tx", sell_offer.acc1, 2, fee, sell_offer.salt];//we should cancel the offer related to the sell veo contract. once it is canceled, then the second trade is unmatchable, because you wont have the subcurrency to complete it.
                    var stx = keys.sign(trade_cancel_tx);
                    var response = await apost_txs([stx]);
                    display.innerHTML = response;
                    setTimeout(refresh, 1000);
                });
                description.innerHTML =
                    "you made this offer; "
                    .concat(description.innerHTML);
                temp_div.appendChild(description);
                temp_div.appendChild(br());
                temp_div.appendChild(cancel_button);
                temp_div.appendChild(br());
                temp_div.appendChild(br());
            } else {
                console.log("accept button");
                var btc_address_input = text_input("address on other blockchain where you get paid.", temp_div);
                btc_address_input.value = "address2";
                var buy_coll = ((buy_offer.amount2) / (buy_offer.amount2 - buy_offer.amount1));
                var sell_coll = (sell_offer.amount2 / sell_offer.amount1);
                description.innerHTML =
                    description.innerHTML
                    .concat(" sell offer has collateralization: ")
                    .concat(sell_coll.toFixed(2))
                    .concat("; buy offer has collateralization: ")
                    .concat(buy_coll.toFixed(2))
                    .concat("; implied value of veo is ")
                    //.concat(sell_contract.ticker)
                    //.concat(" is ")
                    .concat(parseFloat(sell_contract.receive) * token_units()/ sell_offer.amount1)
                    .concat(" ")
                    .concat(sell_contract.ticker)
                    .concat(" or ")
                    .concat(parseFloat(buy_contract.amount) * token_units()/ sell_offer.amount1)
                    .concat(" ")
                    .concat(buy_contract.ticker)
                    .concat(". You need to verify that this is the actual price of VEO before accepting this trade. ")
                ;
                if(!(buy_offer.amount2 === sell_offer.amount2)){
                    console.log("blocking offer that doesn't use the same amount of veo collateral for both steps");
                    return(0);
                };
                if((buy_coll > 2) || (sell_coll > 2)){
                    console.log("blocking excessively collateralized offer");
                    return(0);
                };
                temp_div.appendChild(description);
                temp_div.appendChild(br());
                var accept_button = button_maker2("accept the offer", async function(){
                    var my_acc = await rpc.apost(
                        ["account", keys.pub()]);
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
                    var oracle_start_height = buy_contract.oracle_start_height;
                    var reusable_settings =
                        buy_veo_contract
                        .reusable_settings(
                            buy_contract.oracle_start_height,
                            buy_contract.blockchain,
                            buy_contract.amount,
                            buy_contract.ticker,
                            buy_contract.date);
                    console.log(JSON.stringify(
                        buy_contract));
                    var contract1bytes =
                        await buy_veo_contract
                        .contract_to_1bytes(
                            buy_contract.raw);
                    var contract_txs = buy_veo_contract.choose_deposit_address_tx(
                        deposit_address, contract1bytes,
                        buy_offer.acc1, reusable_settings,
                        buy_tid, nonce,
                        sell_offer.cid2, 2);
                    var sell_new_contract_tx =
                        new_scalar_contract.make_tx(
                            sell_contract.text, 1);
                    swaps.make_tx(raw_sell_offer, 1, async function(sell_swap_txs){
                        
                        swaps.make_tx(raw_buy_offer, 1, async function(swap_txs){
                            var evidence0 = contract_txs[1];
                            evidence0[2] = nonce + 1;
                            var evidence = keys.sign(evidence0);
                            var timeout0 = contract_txs[2];
                            timeout0[2] = nonce+2;
                            var timeout = keys.sign(timeout0);
                            var txs = [contract_txs[0]]
                                .concat([sell_new_contract_tx])
                                .concat(sell_swap_txs.slice(0,-1))
                                .concat(swap_txs);
                            var f = function(tx){
                                var CH = tx[2];
                                var MT = tx[4];
                                var Source = tx[5];
                                var SourceType = tx[6];
                                var cid = binary_derivative.id_maker(CH, MT, Source, SourceType);
                                return(cid);
                            };
                            var tx = await multi_tx.amake(txs);
                            var stx = keys.sign(tx);
                            var response = await apost_txs([stx, evidence, timeout]);
                            var offer99 = swaps.accept_99(buy_offer);
                            await apost_offer(display, IP, offer99);
                            display.innerHTML = display.innerHTML
                                .concat("; ")
                                .concat(response);
                            setTimeout(refresh, 1000);
                        });
                    });
                });
                temp_div.appendChild(accept_button);
                temp_div.appendChild(br());
                temp_div.appendChild(br());
            };
        });
        
        return(callback());

    };
    function to_triples(l){
        //[[contract, [[tid, offer]...]]...] ->
        //[[contract, tid, offer]...]
        if(l.length === 0){
            return(l);
        };
        return(to_triples2(l[0])
               .concat(to_triples(l.slice(1))));
    };
    function to_triples2(l){
        var contract = l[0];
        return(l[1].map(function(x){
            return([contract].concat(x))
        }));
    };
    function find_pairs(sell_offers, buy_offers){
        //contract 1: sell veo.
        //contract 2: buy veo. priced in contract 1 type 2
        //acc1 should match.
        //sell_offer cid1 = ZERO
        //buy_offer cid1 = ZERO, cid2 = buy_contract
        var r = [];
        sell_offers.map(function(so){
            var soffer = swaps.unpack(so[2]);
            buy_offers.map(async function(bo){
                var boffer = swaps.unpack(bo[2]);
                if(soffer.acc1 === boffer.acc1){
                    var sell_cid = soffer.cid2;
                    var buy_cid = boffer.cid2;
                    var buy_contract = bo[0];
                    var source = buy_contract[2];
                    var source_type = buy_contract[3];
                    if((source_type === 2) &&
                       (source === sell_cid)){
                        r = r.concat(
                            [[so, soffer,
                              bo, boffer]]);
                    };
                };
            });
        });
        return(r);
    };
    return({
    });
};
