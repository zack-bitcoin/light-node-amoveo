function create_futarchy_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var display = document.createElement("div");
    var title = document.createElement("h3");
    title.innerHTML = "Create a new futarchy market ";
    div.appendChild(title);
    div.appendChild(br());
    var details = document.createElement("p");
    details.innerHTML = "Futarchy markets are to help decentralized communities make a decision. A futarchy market is made up of 3 contracts. It has a binary contract that is usually collateralized in VEO. This binary contract is used to bet on which decision we will make. The binary contract creates 2 new subcurrencies, which are used as collateral for 2 scalar contracts. The scalar contracts are used to bet on how effective each decision will be for optimizing our goal. For example: the binary contract could be for whether we increase the block reward in Amoveo. The scalar contracts could be to predict the future price of Veo tokens. This would allow the Amoveo communty to estimate the impact the block reward has on the price of VEO.";
    div.appendChild(details);
    div.appendChild(br());
    div.appendChild(display);
    div.appendChild(br());
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "source currency (i.e. the collateral backing the contract): ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());

    var oracle_text = text_input("A statement that will be either true or false (i.e. Amoveo's block reward is above 0.2 VEO on 1st of January 2020)", div);
    div.appendChild(br());
    var probability_text = text_input("initial probability of TRUE outcome. should be between 0 and 1.", div);
    div.appendChild(br());
    var amount_text = text_input("amount of source currency to put into the binary market as liquidity", div);
    div.appendChild(br());
    var scalar_amounts_text = text_input("amount of source currency to put into the scalar markets as liquidity", div);
    div.appendChild(br());

    var scalar_oracle_text = text_input("A value that will be publicly known in the future (i.e. the price of veo in USD)", div);
    div.appendChild(br());
    var true_guess_text = text_input("initial guess of what the outcome will be if we make the TRUE decision.", div);
    div.appendChild(br());
    var false_guess_text = text_input("initial guess of what the outcome will be if we make the FALSE decision.", div);
    div.appendChild(br());
    var min_text = text_input("lower limit of the range of values that this contract can measure.", div);
    div.appendChild(br());
    var max_text = text_input("upper limit of the range of values that this contract can measure.", div);
    div.appendChild(br());

    var button = button_maker2("make contract", make_contract);
    div.appendChild(button);

    function make_contract(){
        var MaxVal = 4294967295;
        var min = parseInt(min_text.value, 10);
        var MP = parseInt(max_text.value, 10) -
            min;
        var binary_text = oracle_text.value;
        var scalar_text = "("
            .concat(scalar_oracle_text.value)
            .concat(" minus ")
            .concat(min)
            .concat(") times ")
            .concat(Math.floor(MaxVal / MP));
        console.log(scalar_text);
        var true_guess =
            parseInt(true_guess_text.value, 10) - min;
        var false_guess =
            parseInt(false_guess_text.value, 10) - min;
        var true_price = (true_guess) / MP;
        var false_price = (false_guess) / MP;
        console.log(amount_text.value);
        var amount = Math.round(parseFloat(amount_text.value)*token_units());
        console.log(amount);
        var scalar_amount = Math.round(parseFloat(amount_text.value)*token_units());
        if(true_price<=0){
            display.innerHTML = "initial guess of true price must be greater than the minimum value that can be measured";
            return(0);
        };
        if(true_price>=1){
            display.innerHTML = "initial guess of true price must be less than the maximum value that can be measured";
            return(0);
        };
        if(false_price<=0){
            display.innerHTML = "initial guess of false price must be greater than the minimum value that can be measured";
            return(0);
        };
        if(false_price>=1){
            display.innerHTML = "initial guess of false price must be less than the maximum value that can be measured";
            return(0);
        };
        var binary_price = parseFloat(probability_text.value);
        if(binary_price<0){
            display.innerHTML = "Estimate of the probability that we make the TRUE decision must be greater than 0."
            return(0);
        };
        if(binary_price>1){
            display.innerHTML = "Estimate of the probability that we make the TRUE decision must be less than 1."
            return(0);
        };
        var bin_contract = scalar_derivative.maker(binary_text, 1);
        var bin_ch = scalar_derivative.hash(bin_contract);
        var Source, SourceType;
        if(selector.value == "veo"){
            Source = ZERO;
            SourceType = 0;
        } else {
            var V = JSON.parse(selector.value);
            Source = V[0];
            SourceType = V[1];
        };
        var bin_cid = binary_derivative.id_maker(bin_ch, 2, Source, SourceType);
        var bin_txs =
            tabs.tabs.create.tab.make_txs(
                binary_text, 1, binary_price, amount,
                display, selector.value);
        var contract_buy_tx =
            ["contract_use_tx", 0, 0, 0, bin_cid,
             scalar_amount, 2, Source, SourceType];
        console.log([true_price, scalar_amount]);
        console.log([false_price, scalar_amount]);
        var scalar_true_txs =
            tabs.tabs.create.tab.make_txs(
                scalar_text, MaxVal, true_price, scalar_amount,
                display, JSON.stringify([bin_cid, 1]));
        var scalar_false_txs =
            tabs.tabs.create.tab.make_txs(
                scalar_text, MaxVal, false_price, scalar_amount,
                display, JSON.stringify([bin_cid, 2]));
        var txs = bin_txs
            .concat([contract_buy_tx])
            .concat(scalar_true_txs)
            .concat(scalar_false_txs);
        console.log(JSON.stringify(txs));
        var details = generate_message(txs);
        //return(0);
        multi_tx.make(txs, function(tx){
            var stx = keys.sign(tx);
            console.log(JSON.stringify(stx));
            post_txs([stx], function(msg){
                display.innerHTML = msg
                    .concat(details);
                if(!(msg == "server rejected the tx")){
                    keys.update_balance();
                };
            });
        });
    };
    function generate_message(txs){
        if(txs.length === 0){
            return("");
        };
        var tx = txs[0];
        var s = "";
        if(tx[0] === "contract_new_tx"){
//-record(contract_new_tx, {from, contract_hash, fee, many_types, source, source_type}).
            var cid = binary_derivative.id_maker(tx[2], tx[4], tx[5], tx[6]);
            s = "<br>creating contract "
                .concat(cid);
        } else if(tx[0] === "market_new_tx"){
            //-record(market_new_tx, {from, nonce = 0, fee, cid1, cid2, type1, type2, amount1, amount2}).
            var mid = new_market.mid(tx[4], tx[5], tx[6], tx[7]);
            var K = Math.round(Math.sqrt(tx[8]*tx[9]));
            if(K > 10000){
                s = "<br>creating market "
                    .concat(mid)
                    .concat(" your balance of liquidity shares: ")
                    .concat((K/100000000).toFixed(8).toString());
            }
        }
        return(s.concat(
            generate_message(
                txs.slice(1))));
    };
    return({
        oracle_text:(function(x){oracle_text.value = x}),
        probability_text:(function(x){probability_text.value = x}),
        amount_text:(function(x){amount_text.value = x}),
        scalar_amounts_text:(function(x){scalar_amounts_text.value = x}),
        scalar_oracle_text:(function(x){scalar_oracle_text.value = x}),
        true_guess_text:(function(x){true_guess_text.value = x}),
        false_guess_text:(function(x){false_guess_text.value = x}),
        min_text:(function(x){min_text.value = x}),
        max_text:(function(x){max_text.value = x})
    });
}
