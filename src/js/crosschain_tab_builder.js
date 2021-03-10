function crosschain_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var fee = 200000;
    var display = document.createElement("div");
    display.innerHTML = "ready.";
    var title = document.createElement("h3");
    title.innerHTML = "Crosschain Decentralized Exchange ";
    div.appendChild(title);
    //div.appendChild(br());
    var details = document.createElement("p");
    details.innerHTML = "Sell a currency on the Amoveo blockchain to get coins on another blockchain. Manage these kinds of trades.";
    div.appendChild(details);
    //div.appendChild(br());
    div.appendChild(display);
    //div.appendChild(br());
    var IP = "159.89.87.58";

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

    function crosschain_offer(button){
        var d = new Date();
        if(parseFloat(hours_input.value, 10) > (24*7)){
            display.innerHTML = "you cannot make a trade that needs to wait more than a week to run the oracle.";
            return(0);
        };
        d.setTime(d.getTime() + (parseFloat(hours_input.value, 10) * 60 * 60 * 1000)); 
        var date = d.toUTCString();
        var date = date.slice(5, 22).concat(" GMT");
        var oracle_text = "the "
            .concat(other_blockchain_input.value)
            .concat(" address ")
            .concat(other_address_input.value)
            .concat(" has received less than ")
            .concat(receive_amount_input.value)
            .concat(" ")
            .concat(ticker_input.value)
            .concat(" before ")
            .concat(date);

        var Source, SourceType;
        if(selector.value == "veo"){
            Source = ZERO;
            SourceType = 0;
        } else {
            var V = JSON.parse(selector.value);
            Source = V[0];
            SourceType = V[1];
        };
        
        rpc.post(["add", 3, btoa(oracle_text), 0, 1, Source, SourceType], function(cid){
            rpc.post(["account", keys.pub()], function(my_acc){
                if(my_acc === 0){
                    display.innerHTML = "Load your private key first.";
                    return(0);
                };
                function callback2() {
                    return(crosschain_offer2(spend_amount, Source, SourceType, my_acc, cid));
                };
                var spend_amount = Math.round(parseFloat(spend_amount_input.value, 10)*100000000);
                console.log(selector.value);
                console.log(spend_amount);
                console.log(my_acc);
                //return(0);
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
            });
        }, IP, 8090);
        //button.value = "done";
        //button.onclick = function(){return(0)};
    };
    function crosschain_offer2(spend_amount, Source, SourceType, my_acc, cid){
        var amount2;
        if(security_amount_input.value === ""){
            amount2 = Math.round(spend_amount * 1.1);
        } else {
            amount2 = spend_amount + Math.round(parseFloat(security_amount_input.value, 10)*100000000);
        };
        var offer = {};
        offer.nonce = my_acc[2] + 1;
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
        post_offer(offer);
        spend_amount_input.value = "";
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
        cancel_buttons(temp_div, function(){
            release_buttons(temp_div, function(){
                delivered_buttons(temp_div, function(){
                    active_offers(temp_div, function(){
                        console.log("done making buttons");
                        lists_div.innerHTML = "";
                        lists_div.appendChild(temp_div);
                    });
                });
            });
        });
    };
    function cancel_buttons(temp_div, callback){
        console.log("making cancel buttons");
        rpc.post(["markets"], function(markets){
            markets = markets.slice(1);
            //console.log(JSON.stringify(markets));
            display_orders_from_markets(markets, temp_div, function(){
                callback();
            });
        }, IP, 8090);
    };
    function display_orders_from_markets(
        markets, temp_div, callback
    ){
        if(markets.length === 0) {
            return(callback());
        };
        function callback2(){
            return(display_orders_from_markets(markets.slice(1), temp_div, callback));
        };
        var market = markets[0];
        var mid = market[2];
        rpc.post(["read", mid], function(market_data){
            //console.log(JSON.stringify(market_data));
            market_data = market_data[1];
            var orders = market_data[7];
            var type2 = market_data[6];
            if(type2 === 1){
                display_orders(orders.slice(1), temp_div, function(){
                    return(callback2());
                });
            } else {
                    return(callback2());
            };
        }, IP, 8090);
    };
    function display_orders(orders, temp_div, callback){
        if(orders.length === 0){
            return(callback());
        };
        var order = orders[0];
        var price = order[1];
        var amount = order[2];
        var tid = order[3];
        rpc.post(["read", 2, tid], function(trade){
            //console.log(JSON.stringify(trade));
            var swap_offer2 = trade[1];
            var from = swap_offer2[1];
            var amount1 = swap_offer2[6];
            var cid1 = swap_offer2[4];
            var type1 = swap_offer2[5];
            var cid2 = swap_offer2[7];
            var salt = swap_offer2[10];
            if(from === keys.pub()){
                rpc.post(["read", 3, cid2], function(contract){
                    //console.log(JSON.stringify(contract));
                    var contract_text = atob(contract[1]);
                    //console.log(contract_text);
                    var description = description_maker(cid1, type1, amount1, contract_text);

                    var cancel_button = button_maker2("cancel trade", function(){
                        console.log("canceling");
                        var tx = ["trade_cancel_tx", keys.pub(), 2000000, fee, salt];
                        var stx = keys.sign(tx);
                        console.log(JSON.stringify(stx));
                        post_txs([stx], function(x){
                            display.innerHTML = x;
                        });
                        return(0);
                    });
                    var block_height = headers_object.top()[1];
                    if(block_height > 152000){
                        //hard update 45 is needed for canceling orders.
                        temp_div.appendChild(description);
                        temp_div.appendChild(cancel_button);
                        temp_div.appendChild(br());
                    };
                    return(display_orders(orders.slice(1), temp_div, callback));
                }, IP, 8090);
            } else {
                return(display_orders(orders.slice(1), temp_div, callback));
            };
        }, IP, 8090);
    };

    function release_buttons(temp_div, callback){
        console.log("making release buttons");
        rpc.post(["account", keys.pub()], function(
            account
        ){
            if(account === "error"){
                return(callback());
            };
            account = account[1];
            var subaccounts = account[3];
            //console.log(JSON.stringify(account));
            //console.log(JSON.stringify(subaccounts));
            return(release_subaccounts_loop(
                temp_div, subaccounts.slice(1).reverse(),
                callback));
            //return(callback());
        }, IP, 8091);//the explorer
    };
    function release_subaccounts_loop(
        temp_div, subaccounts, callback){
        if(subaccounts.length === 0){
            return(callback());
        };
        var callback2 = function(){
            return(release_subaccounts_loop(
                temp_div, subaccounts.slice(1),
                callback));
        };
        var cid = subaccounts[0];
        var id = sub_accounts.normal_key(keys.pub(), cid, 1);
        sub_accounts.rpc(id, function(sa){
            if(!(sa === 0)){
                var balance = sa[1];
                if(balance > 100000){
                    rpc.post(["read", 3, cid], function(contract){
                        //console.log(JSON.stringify(contract));
                        if(!(contract === 0)){
                            var Source = contract[5];
                            var SourceType = contract[6];
                            var contract_text = atob(contract[1]);
if(contract_text.match(/has received less than/)){
    var received_text = description_maker2(contract_text);
    var description = document.createElement("span");
    description.innerHTML = "you are buying "
        .concat(received_text);
    //temp_div.appendChild(description);
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
    offer.partial_match = true;
    var release_button = button_maker3("you have already been paid", function(button){
        //release button to sell for 0.2% + fee.
        rpc.post(["account", keys.pub()], function(my_acc){
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
            rpc.post(["markets"], function(markets){
                markets = markets.slice(1);
                var market = find_market(markets, offer.cid2, offer.type2, offer.cid1, 2);
                if(market === 0){
                    //console.log("cannot find market");
                    //return(0);
                    return(we_post_first());
                } else {
                    var mid = market[2];
                    rpc.post(["read", mid], function(market_data){
                        market_data = market_data[1];
                        var orders = market_data[7].slice(1);
                        var order = lowest_price_order(orders);
                        var tid = order[3];
                        rpc.post(["read", 2, tid], function(trade){
                            console.log(JSON.stringify(trade));
                            var swap = trade;
                            var combine_tx = ["contract_use_tx", 0,0,0,
                                              offer.cid1, -offer.amount1, 2, offer.cid2, offer.type2];
                            swaps.make_tx(swap, 1000000, function(txs){
                                multi_tx.make(txs.concat([combine_tx]), function(tx){
                                    console.log(JSON.stringify(tx));
                                    var stx = keys.sign(tx);
	                            rpc.post(["txs", [-6, stx]],
                                             function(x) {
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
                        }, IP, 8090);
                    }, IP, 8090);
                };
            }, IP, 8090);
        });
    });
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
    temp_div.appendChild(description);
    temp_div.appendChild(release_button);
    temp_div.appendChild(br());
    var dispute_button = button_maker2("you have not been paid, and they ran out of time", function(){
        rpc.post(["account", keys.pub()], function(my_acc){
            //dispute button to sell for 99% - fee.
            offer.nonce = my_acc[2] + 1;
            offer.amount2 = Math.round((balance*0.995) - (fee*5));
            post_offer(offer);
        });
    });
    temp_div.appendChild(dispute_button);
    temp_div.appendChild(br());
    temp_div.appendChild(br());
    
    
    return(callback2());
} else {
    return(callback2());
};
                        } else {
                            return(callback2());
                        }
                    }, IP, 8090);//p2p_derivatives
                } else {
                    return(callback2());
                }
            } else {
                return(callback2());
            }
        });
    };
    function delivered_buttons(temp_div, callback){
        //after giving the coins on the other blockchain, use this button to get paid.
        console.log("making delivered buttons");
        rpc.post(["account", keys.pub()], function(
            account
        ){
            if(account === "error"){
                return(callback());
            };
            account = account[1];
            var subaccounts = account[3];
            return(delivered_subaccounts_loop(
                temp_div, subaccounts.slice(1).reverse(),
                callback));

        }, IP, 8091);//the explorer
    };
    function delivered_subaccounts_loop(
        temp_div, subaccounts, callback){
        if(subaccounts.length === 0){
            return(callback());
        };
        var callback2 = function(){
            return(delivered_subaccounts_loop(
                temp_div, subaccounts.slice(1),
                callback));
        };
        var cid = subaccounts[0];
        var id = sub_accounts.normal_key(keys.pub(), cid, 2);
        sub_accounts.rpc(id, function(sa){
            if(!(sa === 0)){
                var balance = sa[1];
                if(balance > 100000){
                    rpc.post(["read", 3, cid], function(contract){
                        if(!(contract === 0)){
                            var Source = contract[5];
                            var SourceType = contract[6];
                            var contract_text = atob(contract[1]);
 if(contract_text.match(/has received less than/)){
     var received_text = description_maker2(contract_text)
         .concat(" using contract ")
         .concat(cid);
     var description = document.createElement("span");
     description.innerHTML = "you are selling "
         .concat(received_text);
     temp_div.appendChild(description);
     var offer = {};
     var block_height = headers_object.top()[1];
     offer.start_limit = block_height - 1;
     offer.end_limit = block_height + 1000;
     offer.amount1 = balance;//amount to send
     offer.cid2 = Source;
     offer.cid1 = cid;
     offer.type2 = SourceType;
     offer.type1 = 2;
     offer.acc1 = keys.pub();
     offer.partial_match = true;
     var delivered_button = button_maker3("you have already delivered the coins on the other blockchain", function(button){
         rpc.post(["account", keys.pub()], function(my_acc){
             offer.nonce = my_acc[2] + 1;
             offer.amount2 = Math.round((balance*0.995) - (fee*5));
             post_offer(offer);
             button.value = "done";
             button.onclick = function(){return(0)};
         });
     });
     temp_div.appendChild(delivered_button);
     var cancel_button = button_maker2("you cannot or will not deliver the coins on the other blockchain", function(){
         //TODO, this should work like the "release_button". It should match an existing offer, if possible.
         rpc.post(["account", keys.pub()], function(my_acc){
             offer.nonce = my_acc[2] + 1;
             offer.amount2 = Math.round((balance*0.002) + (fee*5));
             post_offer(offer);
             
         });
     });
     temp_div.appendChild(br());
     temp_div.appendChild(cancel_button);
     temp_div.appendChild(br());
     temp_div.appendChild(br());
     return(callback2());
 } else {
     return(callback2());
 };
                        } else {
                            return(callback2());
                        };
                    }, IP, 8090);//p2p_derivatives
                } else {
                    return(callback2());
                };
            } else {
                return(callback2());
            }
        });
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
        console.log(contract_text);
        var d2 = description_maker2(contract_text);
        //var address = contract_text.match(/address \w*/)[0];
        //console.log(address);
        //var receive = contract_text.match(/\d\d* \w* /)[0];
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
    function post_offer(offer, second_offer){
        var signed_second_offer;
        if(!(second_offer)){
            signed_second_offer = 0;
        } else {
            var signed_second_offer = swaps.pack(second_offer);
        }
        var signed_offer = swaps.pack(offer);
        rpc.post(["add", signed_offer, signed_second_offer], function(z){
            display.innerHTML = "successfully posted your crosschain offer. ";
            var link = document.createElement("a");
            link.href = "contracts.html";
            link.innerHTML = "Your trade can be viewed on this page."
            link.target = "_blank";
            display.appendChild(link);
        }, IP, 8090);//8090 is the p2p_derivatives server
    };
    function active_offers(temp_div, callback){
        console.log("making active offers list");
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
        if(!(type2 === 1)){
            return(callback2());
        };
        rpc.post(["read", 3, cid2], function(contract){
            if(contract === 0){
                return(callback2());
            };
            //console.log(JSON.stringify(contract));
            var Source = contract[5];
            var SourceType = contract[6];
            var contract_text = atob(contract[1]);
            if(!(contract_text.match(/has received less than/))){
                return(callback2());
            };
            rpc.post(["read", mid], function(market_data){
                //console.log(JSON.stringify(market_data));
                market_data = market_data[1];
                var orders = market_data[7];
                display_active_offers_orders(orders.slice(1), temp_div, contract_text, Source, SourceType, callback2);
            }, IP, 8090);
        }, IP, 8090);
    };
    function display_active_offers_orders(orders, temp_div, contract_text, Source, SourceType, callback){
        if(orders.length === 0){
            return(callback());
        };
        function callback2(){
            return(display_active_offers_orders(orders.slice(1), temp_div, contract_text, Source, SourceType, callback));
        };
        console.log(JSON.stringify(orders));
        var order = orders[0];
        var price = order[1];
        var amount = order[2];
        var tid = order[3];
        rpc.post(["read", 2, tid], function(trade){
            var swap_offer2 = trade[1];
            var from = swap_offer2[1];
            var expires = swap_offer2[3];
            var amount1 = swap_offer2[6];
            var cid1 = swap_offer2[4];
            var type1 = swap_offer2[5];
            var cid2 = swap_offer2[7];
            var salt = swap_offer2[10];
            var block_height = headers_object.top()[1];
            var description = description_maker(cid1, type1, amount1, contract_text);
            description.innerHTML =
                description.innerHTML.replace(
                        /you offered to trade/,
                    "they offered to give")
                .concat(" ; The money must arrive before ")
                .concat(contract_text.slice(-21))
                .concat(" ; Offer expires in ")
                .concat(expires - block_height)
                .concat(" blocks.");
            temp_div.appendChild(description);
            var link = document.createElement("a");
            link.href = "offer_explorer.html?tid="
                .concat(tid);
            link.innerHTML = "contract offer in explorer ";
            link.target = "_blank";
            temp_div.appendChild(link);

            console.log(description.innerHTML);
            console.log(JSON.stringify(swap_offer2));
            var accept_button = button_maker2("accept the offer", function(){
                //TODO, this should also make an offer to sell your tokens for 99% of their value. the "already delivered button" stuff.
                var new_contract_tx = new_scalar_contract.make_tx(contract_text, 1, Source, SourceType)
                swaps.make_tx(trade, 1, function(txs){
                    multi_tx.make([new_contract_tx].concat(txs), function(tx){
                        console.log(JSON.stringify(txs));
                        console.log(JSON.stringify(tx));
                        var stx = keys.sign(tx);
	                rpc.post(["txs", [-6, stx]],
                                 function(x) {
                                     if(x == "ZXJyb3I="){
                                         display.innerHTML = "server rejected the tx";
   }else{
       display.innerHTML = "accepted trade offer and published tx. the tx id is "
           .concat(x)
           .concat(" please do not send the money until this transaction has been included in a block.");//todo, maybe we could write the address to deposit to here.
       console.log("attempting to make the 99% sell offer");
       console.log(JSON.stringify(swap_offer2));
       var amount1_from_swap_offer = swap_offer2[6];
       var amount2_from_swap_offer = swap_offer2[9];
       var cid2_from_swap_offer = swap_offer2[7];
       var cid1_from_swap_offer = swap_offer2[4];
       var type1_from_swap_offer = swap_offer2[5];
       var offer = {};
       var block_height = headers_object.top()[1];
       offer.start_limit = block_height - 1;
       offer.end_limit = block_height + 2000;
       offer.amount1 = amount2_from_swap_offer;
       offer.cid1 = cid2_from_swap_offer;
       offer.type1 = 2;
       offer.amount2 = Math.round((amount1_from_swap_offer * 0.995) - (fee*5));
       offer.cid2 = cid1_from_swap_offer;
       offer.type2 = type1_from_swap_offer;
       offer.acc1 = keys.pub();
       offer.partial_match = true;
         rpc.post(["account", keys.pub()], function(my_acc){
             offer.nonce = my_acc[2] + 1;
             console.log(JSON.stringify(offer));
             post_offer(offer);
         });
   }
                                 });
                    });
                });
            });
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
