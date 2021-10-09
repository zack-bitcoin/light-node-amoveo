var swap_offer = (function(){
    var div = document.getElementById("swap_offer");
    var display = document.createElement("p");
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    div.appendChild(display);
    var fee = 152050;

    var timelimit = text_input("how long is this swap offer valid for: ", div);
    div.appendChild(br());
    var amount1 = text_input("how much subcurrency you pay: ", div);
    div.appendChild(br());
    var cid1 = text_input("subcurrency contract (leave blank for veo): ", div);
    div.appendChild(br());
    var type1 = text_input("subcurrency contract type (leave blank for veo): ", div);
    div.appendChild(br());
    var amount2 = text_input("how much subcurrency you receive: ", div);
    div.appendChild(br());
    var cid2 = text_input("subcurrency contract (leave blank for veo): ", div);
    div.appendChild(br());
    var type2 = text_input("subcurrency contract type (leave blank for veo): ", div);
    div.appendChild(br());

    var partial_match = checkbox_input("allow partially matching this limit order", div);
    partial_match.checked = true;
    div.appendChild(br());
    
    /*
    var partial_match = document.createElement("input");
    partial_match.type = "checkbox";
    partial_match.checked = true;
    var partial_match_label = document.createElement("label");
    partial_match_label.innerHTML = "allow partially matching this limit order";
    div.appendChild(partial_match_label);
    div.appendChild(partial_match);
    div.appendChild(br());
    */

    var create_button = button_maker2("make swap offer", doit);
    div.appendChild(create_button);
    div.appendChild(br());

    async function doit(){
        //rpc.post(["account", keys.pub()], function(my_acc){
        var my_acc = await rpc.apost(["account", keys.pub()])
        if(my_acc === 0){
            display.innerHTML = "error: no key loaded. ";
            return(0);
        };
        var offer = {};
        offer.nonce = my_acc[2] + 1;
        var now = headers_object.top()[1];
        offer.start_limit = now - 1;
        var TimeLimit = parseInt(timelimit.value);
        offer.end_limit = now + TimeLimit;
        offer.amount1 = parseInt(amount1.value);
        offer.amount2 = parseInt(amount2.value);
        offer.cid1 = cid1.value;
        offer.cid2 = cid2.value;
        if("" === offer.cid1){
            offer.cid1 = ZERO;
        }
        if("" === offer.cid2){
            offer.cid2 = ZERO;
        }
        offer.type1 = (parseInt(type1.value) || 0);
        offer.type2 = (parseInt(type2.value) || 0);
        
        offer.fee1 = fee;
        offer.fee2 = fee;
        offer.acc1 = keys.pub();
        offer.partial_match = partial_match.checked;
        var signed_offer;
        
        if(offer.type1 == 0){
            var bal = my_acc[1];
            if(my_acc == "empty"){
                display.innerHTML = "not enough veo to make this offer. (possibly no key loaded?) ";
                return(0);
            };
            if(offer.amount1 > bal){
                display.innerHTML = "not enough veo to make this offer";
                return(0);
            } else {
                console.log(JSON.stringify(offer));
                signed_offer = swaps.pack(offer);
                display.innerHTML = JSON.stringify(signed_offer);
                publish_swap_offer.offer(JSON.stringify(signed_offer));
            }
        } else {
            var key = btoa(array_to_string(sub_accounts.key(keys.pub(), offer.cid1, offer.type1)));
            //return(merkle.request_proof("sub_accounts", key, function(sub_acc){
            var sub_acc = await merkle.arequest_proof("sub_accounts", key);
            if(sub_acc == "empty"){
                display.innerHTML = "not enough subcurrency to  make this offer (possibly no key loaded?)";
                return(0);
            };
            bal = sub_acc[1];
            if(offer.amount1 > bal){
                display.innerHTML = "not enough subcurrency to  make this offer";
                return(0);
            } else {
                
                signed_offer = swaps.pack(offer);
                display.innerHTML = JSON.stringify(signed_offer);
                publish_swap_offer.offer(JSON.stringify(signed_offer));
            };
            //}));
        };
            //console.log("about to publish");
            //publish_swap_offer.offer(JSON.stringify(signed_offer));

//            var signed_offer = swaps.pack(offer);
 //           display.innerHTML = JSON.stringify(signed_offer);
    //});
    };
    return({
        timelimit: function(x){timelimit.value = x},
        amount1: function(x){amount1.value = x},
        amount2: function(x){amount2.value = x},
        cid1: function(x){cid1.value = x},
        cid2: function(x){cid2.value = x},
        type1: function(x){type1.value = x},
        type2: function(x){type2.value = x}
    });
})();
