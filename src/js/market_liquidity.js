var market_liquidity = (function(){
//-record(market_liquidity_tx, {from, nonce, fee, mid, amount, cid1, type1, cid2, type2}).
    var div = document.getElementById("market_liquidity");
    var display = document.createElement("p");
    div.appendChild(display);
    
    var mid = text_input("market id: ", div);
    div.appendChild(br());
    var amount = text_input("amount: ", div);
    div.appendChild(br());
    var button = button_maker2("buy liquidity", doit);
    div.appendChild(button);
    function doit(){
        var Fee = 152050;
        merkle.request_proof("accounts", keys.pub(), function(Acc){
            if(Acc == "empty") {
                display.innerHTML = "load an account first";
                return(0);
            };
            merkle.request_proof("markets", mid.value, function(market){
                //-record(market, {id, cid1, type1, amount1, cid2, type2, amount2, shares}).
                var CID1 = market[2];
                var Type1 = market[3];
                var CID2 = market[5];
                var Type2 = market[6];
                var Nonce = Acc[2] + 1;
                var tx = ["market_liquidity_tx", keys.pub(),
                          Nonce, Fee,
                          mid.value, parseInt(amount.value),
                          CID1, Type1, CID2, Type2];
                var txs = [tx];
                //multi_tx.make(txs, function(tx){
                console.log(JSON.stringify(tx));
                var stx = keys.sign(tx);
                post_txs([stx], function(msg){
                    display.innerHTML = msg;
                    keys.update_balance();
                });
                //});
                /*
                console.log(JSON.stringify(tx));
                var stx = keys.sign(tx);
                post_txs([stx], function(msg){
                    display.innerHTML = msg
                });
                */
            });
        });
    };
    return({
        mid: function(x){mid.value = x},
        amount: function(x){amount.value = x}
    });
})();
