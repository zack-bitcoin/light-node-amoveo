var swap_offer = (function(){
    var div = document.getElementById("swap_offer");
    var display = document.createElement("p");
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
    var create_button = button_maker2("make swap offer", doit);
    div.appendChild(create_button);
    div.appendChild(br());

    function doit(){
        rpc.post(["account", keys.pub()], function(my_acc){
            var offer = {};
            offer.nonce = my_acc[1] + 1;
            var now = headers_object.top()[1];
            offer.start_limit = now - 1;
            var TimeLimit = parseInt(timelimit.value);
            offer.end_limit = now + TimeLimit;
            offer.amount1 = parseInt(amount1.value);
            offer.amount2 = parseInt(amount2.value);
            offer.cid1 = cid1.value;
            offer.cid2 = cid2.value;
            offer.type1 = parseInt(type1.value);
            offer.type2 = parseInt(type2.value);
            offer.fee1 = fee;
            offer.fee2 = fee;
            offer.acc1 = keys.pub();
            console.log(JSON.stringify(offer));
            var signed_offer = swaps.pack(offer);
            display.innerHTML = JSON.stringify(signed_offer);
        });
    };
    return({
        timelimit: function(x){timelimit.value = x},
        amount1: function(x){amount1.value = x},
        amount2: function(x){amount2.value = x},
        cid1: function(x){cid1.value = x},
        cid2: function(x){cid2.value = x},
        type1: function(x){type1.value = x},
        type2: function(x){type1.value = x}
    });
})();
