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
    var normal_button = button_maker2("normal mode", function(){
        current_div.innerHTML = "";
        current_div.appendChild(normal_div);
    });
//    div.appendChild(normal_button);
    var stablecoin_button = button_maker2("stablecoin mode", function(){
        current_div.innerHTML = "";
        current_div.appendChild(stablecoin_div);
    });
    //div.appendChild(stablecoin_button);
    //div.appendChild(br());
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "source currency: ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());

    var normal_div = document.createElement("div");
    var stablecoin_div = document.createElement("div");
    var current_div = document.createElement("div");
    current_div.appendChild(stablecoin_div);

    var oracle_text = text_input("the question we ask the oracle", normal_div);
    normal_div.appendChild(br());
    var max_price_text = text_input("maximum value we can measure with this oracle", normal_div);
    normal_div.appendChild(br());
    var probability_text = text_input("initial value of type 1. should be between 0 and 1.", normal_div);
    normal_div.appendChild(br());

    //var website_text = text_input("website where we look up the value for this oracle", stablecoin_div);
    //stablecoin_div.appendChild(br());

    var website_text = document.createElement("select");
    var option_qtrade = document.createElement("option");
    option_qtrade.innerHTML = "qtrade.io";
    option_qtrade.value = "qtrade.io";
    var option_cmc = document.createElement("option");
    option_cmc.innerHTML = "coinmarketcap.com";
    option_cmc.value = "coinmarketcap.com";
    var option_cp = document.createElement("option");
    option_cp.innerHTML = "coinpaprika.com";
    option_cp.value = "coinpaprika.com";
    website_text.appendChild(option_qtrade);
    website_text.appendChild(option_cmc);
    website_text.appendChild(option_cp);
    website_label = document.createElement("span");
    website_label.innerHTML = "website to get the price info";
    stablecoin_div.appendChild(website_label);
    stablecoin_div.appendChild(website_text);
    stablecoin_div.appendChild(br());

    var time_text = text_input("the date and time when the value is measured, in China Standard Time zone. GMT + 8. example: '12:00 25-12-2020'", stablecoin_div);
    stablecoin_div.appendChild(br());
    var coll_text = text_input("collateralization", stablecoin_div);
    stablecoin_div.appendChild(br());
    var starting_price_text = text_input("starting price on website", stablecoin_div);
    stablecoin_div.appendChild(br());
    var ticker_text = text_input("the name of the thing being measured. for example: 'BTC' ", stablecoin_div);
    stablecoin_div.appendChild(br());

    //var max_price_text = text_input("maximum value we can measure with this oracle", div);
    //div.appendChild(br());
    var amount_text = text_input("amount to invest in liquidity shares", div);
    div.appendChild(br());
    div.appendChild(current_div);
