var simplified_scalar_oracle_creation = (function(){
    var div = document.getElementById("simplified_scalar_oracle_creation");
    var display = document.createElement("p");
    div.appendChild(display);
    var cid_text = text_input("contract id: ", div);
    div.appendChild(br());

    var next_button = button_maker2("next", next);
    div.appendChild(next_button);

    var more_options = document.createElement("div");
    div.appendChild(more_options);

    function next(){
        more_options.innerHTML = "";
        var Start = headers_object.top()[1] - 2;
        var cid = cid_text.value;
        rpc.post(["read", 3, cid], function(contract){
            console.log(cid);
            console.log(contract);
            var oracle_text = atob(contract[1]);
            var max_price = contract[3];
            var source = contract[5];
            var source_type = contract[6];
            price_estimate_read(
                cid, source, source_type,
                function(price, liquidity){
                    var price_guess = Math.round(price * max_price);
                    var price_text = text_input("final price (for binary, 1=true, 0=false): ", more_options);
                    price_text.value = price_guess;
                    more_options.appendChild(price_text);
                    var info = document.createElement("div");
                    info.innerHTML = "oracle with text: "
                        .concat(oracle_text)
                        .concat("<br> with max price: ")
                        .concat(max_price);
                    more_options.appendChild(info);
                    var make_oracle_button = button_maker2("make_oracle", function(){
                        var price = parseInt(price_text.value, 10);
                        console.log(max_price);
                        console.log(price);
                        var FullText = scalar_oracle_creation.fulltext(
                            price, max_price,
                            oracle_text);
                        var oid = id_maker(Start, 0,0, FullText);
                        var fee = 152050;
                        var tx1 = ["oracle_new", 0,0,0,
                                   btoa(FullText), Start,
                                   oid, 0, 0, 0];
                        var bet_amount = 2220000;
                        var tx2 = ["oracle_bet", 0, 0, 0,
                                   oid, 1, bet_amount];
                        //return(0);
                        multi_tx.make([tx1, tx2], function(tx){
                            console.log(tx);
                            var stx = keys.sign(tx);
                            //return(0);
                            post_txs([stx], function(msg){
                                display.innerHTML = msg
                                    .concat("<br>")
                                    .concat("with oracle id ")
                                    .concat(oid);
                            });
                        });

                    });
                    more_options.appendChild(make_oracle_button);
                });
            //}, 0);
        }, get_ip(), 8090); 
    };


})();
