function crosschain_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var fee = 200000;
    var display = document.createElement("div");
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
    selector_label.innerHTML = "currency you are spending: ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());
    var spend_amount_input = text_input("Amount of currency you want to send. (i.e. 0.15)", div);
    div.appendChild(br());
    var security_amount_input = text_input("How much currency should your counterparty need to lock into the contract as a security deposit to enforce that they actually deliver. (they need to lock up the same currency type as you are spending) (i.e. 0.015)", div);
    div.appendChild(br());
    var hours_input = text_input("How many hours do they have until the money needs to arrive in your account on the other blockchain. Giving more time can allow for them to pay a lower fee, and you to trade at a better price. (i.e. 48)", div);
    div.appendChild(br());
    //look at create_tab_builder to see about dates.
    var many_blocks_to_match_input = text_input("How many Amoveo blocks until your trade offer should expire as invalid. (Amoveo has about 130 blocks per day)(i.e. 130)", div);
    div.appendChild(br());

    //test values
    other_blockchain_input.value = "Dogecoin";
    ticker_input.value = "DOGE";
    other_address_input.value = "DCsXQW4HarTfDJ6PvP7e4Wbjd42Yhig5Tu";
    receive_amount_input.value = "100000";
    spend_amount_input.value = "1";
    security_amount_input.value = "0.3";
    hours_input.value = "48";
    many_blocks_to_match_input.value = "30";
    /*
    */

    var button = button_maker2("make crosschain trade offer", crosschain_offer);
    div.appendChild(button);
    div.appendChild(br());

    function crosschain_offer(){
        var d = new Date();
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
                var spend_amount = Math.round(parseFloat(spend_amount_input.value, 10)*100000000);
                var amount2 = spend_amount + Math.round(parseFloat(security_amount_input.value, 10)*100000000);
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
                /*
                var signed_offer = swaps.pack(offer);
                rpc.post(["add", signed_offer, 0], function(z){
                    display.innerHTML = "successfully posted your crosschain offer. ";
                    var link = document.createElement("a");
                    link.href = "contracts.html";
                    link.innerHTML = "Your trade can be viewed on this page."
                    link.target = "_blank";
                    display.appendChild(link);
                }, IP, 8090);//8090 is the p2p_derivatives server
                */
            });
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
        cancel_buttons(temp_div, function(){
            release_buttons(temp_div, function(){
                console.log("done making buttons");
                lists_div.innerHTML = "";
                lists_div.appendChild(temp_div);
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
    function display_orders_from_markets(markets, temp_div, callback){
        if(markets.length === 0) {
            return(callback());
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
                    return(display_orders_from_markets(markets.slice(1), temp_div, callback));
                });
            } else {
                    return(display_orders_from_markets(markets.slice(1), temp_div, callback));
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
                    temp_div.appendChild(description);

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
            account = account[1];
            var subaccounts = account[3];
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
                        var Source = contract[5];
                        var SourceType = contract[6];
                        if(!(contract === 0)){
                            var contract_text = atob(contract[1]);
if(contract_text.match(/has received less than/)){
    var received_text = description_maker2(contract_text);
    var description = document.createElement("span");
    description.innerHTML = "you are buying "
        .concat(received_text);
    temp_div.appendChild(description);
    var offer = {};
    var block_height = headers_object.top()[1];
    offer.start_limit = block_height - 1;
    offer.end_limit = block_height + 10000;
    offer.amount1 = balance;//amount to send
    offer.cid2 = Source;
    offer.cid1 = cid;
    offer.type2 = SourceType;
    offer.type1 = 1;
    offer.acc1 = keys.pub();
    offer.partial_match = true;
    var release_button = button_maker2("you have already been paid", function(){
        rpc.post(["account", keys.pub()], function(my_acc){
            //release button to sell for 0.2% + fee.
            offer.nonce = my_acc[2] + 1;
            offer.amount2 = Math.round((balance*0.002) + (fee*5));//new oracle, oracle report, oracle close, withdraw winnings, oracle winnings
            post_offer(offer);
        });
    });
    temp_div.appendChild(release_button);
    var dispute_button = button_maker2("you have not been paid, and they ran out of time", function(){
        rpc.post(["account", keys.pub()], function(my_acc){
            //dispute button to sell for 99% - fee.
            offer.nonce = my_acc[2] + 1;
            offer.amount2 = Math.round((balance*0.995) - (fee*5));
            post_offer(offer);
        });
    });
    temp_div.appendChild(dispute_button);
    temp_div.appendChild(description);
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
    /*
    function release_subaccounts_loop(
        temp_div, subaccounts, callback){
        //console.log("release subaccounts loop");
        if(subaccounts.length === 0){
            return(callback());
        };
        var callback2 = function(){
            return(release_subaccounts_loop(
                temp_div, subaccounts.slice(1),
                callback));
        };
        var cid = subaccounts[0];
        //console.log(cid);
        var id = sub_accounts.normal_key(keys.pub(), cid, 1);
        sub_accounts.rpc(id, function(sa){
            if(!(sa === 0)){
                var balance = sa[1];
                if(balance > 100000){
                    rpc.post(["read", 3, cid], function(contract){
                        //console.log(sa);
                        //console.log(cid);
                        //console.log(balance);
                        if(!(contract === 0)){
                            //console.log(contract);
                            var contract_text = atob(contract[1]);
                            if(contract_text.match(/has received less than/)){
                                //console.log(contract_text);
   rpc.post(["contract", cid], function(explorer_contract){
       explorer_contract = explorer_contract[1];
       var etxs = explorer_contract[5];
       var txid = etxs[1];
       rpc.post(["txs", txid], function(tx){
           //console.log(JSON.stringify(tx));
           var multi_tx = tx[1][3][1];
           var pub2 = multi_tx[1];
           var subtxs = multi_tx[4];
           var swap_tx = subtxs[2];
           var offer = swap_tx[4][1];
           var my_pub = offer[1];
           var cid_check = offer[7];
           var type_check = offer[8];
           var amount2 = offer[9];
           var cid1 = offer[4];
           var type1 = offer[5];
           var amount1 = offer[6];
           if(JSON.stringify(["swap_offer2", keys.pub(), cid, 1]) ===
              JSON.stringify([offer[0], my_pub, cid_check, type_check])){
               //console.log(pub2);
               //console.log(JSON.stringify(offer));
               var description = description_maker(cid1, type1, amount1, contract_text);
                   //var description = document.createElement("span");
               //var receive = contract_text.match(/\d\d* \w* /)[0];

               var release_button = button_maker2("release funds", function(){
                   rpc.post(["account", keys.pub()], function(acc){
                       var nonce = acc[2] + 1;
                       var fee = 200000;
                       var tx = ["sub_spend_tx", keys.pub(), nonce, fee, pub2, amount2, cid, 1];
                       var stx = keys.sign(tx);
                       console.log(JSON.stringify(stx));
                       post_txs([stx], function(x){
                           display.innerHTML = x;
                       });
                       return(0);
                   });
               });
               temp_div.appendChild(description);
               temp_div.appendChild(br());
               temp_div.appendChild(release_button);
               temp_div.appendChild(br());
               temp_div.appendChild(br());
               return(callback2());
           } else {
               console.log(offer[0]);
               console.log("bad tx error!");
               return(callback2());
           }
       }, IP, 8091);
   }, IP, 8091);//explorer
                            } else {
                                return(callback2());
                            };
                        } else {
                            return(callback2());
                        }
                    }, IP, 8090);//p2p_derivatives
                } else {
                    return(callback2());
                };
            } else {
                return(callback2());
            };
        });
    };
    */
    function description_maker2(contract_text){
        var address = contract_text.match(/address \w*/)[0];
        var receive = contract_text.match(/\d\d* \w* /)[0];
        var r = (receive)
            .concat(" in ")
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
            spend_stuff = "veo";
        } else {
            spend_stuff = cid1
                .concat(" type ")
                .concat(type1);
        };
        description.innerHTML = "you offered to trade "
            .concat((amount1/100000000).toFixed(8))
            .concat(" ")
            .concat(spend_stuff)
            .concat(" for ")
            .concat(d2);
        return(description);
    };
    function post_offer(offer){
        var signed_offer = swaps.pack(offer);
        rpc.post(["add", signed_offer, 0], function(z){
            display.innerHTML = "successfully posted your crosschain offer. ";
            var link = document.createElement("a");
            link.href = "contracts.html";
            link.innerHTML = "Your trade can be viewed on this page."
            link.target = "_blank";
            display.appendChild(link);
        }, IP, 8090);//8090 is the p2p_derivatives server
    };

    //Release the veo
    //=========

    //list of matched contracts for your account, each with a release the veo button.
    //to make this: get a list of subcurrencies for your account from the explorer.
    //filter for type 1s with non-zero balances
    //look up the contract info from the explorer to see which ones are for crosschain swaps. keep those.

    //look up contract info from the explorer to find the txid.
    //look up the tx info from the explorer to find who matched.
    //send them all the type 1 shares you have


    //Dispute your contract to get your veo
    //==========

    //if they refuse to release, you need a way to sell you winning shares for 99% of the value.
    //look up the subcurrencies you own. filter for type 2, non-zero balance, where it is a crosschain swap, and you don't have enough type 1 to combine back to veo.
    //the button should make and publish a swap offer to sell for 99% of the value in veo.


    //Get your VEO
    //===========

    //list of subcurrencies where you own both sides of the contract, and the contract only has 2 types.
    // a button for each to combine back to veo.

    };