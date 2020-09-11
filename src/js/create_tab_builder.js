function create_tab_builder(div, selector){
    //create the contract, buy subcurrency, create the market, teach oracle text TODO
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var display = document.createElement("div");
    var title = document.createElement("h3");
    title.innerHTML = "Create a new smart contract and market";
    div.appendChild(title);
    div.appendChild(br());
    div.appendChild(display);
    div.appendChild(br());
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "source currency: ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());
    var oracle_text = text_input("the question we ask the oracle", div);
    div.appendChild(br());
    var max_price_text = text_input("maximum value we can measure with this oracle", div);
    div.appendChild(br());
    var amount1_text = text_input("how many of type 1 coins to put into the initial market", div);
    div.appendChild(br());
    var amount2_text = text_input("how many of type 2 coins to put into the initial market", div);
    div.appendChild(br());



    var button = button_maker2("make contract", make_contract);
    div.appendChild(button);
    div.appendChild(br());


    function make_contract(){
        var Text = oracle_text.value;
        var MP = parseInt(max_price_text.value);
        var amount1 = Math.round(parseFloat(amount1_text.value) * token_units());
        var amount2 = Math.round(parseFloat(amount2_text.value) * token_units());
        var Amount = Math.max(amount1, amount2);
        if(MP<1){
            display.innerHTML = "max price must be an integer";
            return(0);
        }
        var Source, SourceType;
        if(selector.value == "veo"){
            Source = ZERO;
            SourceType = 0;
        } else {
            var V = JSON.parse(selector.value);
            Source = V[0];
            SourceType = V[1];
        }
           
        console.log(JSON.stringify(selector.value));
        console.log(JSON.stringify(Text));
        console.log(JSON.stringify(MP));

        var new_contract_tx =
            new_scalar_contract.make_tx(
                Text, MP, Source, SourceType);
        var CH = new_contract_tx[2];
        var cid = binary_derivative.id_maker(CH, 2);

        var new_market_tx = ["market_new_tx", 0,0,0,
                             cid, cid, 1, 2,
                             amount1, amount2];
        var set_buy_tx =
         ["contract_use_tx", 0,0,0,
          cid, Amount, 2, Source, SourceType];

        var txs = [new_contract_tx,
                   set_buy_tx,
                   new_market_tx];
        multi_tx.make(txs, function(tx){
            var stx = keys.sign(tx);
                post_txs([stx], function(msg){
                    display.innerHTML = msg;
                    setTimeout(function(){
                        var msg =
                            ["add", 3, btoa(Text),
                             0, MP, Source,
                             SourceType];
                        console.log(msg);
                        rpc.post(msg, function(x){
                            console.log(x);
                            console.log("taught a scalar contract.");
                            return(0);
                        }, get_ip(), 8090);
                    }, 0);
                    keys.update_balance();
                });
        });


    };

};
