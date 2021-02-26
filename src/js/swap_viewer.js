var swap_viewer = (function(){

    var div = document.getElementById("swap_viewer");
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

    function view(){
        var X = JSON.parse(offer.value);
        var Y = swaps.unpack(X);
        var now = headers_object.top()[1];
        
        var contract1, contract2;
        console.log(offer.value);
        console.log(Y);
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
        rpc.post(["trades", TID], function(trade){
            console.log(trade);
            if(trade === 0){
                available_to_match = original_limit_order_size;
            } else {
                available_to_match = original_limit_order_size - trade[2];
            };
            

        
            if(Y.cid1 == btoa(array_to_string(integer_to_array(0, 32)))){
                contract1 = "veo";
            }else{
                contract1 = Y.cid1
                    .concat(" type ")
                    .concat(Y.type1);
            }

            if(Y.cid2 == btoa(array_to_string(integer_to_array(0, 32)))){
                contract2 = "veo";
                update_display(Y, now, contract1, contract2, available_to_match, original_limit_order_size);
                return(view2([], X, Y, original_limit_order_size, available_to_match));
            }else{
            contract2 = ("contract ")
                .concat(Y.cid2)
                .concat(" type ")
                .concat(Y.type2);
        }
            update_display(Y, now, contract1, contract2, available_to_match, original_limit_order_size);
            console.log("amount to make contracts");
            maybe_make_contracts(Y.cid2, [], function(txs){
                console.log("made contracts");

                view2(txs, X, Y, original_limit_order_size, available_to_match);
            });
        });
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
                    } else {
                        display.innerHTML =
                            "<p>You need to teach the server about this contract before you can bet on it. Use the teach scalar contract tool. </p>";
                        return(0);
                    };
                }, explore_swap_offer.ip_get, explore_swap_offer.port_get);
            } else {
                return(callback(Txs));
            };
        });
    };
    function view2(txs, X, Y, original_limit_order_size, available_to_match) {
        //txs is the new_contracts parts.
        //swap_txs is the contract_use_txs
        console.log("in view 2");
        accept_button.onclick = function(){
            var amount_to_match = parseInt(amount_to_match_input.value, 10);
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
            swaps.make_tx(signed_offer, matched_parts, function(swap_txs){
                txs = txs.concat(swap_txs);
                multi_tx.make(txs, function(tx) {
                    console.log(JSON.stringify(tx));
                    var stx = keys.sign(tx);
	            rpc.post(["txs", [-6, stx]],
                             function(x) {
                                 if(x == "ZXJyb3I="){
                                     display.innerHTML = "server rejected the tx";
                                 }else{
                                     display.innerHTML = "accepted trade offer and published tx. the tx id is ".concat(x);
                                 }
                             });
                });
            });
        };
    };
    function update_display(Y, now, contract1, contract2, available_to_match, original_limit_order_size){
        console.log(JSON.stringify([available_to_match, original_limit_order_size]));
        var A1 = Math.round(Y.amount1 * available_to_match / original_limit_order_size);
        var A2 = Math.round(Y.amount2 * available_to_match / original_limit_order_size);
        amount_to_match_input.value = A1.toString();
        var warning = "";
        if(original_limit_order_size === 1){
            warning = "<p>You must either match all of this limit order, or none of it. It cannot be partially matched.</p>";
        } else if (original_limit_order_size < 100000){
            warning = "<p>Warning: this limit order can only be matched in unusually large chunks. This may be a trick to get you to trade at a bad price.</p>";
        }
        display.innerHTML =
            "<p>expires "
            .concat(Y.end_limit - now)
            .concat("</p><p>you gain up to: ")
            .concat(A1)
            .concat(" of ")
            .concat(contract1)
            .concat("</p><p>you lose up to: ")
            .concat(A2)
            .concat(" of ")
            .concat(contract2)
            .concat("</p>")
            .concat(warning)
            .concat("");
    };
    
    return({offer: function(x) {offer.value = x},
            view: view})
})();
