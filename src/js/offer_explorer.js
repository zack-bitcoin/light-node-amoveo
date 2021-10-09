(async function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        //server_ip.value = "159.89.87.58";
        server_ip.value = default_ip();
    };
    const urlParams = new URLSearchParams(window.location.search);
    var tid = urlParams.get('tid');
    tid = tid.replace(/\ /g, "+");

    div.appendChild(br());

    var tid_text = document.createElement("div");
    tid_text.innerHTML = "tid: "
        .concat(tid);
    div.appendChild(tid_text);
    var display = document.createElement("div");
    div.appendChild(display);
    
    //rpc.post(["read", 2, tid], function(signed_offer){
    var signed_offer = await rpc.apost(["read", 2, tid], get_ip(), 8090);
    console.log(JSON.stringify(signed_offer));
    //{"acc1":"BOxDReccZ7BlEVxnDbkivAJeXUKvgoEzOdX1AH/hLiPA9evnK5K3eU+aFn/nnGENX+vHRXZB0YhcviD62+BR5xo=","start_limit":151136,"end_limit":161137,"cid1":"OWByrUqzrM/3Zz6DkbqC4oM2/wsPgonBpESXvs4vzbc=","type1":1,"amount1":1100000000,"cid2":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","type2":0,"amount2":3200000,"salt":"KOHU7xn43FjjE7JlOIL8jGNRofZ70Bq0HIGgKKlUscw=","nonce":1,"parts":1000000,"type":2}
    var contract1, contract2, available_to_match;
    var Y = swaps.unpack(signed_offer);
    var now = headers_object.top()[1];
    var original_limit_order_size = Y.parts;
    console.log(JSON.stringify(Y));
    //rpc.post(["trades", tid], function(trade){
    var trade = await rpc.apost(["trades", tid]);
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
        //update_display(Y, now, contract1, contract2, available_to_match, original_limit_order_size);
        //return(view2([], X, Y, original_limit_order_size, available_to_match));
    }else{
        contract2 = ("contract ")
            .concat(Y.cid2)
            .concat(" type ")
            .concat(Y.type2);
    }
    var A1 = Math.round(Y.amount1 * available_to_match / original_limit_order_size);
    var A2 = Math.round(Y.amount2 * available_to_match / original_limit_order_size);
    //amount_to_match_input.value = A1.toString();
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
        .concat((A1/100000000).toFixed(8)) 
        .concat(" of ")
        .concat(contract1)
                .concat("</p><p>you lose up to: ")
        .concat((A2/100000000).toFixed(8))
        .concat(" of ")
        .concat(contract2)
        .concat("</p>")
        .concat(warning)
        .concat("");
    if(!(contract1 === "veo")){
        var link = document.createElement("a");
        link.href = "contract_explorer.html?cid="
            .concat(Y.cid1);
        link.innerHTML = "look up contract "
            .concat(Y.cid1);
        link.target = "_blank";
        display.appendChild(link);
        display.appendChild(br());
        display.appendChild(br());
    }
    if(!(contract2 === "veo")){
        var link = document.createElement("a");
        link.href = "contract_explorer.html?cid="
            .concat(Y.cid2);
        link.innerHTML = "look up contract "
            .concat(Y.cid2);
        link.target = "_blank";
                display.appendChild(link);
        display.appendChild(br());
        display.appendChild(br());
    }
    var link = document.createElement("a");
    link.href = "wallet.html";
    link.innerHTML = "tool for trading contracts";
    link.target = "_blank";
    display.appendChild(link);
    display.appendChild(br());
    display.appendChild(br());
    
    
    //});
    //}, get_ip(), 8090);
    
    
})();
