function swap_viewer_creator(div2){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var IP = default_ip();

    var div = document.getElementById("swap_viewer");
    if(!(div)){
        div = div2;
        if(!(div2)){
            return(0);
        };
    };
    var display = document.createElement("p");
    div.appendChild(display);
    
    var offer = text_input("signed offer: ", div);
    div.appendChild(br());

    var view_button = button_maker2("view swap offer", view);
    div.appendChild(view_button);
    div.appendChild(br());

    var amount_to_match_input = text_input("amount to buy: ", div);
    div.appendChild(br());


    var accept_button = button_maker2("accept swap offer", function(){
        display.innerHTML = "load an offer before you can accept it.";
    });
    div.appendChild(accept_button);
    div.appendChild(br());

    async function view(){
        var X = JSON.parse(offer.value);
        var Y = swaps.unpack(X);
        var now = headers_object.top()[1];
        
        var contract1, contract2;
        console.log(offer.value);
        console.log(JSON.stringify(Y));
        var original_limit_order_size = Y.parts;
        var available_to_match;
        //var TID = hash.doit(65 bytes of pubkey, then 32 bytes of salt)
//        var TID = btoa(array_to_string(hash(
//            string_to_array(
//                atob(Y.acc1))
//                .concat(string_to_array(
//                    atob(Y.salt))))));
        var TID = swaps.id_maker(Y.acc1, Y.salt);
        console.log(TID);
        //rpc.post(["trades", TID], function(trade){
        var trade = await rpc.apost(["trades", TID])
        console.log(trade);
        if(trade === 0){
            available_to_match = original_limit_order_size;
        } else {
            available_to_match = original_limit_order_size - trade[2];
        };
        

        
        if(Y.cid1 == btoa(array_to_string(integer_to_array(0, 32)))){
            contract1 = "veo";
        }else{
                //contract1 = Y.cid1
                //    .concat(" type ")
                //    .concat(Y.type1);
            contract1 = await contract_text(
                Y.cid1, Y.type1);
        }
        
        if(Y.cid2 == btoa(array_to_string(integer_to_array(0, 32)))){
            //currency 2 is the kind that you need to send. So this is the only type you could ever need to make the contract for.
            contract2 = "veo";
            update_display(Y, now, contract1, contract2, available_to_match, original_limit_order_size);
            return(view2([], X, Y, original_limit_order_size, available_to_match));
        }else{
            contract2 = await contract_text(
                Y.cid2, Y.type2);
        }
        update_display(Y, now, contract1, contract2, available_to_match, original_limit_order_size);
        console.log("amount to make contracts");
        maybe_make_contracts(Y.cid2, [], function(txs){
            console.log("made contracts");
            
            view2(txs, X, Y, original_limit_order_size, available_to_match);
        });
        //});
    };

    async function contract_text(cid, type) {
        var contract = await rpc.apost(
            ["read", 3, cid], default_ip(), 8090);
        console.log(JSON.stringify(contract));
        if((contract[0] === "scalar") &&
           (contract[6] === 0) &&//priced in veo
           (contract[3] === 1)//binary contract
          ){
            var win_string;
            if(type === 1){
                win_string = "veo if this is true: "
            } else {
                win_string = "veo if this is false: "
            }
            return(win_string
                   .concat(atob(contract[1])));
        } else {
            var s = "contract: "
                .concat(cid)
                .concat(" type: ")
                .concat(type);
            return(s);
        };

    };
    function maybe_make_contracts(cid, Txs, callback) {
        console.log("maybe making contracts");
        if(cid == "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="){
            return(callback(Txs));
        };
        merkle.request_proof("contracts", cid, function(Contract){
            console.log("from merkle request");
            if(Contract == "empty"){
                console.log("contract empty");
                rpc.post(["read", 3, cid], function(z){
                    console.log("from post ");
                    //if(z.length == 5){
                    if(z[0] == "scalar"){
                        console.log("is scalar ");
                        //{Text, Height, MaxPrice, Now}
                        var tx = new_scalar_contract.make_tx(atob(z[1]), parseInt(z[3]), z[5], parseInt(z[6]));
                        //var cid2 = binary_derivative.id_maker(tx[2], tx[4], tx[5], tx[6]);
                        return(maybe_make_contracts(tx[5], [tx].concat(Txs), callback));
                    } else if (z[0] == "binary") {
                        console.log("is binary ");
                        var tx = new_contract.make_tx(parseInt(z[2]), atob(z[1]), z[4], parseInt(z[5]));
                        //var cid2 = binary_derivative.id_maker(tx[2], tx[4], tx[5], tx[6]);
                        return(maybe_make_contracts(tx[5], [tx].concat(Txs), callback));
                        //return([tx].concat(Txs));

                    } else if (z[0] === "contract"){
                        //contract hash is not in the buy_veo_contract.
                        var oracle_start_height = z[5];
                        var blockchain = z[6];
                        var amount = z[7];
                        var ticker = z[8];
                        var date = z[9];
                        var TID = z[10];
                        var address_timeout = z[4];
                        var reusable_settings = buy_veo_contract.reusable_settings(oracle_start_height, blockchain, amount, ticker, date);
                        var settings = buy_veo_contract.settings(reusable_settings, address_timeout, 1, TID);
                        var contract1bytes = buy_veo_contract.contract1bytes(settings);
                        var contract_hash = btoa(array_to_string(hash(contract1bytes)));
                        var tx = buy_veo_contract.new_contract_tx(contract_hash);
                        return(maybe_make_contracts(tx[5], [tx].concat(Txs), callback));
                    } else {
                        display.innerHTML =
                            "<p>You need to teach the server about this contract before you can bet on it. Use the teach scalar contract tool. </p>";
                        return(0);
                    };
                }, explore_swap_offer.ip_get, 8090);
            } else {
                return(callback(Txs));
            };
        });
    };
    function view2(txs, X, Y, original_limit_order_size, available_to_match) {
        //txs is the new_contracts parts.
        //swap_txs is the contract_use_txs
        console.log("in view 2");
        console.log(Y.acc1);
        accept_button.onclick = function(){
            var amount_to_match = Math.round(parseFloat(amount_to_match_input.value, 10) * token_units());
            if(!amount_to_match){
                display.innerHTML =
                    "<p>You need to choose how much you want to buy</p>";
                return(0);
            }
            var A1 = Math.round(Y.amount1 * available_to_match / original_limit_order_size);
            if (amount_to_match > A1){
                display.innerHTML =
                    "<p> that is more than everything that is available to buy. There is only "
                    .concat(A1.toString())
                    .concat(" available, so you cannot buy ")
                    .concat(amount_to_match.toString())
                    .concat("</p>")
                    .concat("");
                return(0);
            };
            var matched_parts = Math.round(available_to_match * amount_to_match / A1);
            var signed_offer = X;
            swaps.make_tx(signed_offer, matched_parts, async function(swap_txs){
                txs = txs.concat(swap_txs);
                var tx = await multi_tx.amake(txs);
                console.log(JSON.stringify(tx));
                var stx = keys.sign(tx);
                var response = await apost_txs([stx]);
                display.innerHTML = response;
                if(!(response === "server rejected the tx")){
                    if(Y.type1 === 0){//only if you are paying veo for a subcurrency that is priced in veo.
                        //todo. publish an offer to sell your winnings for 99% of the max possible value.
                        var offer99 = swaps.accept_99(Y);
                        /*
                        var offer99 = {};
                        offer99.type1 = 3-Y.type2;
                        offer99.type2 = 0;
                        offer99.cid1 = Y.cid2;
                        offer99.cid2 = ZERO;
                        offer99.amount1 = Y.amount2;
                        offer99.amount2 = Math.round(((Y.amount2) * 0.998) - (fee * 5));
                        offer99.partial_match = false;
                        offer99.acc1 = keys.pub();
                        offer99.end_limit = Y.end_limit + 1;
                        */
                        var signed_offer = swaps.pack(offer99);
                        var response = await rpc.apost(
                            ["add", signed_offer, 0],
                            IP, 8090);
                        console.log(JSON.stringify(offer99));
                        console.log(response);
                    };
                };
            });
        };
    };
    function update_display(Y, now, contract1, contract2, available_to_match, original_limit_order_size){
        console.log(JSON.stringify([available_to_match, original_limit_order_size]));
        console.log(JSON.stringify(Y));
        var A1 = Math.round(Y.amount1 * available_to_match / original_limit_order_size) / token_units();
        var A2 = Math.round(Y.amount2 * available_to_match / original_limit_order_size) / token_units();
        amount_to_match_input.value = A1.toString();
        var warning = "";
        if(original_limit_order_size === 1){
            warning = "<p>You must either match all of this limit order, or none of it. It cannot be partially matched.</p>";
        } else if (original_limit_order_size < 100000){
            warning = "<p>Warning: this limit order can only be matched in unusually large chunks. This may be a trick to get you to trade at a bad price.</p>";
        }
        if(Y.acc1 === keys.pub()){
            display.innerHTML =
                "<p>this is an offer that you made. it expires in "
                .concat(Y.end_limit - now)
                .concat(" blocks.</p><p>you lose: ")
                .concat(A1)
                .concat(" of ")
                .concat(contract1)
                .concat("</p><p>you gain: ")
                .concat(A2)
                .concat(" of ")
                .concat(contract2)
                .concat("</p>");
            var cancel_button = button_maker2("cancel offer", function(){ return(cancel_offer(Y.salt))});
            display.appendChild(cancel_button);
        } else {
            display.innerHTML =
                "<p>expires in  "
                .concat(Y.end_limit - now)
                .concat(" blocks.</p><p>you gain: ")
                .concat(A1)
                .concat(" of ")
                .concat(contract1)
                .concat("</p><p>you lose: ")
                .concat(A2)
                .concat(" of ")
                .concat(contract2)
                .concat("</p>")
                .concat(warning)
                .concat("");
        };
    };
    var fee = 200000;
    function cancel_offer(salt){
        var tx = ["trade_cancel_tx", keys.pub(), 2000000, fee, salt];
        var stx = keys.sign(tx);
        post_txs([stx], function(x){
            display.innerHTML = x;
        });
        return(0);
    };
    
    return({offer: function(x) {offer.value = x},
            view: view})
};

var swap_viewer = swap_viewer_creator();
