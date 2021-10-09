var market_swap = (function(){
    var div = document.getElementById("market_swap");
    var display = document.createElement("p");
    div.appendChild(display);

    var mid = text_input("market id: ", div);
    div.appendChild(br());
    var give = text_input("amount to spend: ", div);
    div.appendChild(br());
    var take = text_input("recieve at least this much: ", div);
    div.appendChild(br());
    var direction = text_input("direction of swap: ", div);
    div.appendChild(br());
    var button = button_maker2("swap", doit);
    div.appendChild(button);

    function doit(){
        var Fee = 152050;
        merkle.request_proof("accounts", keys.pub(), function(Acc){
            merkle.request_proof("markets", mid.value, async function(market){
                //-record(market, {id, cid1, type1, amount1, cid2, type2, amount2, shares}).
                var CID1 = market[2];
                var Type1 = market[3];
                var CID2 = market[5];
                var Type2 = market[6];
                var Nonce = Acc[2] + 1;
                //-record(market_swap_tx, {from, nonce, fee, mid, give, take, direction, cid1, type1, cid2, type2}).
                var tx = ["market_swap_tx", keys.pub(),
                          Nonce, Fee,
                          mid.value, parseInt(give.value),
                          parseInt(take.value),
                          parseInt(direction.value),
                          CID1, Type1,
                          CID2, Type2];
                console.log(tx);
                var stx = keys.sign(tx);
                //post_txs([stx], function(msg){
                var msg = await apost_txs([stx]);
                display.innerHTML = msg
                //});
            });
        });
    };
    return({
        mid: function(x){mid.value = x},
        give: function(x){give.value = x},
        take: function(x){take.value = x},
        direction: function(x){direction.value = x},
        doit: doit
    });
})();