/*
    var amount1_text = text_input("how many of type 1 coins to put into the initial market", div);
    div.appendChild(br());
    var amount2_text = text_input("how many of type 2 coins to put into the initial market", div);
    div.appendChild(br());
*/


    var button = button_maker2("make contract", make_contract);
    normal_div.appendChild(button);
    var stablecoin_button = button_maker2("make contract", make_stablecoin_contract);
    stablecoin_div.appendChild(stablecoin_button);
    div.appendChild(br());


    function make_contract(){
        var Text = oracle_text.value;
        var MP = parseFloat(max_price_text.value);
        var price = parseFloat(probability_text.value);
        if(price<0){
            console.log("price must be greater than 0");
            return(0);
        };
        if(price>1){
            console.log("price must be less than 1");
            return(0);
        };
        return(make_contract2(Text, MP, price));
    }
    function make_stablecoin_contract(){
        var website = website_text.value;
        var time = time_text.value;
        var ticker = ticker_text.value;
        var coll = parseFloat(coll_text.value);
        var starting_price = parseFloat(starting_price_text.value);
        console.log([coll, starting_price]);
        //var MP = coll * starting_price;
        var MaxVal = 4294967295;
        var Scale = Math.round(MaxVal / starting_price * coll);
        //var MP = MaxVal;
        var Text = "W = "
            .concat(website)
            .concat("; T = ")
            .concat(time)
            .concat(" China Standard Time (GMT+8); ticker = ")
            .concat(ticker)
            .concat("; return(the price of ticker at time T according to website W) * ")
            .concat(Scale);
        //var price = 1/(1 + coll);
        var price = 1/(coll);
        return(make_contract2(Text, MaxVal, price));
    }
    function make_contract2(Text, MP, price) {
        //console.log(MP);
        var amount = Math.round(parseFloat(amount_text.value)*token_units());
        var amount1 = amount*price;
        var amount2 = amount*(1-price);
        console.log([MP, price]);
        console.log([amount1, amount2]);

        if(MP<1){
            display.innerHTML = "max price must be an integer greater than 0.";
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
           
        //var price = amount1 / amount2; 
        var source_amount = amount;
        var new_contract_tx =
            new_scalar_contract.make_tx(
                Text, MP, Source, SourceType);
        var CH = new_contract_tx[2];
        var cid = binary_derivative.id_maker(CH, 2);
        var txs = [new_contract_tx];


        
        if (amount1 == amount2) {
            txs = txs.concat([
                ["contract_use_tx", 0,0,0,
                 cid, amount, 2,
                 Source, SourceType],
                ["market_new_tx", 0,0,0,
                 cid, cid, 1, 2,
                 amount-1000, amount-1000],
                ["market_new_tx",0,0,0,
                 ZERO,cid,0,1,
                 1000, 1000],
                ["market_new_tx",0,0,0,
                 ZERO,cid,0,2,
                 1000, 1000]
            ]);
        } else if (amount1 > amount2){
            //T = total veo invested.
            //P = initial probability of type 1.

            //a1 is the more valuable kind.

            //M1 = [V, A1]
            //M2 = [A2, B]

            // A1 + A2 = B
            // V + B = T
            // P = V / A1
            // P/(1-P) = B / A2

            //get rid of the Vs
            // A1 + A2 = B
            // P*A1 + B = T
            // P/(1-P) = B / A2

            //get rid of the A1s
            // P*(B-A2) + B = T
            // P/(1-P) = B / A2
            // -> A2 = B*(1-P)/P

            //get rid of the A2s
            //P*(B-(B*(1-P)/P)) + B = T
            // -> B(P(1-((1-P)/P))) + B = T
            // B(P-(1-P))+B = T
            //B(2P-1)+B = T
            //B(1+(2P-1)) = T
            //B(2P) = T
            //B = T/2/P
            //V = T-B = T(1 - 1/(2*P)) = T(2P - 1)/(2p)
            //V = T - B
            //A1 = V/P
            //A2 = B - A1

            
            //A1 = B(1-P)
            //A2 = B*P
            
            var T = amount;
            var P = price;
            var B = Math.round(amount/2/P);
            var V = Math.round(T - B);
            //var A1 = Math.round(B*(1-P));
            //var A2 = Math.round(B*P);
            //var A1 = Math.round(V*P);
            //var A2 = B-A1;
            var A1 = Math.round(V/P);
            var A2 = Math.round(B - A1);

            txs = txs.concat([
                ["contract_use_tx", 0,0,0,
                 cid, B, 2,
                 Source, SourceType],
                ["market_new_tx",0,0,0,
                 cid,cid,1,2,
                 A2, B-1000],
                ["market_new_tx",0,0,0,
                 ZERO,cid,0,1,
                 V, A1],
                ["market_new_tx",0,0,0,
                 ZERO,cid,0,2,
                 1000, 1000]
            ]);
        } else if (amount2 > amount1){
            var T = amount;
            var P = 1 - price;
            //var B = Math.round(T*(P/(P + ((1+P)*(1-P)))));
            var B = Math.round(amount/2/P);
            //var B = Math.round(amount/2/(1 - ((1-P)/4)));
            var V = Math.round(T - B);
            //var A1 = Math.round(B*(1-P));
            //var A2 = Math.round(B*P);
            //var A1 = Math.round(V*P);
            var A1 = Math.round(V/P);
            var A2 = B-A1;
            txs = txs.concat([
                ["contract_use_tx", 0,0,0,
                 cid, B, 2,
                 Source, SourceType],
                ["market_new_tx",0,0,0,
                 cid,cid,2,1,
                 A2, B-1000],
                ["market_new_tx",0,0,0,
                 ZERO,cid,0,1,
                 1000, 1000],
                ["market_new_tx",0,0,0,
                 ZERO,cid,0,2,
                 V, A1]
            ]);
        };
        console.log(JSON.stringify(txs));
        multi_tx.make(txs, function(tx){
            //return(0);
            var stx = keys.sign(tx);
            //publish_tx_button.onclick = function(){
            post_txs([stx], function(msg){
                display.innerHTML = msg;
                if(!(msg == "server rejected the tx")){
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
                };
            });
        })
    };
    return({
        website:(function(x){website_text.value = x}),
        time:(function(x){time_text.value = x}),
        coll:(function(x){coll_text.value = x}),
        starting_price:(function(x){starting_price_text.value = x}),
        ticker:(function(x){ticker_text.value = x}),
        amount:(function(x){amount_text.value = x})
    });
};
