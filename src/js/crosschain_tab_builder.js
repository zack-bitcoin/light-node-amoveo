function crosschain_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var fee = 200000;
    var display = document.createElement("div");
    display.innerHTML = "ready.";
    var title = document.createElement("h3");
    title.innerHTML = "Crosschain Decentralized Exchange ";
    div.appendChild(title);
    var details = document.createElement("p");
    details.innerHTML = "Sell a currency on the Amoveo blockchain to get coins on another blockchain. Manage these kinds of trades.";
    div.appendChild(details);
    div.appendChild(display);
    var IP = default_ip();

    //Make trade offer interface
    var trade_offer_title = document.createElement("h3");
    trade_offer_title.innerHTML = "Make Trade Offer";
    div.appendChild(trade_offer_title);
    var other_blockchain_input = text_input("Name of the other blockchain where you want to receive value. (i.e. Ethereum)", div);
    div.appendChild(br());
    var ticker_input = text_input("Name of the currency that you want to be paid in. (i.e. Eth)", div);
    div.appendChild(br());
    var other_address_input = text_input("Your address on the other blockchain. Needs to be a fresh address that has never received currency before", div);
    div.appendChild(br());
    var receive_amount_input = text_input("Amount of currency you want to receive. (i.e. 1.205)", div);
    div.appendChild(br());
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "Currency you are spending: ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());
    var spend_amount_input = text_input("Amount of currency you want to send. (i.e. 0.15)", div);
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

    var security_amount_input = text_input("How much currency should your counterparty need to lock into the contract as a security deposit to enforce that they actually deliver. (they need to lock up the same currency type as you are selling, default is 10% the amount you are selling) (i.e. 0.015)", advanced_interface);
    advanced_interface.appendChild(br());
    var hours_input = text_input("How many hours do they have until the money needs to arrive in your account on the other blockchain. Giving more time can allow for them to pay a lower fee, and you to trade at a better price. Don't make it too big, we need to wait this long to run the oracle. (i.e. 48)", advanced_interface);
    hours_input.value = "48";
    advanced_interface.appendChild(br());
    //look at create_tab_builder to see about dates.
    var many_blocks_to_match_input = text_input("How many Amoveo blocks until your trade offer should expire as invalid. (Amoveo has about 130 blocks per day)(i.e. 130)", advanced_interface);
    many_blocks_to_match_input.value = "130";
    advanced_interface.appendChild(br());

    //test values
    other_blockchain_input.value = "Bitcoin";
    ticker_input.value = "BTC";
    other_address_input.value = "1FdyGS6MSaWsrKwN6BSzrss6K55fj9Dft1";
    receive_amount_input.value = "0.01";
    spend_amount_input.value = "1";
    /*
    //security_amount_input.value = "0.3";
    hours_input.value = "48";
    many_blocks_to_match_input.value = "30";
    */

    var button = button_maker3("make crosschain trade offer", crosschain_offer);
    div.appendChild(button);
    div.appendChild(br());

    async function crosschain_offer(button){
        var d = new Date();
        if(parseFloat(hours_input.value, 10) > (24*7)){
            display.innerHTML = "you cannot make a trade that needs to wait more than a week to run the oracle.";
            return(0);
        };
        d.setTime(d.getTime() + (parseFloat(hours_input.value, 10) * 60 * 60 * 1000)); 
        var date = d.toUTCString();
        var date = date.slice(5, 22).concat(" GMT");
        var [cid, oracle_text] =
            await sell_veo_contract.oid(
                other_blockchain_input.value,
                other_address_input.value,
                receive_amount_input.value,
                ticker_input.value,
                date);
        var Source, SourceType;
        if(selector.value == "veo"){
            Source = ZERO;
            SourceType = 0;
        } else {
            var V = JSON.parse(selector.value);
            Source = V[0];
            SourceType = V[1];
        };

        var unused_cid = await rpc.apost(
           ["add", 3, btoa(oracle_text), 0, 1,
            Source, SourceType], IP, 8090);
        //rpc.post(["add", 3, btoa(oracle_text), 0, 1, Source, SourceType], function(unused_cid){
        if(!(cid === unused_cid)){
            console.log("calculated bad cid");
            return(0);
        };
        var my_acc = await rpc.apost(
            ["account", keys.pub()]);
        //rpc.post(["account", keys.pub()], function(my_acc){
        if(my_acc === 0){
            display.innerHTML = "Load your private key first.";
            return(0);
        };
        function callback2() {
            return(crosschain_offer2(spend_amount, Source, SourceType, cid));
        };
        var spend_amount = Math.round(parseFloat(spend_amount_input.value, 10)*100000000);
        if(selector.value === "veo"){
            if (my_acc[1] < spend_amount) {
                display.innerHTML = "insufficient veo to make that swap offer";
                return(0);
            } else {
                return(callback2());
            }
        } else {
            var sub_id = sub_accounts.normal_key(keys.pub(), Source, SourceType);
            sub_accounts.rpc(sub_id, function(sa){
                if(sa[1] < spend_amount){
                    display.innerHTML = "insufficient subcurrency to make that swap offer";
                    return(0);
                } else {
                    return(callback2());
                };
            });
        };
    };
    function crosschain_offer2(spend_amount, Source, SourceType, cid){
        var amount2;
        if(security_amount_input.value === ""){
            amount2 = Math.round(spend_amount * 1.1);
        } else {
            amount2 = spend_amount + Math.round(parseFloat(security_amount_input.value, 10)*100000000);
        };
        var offer = {};
        var block_height = headers_object.top()[1];
        offer.start_limit = block_height - 1;
        offer.end_limit = block_height + parseInt(many_blocks_to_match_input.value, 10);
        offer.amount1 = spend_amount;
        offer.amount2 = amount2;
        offer.cid1 = Source;
        offer.cid2 = cid;
        offer.type1 = SourceType;
        offer.type2 = 1;
        offer.acc1 = keys.pub();
        offer.partial_match = false;

        var offer99 = swaps.offer_99(offer);
        apost_offer(display, IP, offer, offer99);
        spend_amount_input.value = "";
    };

    var refresh_button = button_maker2("refresh available actions", refresh);
    div.appendChild(br());
    div.appendChild(refresh_button);
    div.appendChild(br());
    div.appendChild(br());
    var lists_div = document.createElement("div");
    div.appendChild(lists_div);

    async function refresh(){
        var temp_div = document.createElement("div");
        release_buttons(temp_div, function(){
            delivered_buttons(temp_div, function(){
                active_offers(temp_div, function(){
                    console.log("done making buttons");
                    lists_div.innerHTML = "";
                    lists_div.appendChild(temp_div);
                });
            });
        });
    };
    function is_sell_veo_contract(contract){
        var contract_text = atob(contract[1]);
        return(contract_text
               .match(/has received less than/));
    };
    async function contract_api(cid){
        var r = await rpc.apost(
            ["read", 3, cid], IP, 8090);
        return(r);
    };
    async function release_buttons(temp_div, callback){
        var l = await swap_offer_downloader.subaccounts(
            1, is_sell_veo_contract, contract_api);
        //[[cid, sa, contract]...]
        l.map(function(x){
            var cid = x[0];
            var sa = x[1];
            var contract = x[2];
            return(release_dispute_buttons(
                cid, sa, contract, temp_div))});
        return(callback());
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
    function release_dispute_buttons(cid, sa, contract, temp_div){
        var balance = sa[1];
        var contract_text = atob(contract[1]);
        var Source = contract[5];
        var SourceType = contract[6];
        var received_text = description_maker2(contract_text);
        var description = document.createElement("span");
        description.innerHTML = "you are buying "
            .concat(received_text);
        var offer = {};
        var block_height = headers_object.top()[1];
        offer.start_limit = block_height - 1;
        offer.end_limit = block_height + 1000;
        offer.amount1 = balance;//amount to send
        offer.cid2 = Source;
        offer.cid1 = cid;
        offer.type2 = SourceType;
        offer.type1 = 1;
        offer.acc1 = keys.pub();
        offer.partial_match = false;
        var release_button = button_maker3("you have already been paid", async function(button){
            //release button to sell for 0.2% + fee.
            offer.amount2 = Math.round((balance*0.002) + (fee*5));//new oracle, oracle report, oracle close, withdraw winnings, oracle winnings
            function cleanup(){
                button.value = "done";
                button.onclick = function(){return(0)};
            };
            function we_post_first(){
                apost_offer(display, IP, offer);
                cleanup();
            };
            //first we should look up if they already posted an offer to sell
            //we should look in our existing swap offers instead of re-downloading. 
            var markets = await rpc.apost(["markets"], IP, 8090);
            markets = markets.slice(1);
            var market = find_market(markets, offer.cid2, offer.type2, offer.cid1, 2);
            if(market === 0){
                return(we_post_first());
            };
            var mid = market[2];
            var market_data = await rpc.apost(["read", mid], IP, 8090);
            market_data = market_data[1];
            var orders = market_data[7].slice(1);
            var order = lowest_price_order(orders);
            var tid = order[3];
            var trade = await rpc.apost(["read", 2, tid], IP, 8090);
            var swap = trade;
            
            release(offer, swap, cleanup);
        });
        temp_div.appendChild(description);
        temp_div.appendChild(release_button);
        temp_div.appendChild(br());
        temp_div.appendChild(br());
    };
    function release(offer, swap, cleanup){
        var combine_tx = [
            "contract_use_tx", 0,0,0, offer.cid1,
            -offer.amount1, 2, offer.cid2, offer.type2];
        swaps.make_tx(swap, 1000000, async function(txs){
            var tx = await multi_tx.amake(
                txs.concat([combine_tx]));
            var stx = keys.sign(tx);
            var msg = await apost_txs([stx]);
            display.innerHTML = msg;
            if(!(msg === "server rejected the tx")){
                cleanup();
            };
        }); 
    };
    async function delivered_buttons(temp_div, callback){
        var l = await swap_offer_downloader.subaccounts(
            2, is_sell_veo_contract, contract_api);
        l.map(function(x){
            var cid = x[0];
            var sa = x[1];
            var contract = x[2];
            return(delivered_canceled_buttons(
                temp_div, cid, sa, contract))});
        return(callback());
    };
    function delivered_canceled_buttons(
        temp_div, cid, sa, contract)
    {
        var balance = sa[1];
        var contract_text = atob(contract[1]);
        var Source = contract[5];
        var SourceType = contract[6];
        var received_text = description_maker2(contract_text)
            .concat(" using contract ")
            .concat(cid);
        var description = document.createElement("span");
        description.innerHTML = "you are selling "
            .concat(received_text);
        temp_div.appendChild(description);
        temp_div.appendChild(br());
        temp_div.appendChild(br());
    };
    function description_maker2(contract_text){
        var address = contract_text.match(/address \w*/)[0];
        var receive = contract_text.match(/\d[\.\d]* \w* before/)[0].slice(0,-6);
        var r = (receive)
            .concat(" to ")
            .concat(address);
        return(r);
    };
    function description_maker(cid1, type1, amount1, contract_text){
        var d2 = description_maker2(contract_text);
        var description = document.createElement("span");
        var spend_stuff;
        if(cid1 === ZERO){
            spend_stuff = "VEO";
        } else {
            spend_stuff = cid1
                .concat(" type ")
                .concat(type1);
        };
        description.innerHTML = "you offered to trade "
            .concat((amount1/100000000).toFixed(8))
            .concat(" ")
            .concat(spend_stuff)
            .concat(" in exchange for ")
            .concat(d2);
        return(description);
    };
    async function active_offers(temp_div, callback){
        display_active_offers_faster(temp_div);
        return(callback());
    };

    async function display_active_offers_faster(temp_div){
        var l =
            await swap_offer_downloader.doit(
                1, "sell_veo");
        //l: [[contract, [[tid, offer]...]]...]
        l.map(async function(a){
            var contract = a[0];
            var offers = a[1];
            var contract_text = atob(contract[1]);
            offers.map(async function(offer_x){
                var tid = offer_x[0];
                var trade = offer_x[1];
                display_active_offers_order(
                    trade, temp_div, contract_text,
                    tid);
            });
        });
    };
    async function display_active_offers_order(
        trade, temp_div, contract_text,
        tid){
        var offer = swaps.unpack(trade);
        var description = description_maker(
            offer.cid1, offer.type1, offer.amount1, contract_text);
        var block_height = headers_object.top()[1];
        if(offer.acc1 === keys.pub()){
            var cancel_button = button_maker2(
                "cancel trade", function(){
                    var tx = ["trade_cancel_tx", keys.pub(), 2000000, fee, offer.salt];
                    var stx = keys.sign(tx);
                    post_txs([stx], function(x){
                        display.innerHTML = x;
                    });
                    return(0);
                });
            temp_div.appendChild(description);
            temp_div.appendChild(cancel_button);
            temp_div.appendChild(br());
            return(0);
        };
        description.innerHTML =
            description.innerHTML.replace(
                /you offered to trade/,
                "they offered to give")
            .concat(" ; The money must arrive before ")
            .concat(contract_text.slice(-21))
            .concat(" ; Offer expires in ")
            .concat(offer.end_limit - block_height)
            .concat(" blocks.");
        temp_div.appendChild(description);
        var link = document.createElement("a");
        link.href = "offer_explorer.html?tid="
            .concat(tid);
        link.innerHTML = "contract offer in explorer ";
            link.target = "_blank";
        temp_div.appendChild(link);
        var accept_button = button_maker2("accept the offer", function(){
            var new_contract_tx = new_scalar_contract.make_tx(contract_text, 1);
            swaps.make_tx(trade, 1, async function(txs){
                var tx = await multi_tx.amake([new_contract_tx].concat(txs));
                var stx = keys.sign(tx);
                var msg = apost_txs([stx]);
                if(msg === "server rejected the tx"){
                    display.innerHTML = msg;
                } else {
                    display.innerHTML = "accepted trade offer and " .concat(msg);
                    var offer99 = swaps.accept_99(offer);
                    apost_offer(display, IP, offer99);
                }
            });
        });
        temp_div.appendChild(accept_button);
        temp_div.appendChild(br());
        temp_div.appendChild(br());
        return(0);
    };
    return({});
};
