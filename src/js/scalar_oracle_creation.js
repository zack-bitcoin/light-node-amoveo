var scalar_oracle_creation = (function(){
    var div = document.getElementById("scalar_oracle_creation");
    var display = document.createElement("p");
    div.appendChild(display);
    
    var oracle_start_height = text_input("when it becomes possible to report on the outcome of the oracle question. a block height: ", div);
    div.appendChild(br());
    var oracle_text = text_input("the question we ask the oracle", div);
    div.appendChild(br());
    var max_price_text = text_input("maximum value we can measure with this oracle", div);
    div.appendChild(br());
    var final_price_text = text_input("resulting price measured with this oracle", div);
    div.appendChild(br());
    var button = button_maker2("make oracle", make_oracle);
    div.appendChild(button);

    function make_oracle(){
        var Start = parseInt(oracle_start_height.value);
        var Text = oracle_text.value;
        var MP = max_price_text.value;
        var FullText =
            scalar_derivative.oracle_text(MP, Text)
            .concat(final_price_text.value);
        var oid = id_maker(Start, 0,0, FullText);
        console.log(Start);
        console.log(FullText);
        var fee = 152050;
        var tx1 = ["oracle_new", 0,0,0,
                   btoa(FullText), Start,
                   oid, 0, 0, 0];
        var bet_amount = 2220000;
        var tx2 = ["oracle_bet", 0, 0, 0,
                   oid, 1, bet_amount];
        multi_tx.make([tx1, tx2], function(tx){
            console.log(tx);
            var stx = keys.sign(tx);
            post_txs([stx], function(msg){
                display.innerHTML = msg
                    .concat("<br>")
                    .concat("with oracle id ")
                    .concat(oid);
            });
        });
    };
    return({
        height: function(x){oracle_start_height.value = x},
        text: function(x){oracle_text.value = x},
        max: function(x){max_price_text.value = x},
        price: function(x){final_price_text.value = x},
        make_oracle: make_oracle
    });

})();
