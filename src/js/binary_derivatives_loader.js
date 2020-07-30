(function(){
    var div = document.getElementById("loader");
    
    var display = document.createElement("p");
    div.appendChild(br());
    div.appendChild(display);
    div.appendChild(br());

    var offer = text_input("put the offer here: ", div);
    div.appendChild(br());
    var button = button_maker2("load offer", load_offer);
    div.appendChild(button);
    var accept_button =
        button_maker2("accept offer",
                      function(){
                          display.innerHTML = "load an offer before you can accept it.";
                      });
    div.appendChild(accept_button);
    div.appendChild(br());
    div.appendChild(br());

    function load_offer(){
        var X = JSON.parse(offer.value);
        var Y = contracts.unpack_binary(X);
        console.log(Y.oracle_text);
        var now = headers_object.top()[1];
        var OID = id_maker(Y.oracle_start_height, 0, 0, Y.oracle_text);
        if(!(Y.source_type == 0)){
            console.log("we only support trades priced in veo for now");
            return(0);
        };
        display.innerHTML =
            "<h3>Bet Offer</h3>\
<p>expires ".concat(Y.end_limit - now)
            .concat("</p><p>oracle text: ")
            .concat(Y.oracle_text)
            .concat("</p><p>oracle reporting starts: ")
            .concat(Y.oracle_start_height)
            .concat("</p><p>oracle id: ")
            .concat(OID)
            .concat("</p><p>amount they pay: ")
            .concat(Y.amount1)
            .concat("</p><p>fee they pay: ")
            .concat(Y.fee1)
            .concat("</p><p>amount you pay: ")
            .concat(Y.amount2)
            .concat("</p><p>fee you pay: ")
            .concat(Y.fee2)
            .concat("</p>")
            .concat(subcurrencies_display_string(Y.subs2, Y.amount1 + Y.amount2))
            .concat("")
        ;
        //display.innerHTML = JSON.stringify(Y);//TODO, display the details of the trade more nicely.
        accept_button.onclick = function(){
            console.log(JSON.stringify(X[0]));
            var signed_offer = X[0];
            var tx = contracts.make_tx(signed_offer);
            var stx = keys.sign(tx);
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
    function subcurrencies_display_string(V, A) {
        var X = "";
        var substring;
        var maximum = 4294967295;
        for(var i = 1; i < V.length; i ++){
            substring = "<p>you get "
                .concat(Math.round(array_to_int(string_to_array(atob(V[i])))
                                   * A / maximum))
                .concat(" of subcurrency type ")
                .concat(i)
                .concat("</p>");
            X = X.concat(substring);
        };
        return(X);
    };
})();
