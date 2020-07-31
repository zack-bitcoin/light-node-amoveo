var swap_viewer = (function(){

    var div = document.getElementById("swap_offer");
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
        var X = JSON.parse(offer.value);
        var Y = swaps.unpack(X);
        console.log(Y);
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
        }else{
            contract2 = ("contract ")
                .concat(Y.cid2)
                .concat(" type ")
                .concat(Y.type2);
        }

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
            .concat(contract2)
            .concat("</p><p>you pay fee: ")
            .concat(Y.fee2);
        accept_button.onclick = function(){
            var signed_offer = X;
            var tx = swaps.make_tx(signed_offer);
            var stx = keys.sign(tx);
            console.log(JSON.stringify(tx));
	    rpc.post(["txs", [-6, stx]],
                     function(x) {
                         if(x == "ZXJyb3I="){
                             display.innerHTML = "server rejected the tx";
                         }else{
                             display.innerHTML = "accepted trade offer and published tx. the tx id is ".concat(x);
                         }
                     });
        };
    };
    
    return({offer: function(x) {offer.value = x}})
})();
