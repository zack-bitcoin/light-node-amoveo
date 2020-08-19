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
    function fulltext(fpt, mpt, ot){
        var final_price_b = parseInt(fpt);
        var MaxVal = 4294967295;
        var max_price = parseInt(mpt);
        var final_price = Math.floor(MaxVal * final_price_b / max_price);
        var FullText =
            scalar_derivative.oracle_text(mpt, ot)
            .concat(final_price);
        return(FullText);
    };
    function make_oracle(){
        var Start = parseInt(oracle_start_height.value);
        var FullText = fulltext(final_price_text.value,
                                max_price_text.value,
                                oracle_text.value)
        var oid = id_maker(Start, 0,0, FullText);
        console.log(Start);
        console.log(FullText);
        //MaxPrice = 5000; MaxVal = 4294967295; B = btc price in USD - 10000 from $0 to $MaxPrice; max(0, min(MaxVal, (B * MaxVal / MaxPrice)) is 3000
        //MaxPrice = 5000; MaxVal = 4294967295; B = btc price in USD - 10000 from $0 to $MaxPrice; max(0, min(MaxVal, (B * MaxVal / MaxPrice)) is 2576980377

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
        make_oracle: make_oracle,
        fulltext: fulltext
    });

})();
