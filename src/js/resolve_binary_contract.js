var resolve_binary_contract = (function(){
    var div = document.getElementById("resolve_binary_contract");
    var display = document.createElement("p");
    div.appendChild(display);
    var oracle_text = text_input("oracle text: ", div);
    div.appendChild(oracle_text);
    div.appendChild(br());
    var oracle_height = text_input("oracle start height: ", div);
    div.appendChild(oracle_height);
    div.appendChild(br());
    var button = button_maker2("resolve", resolve);
    div.appendChild(button);
    div.appendChild(br());

    function resolve(){
        var oid = id_maker(parseInt(oracle_height.value),
                           0,0, oracle_text.value);
        var cid = binary_derivative.id_maker2(oid, 2);
        merkle.request_proof("accounts", keys.pub(), function(my_acc){
            merkle.request_proof("oracles", oid, function(oracle){
                if(oracle[2] == 0){
                    display.innerHTML = "oracle is not yet resolved";
                    console.log(oracle);
                    return(0);
                }
            var nonce = my_acc[2] + 1;
            var fee = 152050;
            var contract = binary_derivative.contract2(oid);
            var tx = ["contract_evidence_tx",
                      keys.pub(),
                      nonce, fee, contract,
                      cid, "",
                      [-6, ["oracles", oid]]];
            var stx = keys.sign(tx);
            post_txs([stx], function(msg){
                //display.innerHTML = msg;

                var tx = ["contract_timeout_tx",
                          keys.pub(),
                          nonce + 1, fee, cid, 0,
                          0, 0]
                var stx = keys.sign(tx);
                post_txs([stx], function(msg2){
                    display.innerHTML = msg.concat("<br>").concat(msg2);
                });
            });
            });
        });
    };
    //make timeout tx
    //make resolve tx
    return({
        oracle_height: function(x){oracle_height.value = x},
        oracle_text: function(x){oracle_text.value = x},
        resolve: resolve
           });
})();
