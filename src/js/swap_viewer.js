var swap_viewer = (function(){

    var div = document.getElementById("swap_viewer");
    var display = document.createElement("p");
    div.appendChild(display);
    
    var offer = text_input("signed offer: ", div);
    div.appendChild(br());

    var view_button = button_maker2("view swap offer", view);
    div.appendChild(view_button);
    var accept_button = button_maker2("accept swap offer", function(){
        display.innerHTML = "load an offer before you can accept it.";
    });
    div.appendChild(accept_button);
    div.appendChild(br());

    function view(){
        console.log("view");
        var X = JSON.parse(offer.value);
        var Y = swaps.unpack(X);
        var now = headers_object.top()[1];

        var contract1, contract2;
        
        if(Y.cid1 == btoa(array_to_string(integer_to_array(0, 32)))){
            contract1 = "veo";
        }else{
            contract1 = Y.cid1
                .concat(" type ")
                .concat(Y.type1);
        }

        if(Y.cid2 == btoa(array_to_string(integer_to_array(0, 32)))){
            contract2 = "veo";
            update_display(Y, now, contract1, contract2);
            return(view2([], X));
        }else{
            contract2 = ("contract ")
                .concat(Y.cid2)
                .concat(" type ")
                .concat(Y.type2);
        }
        update_display(Y, now, contract1, contract2);
        maybe_make_contracts(Y.cid2, [], function(txs){
            view2(txs, X);
        });
    };
    function maybe_make_contracts(cid, Txs, callback) {
        console.log("maybe make contracts");
        console.log(cid);
        if(cid == "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="){
            return(callback(Txs));
        };
        merkle.request_proof("contracts", cid, function(Contract){
            if(Contract == "empty"){
                rpc.post(["read", 3, cid], function(z){
                    //if(z.length == 5){
                    if(z[0] == "scalar"){
                        //{Text, Height, MaxPrice, Now}
                        var tx = new_scalar_contract.make_tx(parseInt(z[2]), atob(z[1]), parseInt(z[3]), z[4], parseInt(z[5]));
                        //var cid2 = binary_derivative.id_maker(tx[2], tx[4], tx[5], tx[6]);
                        return(maybe_make_contracts(tx[5], [tx].concat(Txs), callback));
                    } else if (z[0] == "binary") {
                        var tx = new_contract.make_tx(parseInt(z[2]), atob(z[1]), z[4], parseInt(z[5]));
                        //var cid2 = binary_derivative.id_maker(tx[2], tx[4], tx[5], tx[6]);
                        return(maybe_make_contracts(tx[5], [tx].concat(Txs), callback));
                        //return([tx].concat(Txs));
                    } else {
                        console.log("error, unsupported contract format.");
                        return(0);
                    };
                }, explore_swap_offer.ip_get, explore_swap_offer.port_get);
            } else {
                return(Txs);
            };
        });
    };
    function view2(txs, X) {
        //txs is the new_contracts parts.
        //swap_txs is the contract_use_txs
        //X is the swap tx.
        accept_button.onclick = function(){
            var signed_offer = X;
            swaps.make_tx(signed_offer, function(swap_txs){
                txs = txs.concat(swap_txs);
                tx = multi_tx.make(txs, function(tx) {
                    console.log(JSON.stringify(tx));
                    var stx = keys.sign(tx);
	            rpc.post(["txs", [-6, stx]],
                             function(x) {
                                 if(x == "ZXJyb3I="){
                                     display.innerHTML = "server rejected the tx";
                                 }else{
                                     console.log(x);
                                     display.innerHTML = "accepted trade offer and published tx. the tx id is ".concat(x);
                                 }
                             });
                });
            });
        };
    };
    function update_display(Y, now, contract1, contract2){
        display.innerHTML =
            "<p>expires "
            .concat(Y.end_limit - now)
            .concat("</p><p>you gain: ")
            .concat(Y.amount1)
            .concat(" of ")
            .concat(contract1)
            .concat("</p><p>you lose: ")
            .concat(Y.amount2)
            .concat(" of ")
            .concat(contract2);
    };
    
    return({offer: function(x) {offer.value = x},
            view: view})
})();
