function swap_tab_builder(swap_tab, selector, hide_non_standard){
    if(!(swap_tab)){
        swap_tab = document.createElement("div");
    };
    if(!(selector)){
        selector = document.createElement("select");
    };
//?cid_to_buy=jz5+NialTR/Ktymo2jb7PBDdVIGcSKVXwVw0bA6dEqY=&type_to_buy=1
    const urlParams = new URLSearchParams(window.location.search);
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var trading_fee = 0.9979995;
    //var loop_limit = 90;
    var loop_limit = 5;
    //spend 20, get 25.4128
    //var trading_fee = 0.98;
    var slippage = 1;
    var display = document.createElement("div");

    var final_price;
    
    var contracts_div = document.createElement("div");

    var cid_to_buy = urlParams.get('cid_to_buy');
    var contract_to_buy = document.createElement("select");
    if(cid_to_buy){
        cid_to_buy = cid_to_buy.replace(/\ /g, "+");
        //look up contract from explorer.
        var type_to_buy =
            parseInt(urlParams.get('type_to_buy'),
                     10);
        //console.log(cid_to_buy);
        memoized_contract_post(cid_to_buy, function(contract){
            //console.log(JSON.stringify(contract));
            display_contracts2(
                contracts_div, [contract], [], function(){
                    //console.log(JSON.stringify([cid_to_buy, type_to_buy]));
                    contract_to_buy.value = JSON.stringify([cid_to_buy, type_to_buy]);
                });
        });
    } else {
        var veo_option = document.createElement("option");
        veo_option.innerHTML = "veo";
        veo_option.value = "veo";
        contract_to_buy.appendChild(veo_option);
        display_contracts(contracts_div);
    };
    
    swap_tab.appendChild(contracts_div);
    
    var swap_title = document.createElement("h3");
    swap_title.innerHTML = "Swap Currencies";
    var contracts_list_link = document.createElement("a");
    contracts_list_link.href = "./contracts_list.html";
    contracts_list_link.innerHTML = "a list of Amoveo contracts";
    contracts_list_link.target = "_blank";
    swap_tab.appendChild(br());
    swap_tab.appendChild(contracts_list_link);
    swap_tab.appendChild(swap_title);
    swap_tab.appendChild(br());
    var details = document.createElement("p");
    details.innerHTML = "This tool takes advantage of all available uniswap-like markets in order to transform your currency into the type you want, in a single block. It uses a gradient descent algorithm to combine the markets as efficiently as possible, it tries to be arbitrage-free.";
    swap_tab.appendChild(details);
    swap_tab.appendChild(br());
    swap_tab.appendChild(display);
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "which currency to sell: ";
    swap_tab.appendChild(selector_label);

    swap_tab.appendChild(selector);
    swap_tab.appendChild(br());

    var amount_input = text_input("amount to sell: ", swap_tab);
    amount_input.value = "0.01";
    var sell_all_button = button_maker2("sell all", async function(){
        var currency = selector.value;
        if(currency == "veo") {
            var acc = await rpc.apost(["account", keys.pub()]);
            amount_input.value = (acc[1] / token_units()).toFixed(8);
        } else {
            currency = JSON.parse(currency);
            var trie_key = sub_accounts.key(keys.pub(), currency[0], currency[1]);
            trie_key = btoa(array_to_string(trie_key));
            memoized_sub_account_post(trie_key, function(acc){
                var balance = 0;
                if(!(acc == "empty")){
                    balance = acc[1];
                };
                var limit = 1;
                if((currency[1] === 1) &&
                  tabs.balances_db[trie_key].limit){
                    limit = tabs.balances_db[trie_key].limit;
                };
                console.log(JSON.stringify(currency));
                console.log(JSON.stringify(tabs.balances_db[trie_key]));
                console.log(JSON.stringify([balance, limit, token_units()]));
                amount_input.value = (balance * limit / token_units()).toFixed(8);
                
            });
        };
    });
    swap_tab.appendChild(sell_all_button);
    swap_tab.appendChild(br());
    var buy_label = document.createElement("span");
    buy_label.innerHTML = "which currency to buy: ";
    swap_tab.appendChild(buy_label);
    //var contract_to_buy = document.createElement("select");
    swap_tab.appendChild(contract_to_buy);
    swap_tab.appendChild(br());

    
    swap_tab.appendChild(br());
    var swap_price_button =
        button_maker2("lookup price", swap_price);
    var publish_tx_button =
        button_maker2("confirm the trade",
                      function(){
                          display.innerHTML = "lookup the price first";
                          return(0);});
    swap_tab.appendChild(swap_price_button);
    swap_tab.appendChild(publish_tx_button);

    async function display_contracts(div) {
        var contracts = await rpc.apost(["contracts"], get_ip(), 8091);//8091 is explorer
        var s = "";
        return(display_contracts2(div, contracts.slice(1), []));
    };
    function display_contracts2(div, contracts, pairs, callback) {
        if(contracts.length < 1) {
            //console.log("display contracts end");
            if(callback){
                return(callback());
            };
            return(0);
        }
        var cid = contract_to_cid(contracts[0]);
        var source = contracts[0][8];
        var source_type = contracts[0][9];
        memoized_oracle_text_post(cid, async function(oracle_text){
            //console.log("read oracle text");
            if(oracle_text[1] && (atob(oracle_text[1]))){
                //console.log(atob(oracle_text[1]));
            };
            [p_est, liquidity] = await price_estimate_read(cid, source, source_type);
            if(!(oracle_text == 0)) {
                var type = oracle_text[0];
                var text = atob(oracle_text[1]);
                var text0 = text;
                var ticker_bool =
                    tabs.is_ticker_format(text);
                var option = document.createElement("option");
                option.innerHTML = "";
                option.value = JSON.stringify([cid, 1]);
                var option2 = document.createElement("option");
                option2.innerHTML = "";
                option2.value = JSON.stringify([cid, 2]);
                var open_interest = (contracts[0][11] / token_units()).toFixed(2).toString();
                var liquidity = (liquidity/100000000).toFixed(2).toString();
                if(liquidity > 0.009){
                    if(ticker_bool){
                        contract_to_buy.appendChild(option);
                        contract_to_buy.appendChild(option2);
                        var button1_text = " contract ";
                        var button2_text = " inverse contract ";
                        stable_text = tabs.decode_ticker(text, p_est, "stablecoin");
                        long_text = tabs.decode_ticker(text, p_est, "long-veo");
                        var ticker = "v".concat(tabs.symbol(text0));
                        var button1_text = ticker;
                        var button2_text =
                            " i".concat(ticker);
                        var s1 = ""
                            .concat("\"")
                            .concat(stable_text)
                            .concat("\"~ ")
                        //.concat("; open interest: ")
                        //.concat(open_interest)
                            .concat("; liquidity: ")
                            .concat(liquidity)
                        //.concat((contracts[0][11] / token_units()).toFixed(2).toString())
                            .concat("");
                        var s2 = ""
                            .concat("\"")
                            .concat(long_text)
                            .concat("\"~ ")
                        //.concat("; open interest: ")
                        //.concat(open_interest)
                            .concat("; liquidity: ")
                            .concat(liquidity)
                        //.concat((contracts[0][11] / token_units()).toFixed(2).toString())
                            .concat("");
                        option.innerHTML = s1;
                        option2.innerHTML = s2;
                    } else {//if (!(hide_non_standard)){
                        contract_to_buy.appendChild(option);
                        contract_to_buy.appendChild(option2);
                        var short_text = text.slice(0, 64);
                        if (text.length > short_text.length){
                            short_text = short_text.concat("...");
                        };
                        option.innerHTML =
                            ""
                        //.concat(button1_text)
                            .concat("TRUE: ")
                            .concat(short_text)
                        //.concat("; open interest: ")
                        //.concat(open_interest)
                            .concat("; price: ")
                            .concat(p_est.toFixed(2))
                            .concat("; liquidity: ")
                            .concat(liquidity)
                            .concat("");
                        option2.innerHTML =
                            ""
                        //.concat(button2_text)
                            .concat("FALSE: ")
                            .concat(short_text)
                        //.concat("; open interest: ")
                        //.concat(open_interest)
                            .concat("; price: ")
                            .concat((1-p_est).toFixed(2))
                            .concat("; liquidity: ")
                            .concat(liquidity)
                            .concat("");
                    };
                };
            }
                setTimeout(function(){
                    display_contracts2(div, contracts.slice(1), pairs, callback);
                }, 200);
        });
    };
    
    function swap_price() {
        var C1 = selector.value;
        var CID1, CID2, Type1, Type2;
        if(C1 == "veo") {
            //buying something with veo
            CID1 = ZERO;
            Type1 = 0;
        } else {
            C1 = JSON.parse(C1);
            CID1 = C1[0];
            Type1 = C1[1];
        };
        if(contract_to_buy.value === "veo"){
            //selling something for veo
            CID2 = ZERO;
            Type2 = 0;
        } else {
            var to_buy = JSON.parse(contract_to_buy.value);
            CID2 = to_buy[0];
            Type2 = to_buy[1];
        };
        if((CID1 == CID2) && (Type1 == Type2)){
            display.innerHTML = "cannot trade something for itself.";
            return(0);
        };
        var A = parseFloat(amount_input.value) * token_units();
        if(Type1 === 1){
            var trie_key = sub_accounts.key(keys.pub(), CID1, Type1);
            trie_key = btoa(array_to_string(trie_key));
            limit = tabs.balances_db[trie_key].limit;
            A = A / limit;
        };
        A = Math.round(A);
        return(txs_maker(A, CID1, Type1, CID2, Type2,
                         function(txs, markets){
                            return(make_tx2(
                                txs, markets, [CID1, Type1],
                                [CID2, Type2]))}));
    };
    function txs_maker(A, CID1, Type1, CID2, Type2, callback){
        var sub_acc = sub_accounts.key(keys.pub(), CID1, Type1);
        sub_acc = btoa(array_to_string(sub_acc));
        memoized_sub_account_post(sub_acc, function(SA){
            var amount;
            if(CID1 == ZERO ){ amount = 99999999999999999999999;}
            else if(SA == "empty"){ amount = 0;}
            else if(SA[0] == "sub_acc"){
                amount = SA[1];
            } else {
                console.log("bad error");
                return(0);
            }
            if(!(CID1 == ZERO)){
                A = Math.min(A, amount);
            };
            memoized_r_paths_post(CID1, CID2, function(response){
                //looking up every market and contract on paths between the 2 contracts.
                var markets = response[1].slice(1);
                var contracts = response[2].slice(1);
                return(swap_price2(markets, contracts,
                                   A,
                                   CID1, Type1,
                                   CID2, Type2,
                                   callback));
            });
        });
    };
    function swap_price2(
        marketids, cids, amount234,
        cid1, type1, cid2, type2,
        callback)
    {
        return(get_contracts(cids, [], function(contracts){
            return(get_markets(marketids, [], function(markets) {
                var Paths = all_paths([[[cid1, type1]]], cid2, type2, contracts, markets, 5);
                var Paths2 = end_goal(cid2, type2, Paths);
                //Paths2 = Paths2.reverse();
                //Paths2 = Paths.slice(1);
                if(Paths2.length == 0){
                    display.innerHTML = "error. there is no way to transform the input currency into the output currency.";
                    return(0);
                };
                if(amount234 > 0){
                    return(swap_price3(
                        Paths2, amount234,
                        markets, callback));
                } else {
                    return(reverse_swap_price3(
                        Paths2, -amount234,
                        markets, [cid2, type2],
                        callback));
                }
            }));
        }));
    };
    function end_goal(cid, type, paths) {
        var paths2 = [];
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            var last = path[path.length - 1];
            if((last[0] == cid) && (last[1] == type)){
                paths2 = paths2.concat([paths[i]]);
            }
        };
        return(paths2);
    };
    function array_of(N, L) {
        if(L == 0) { return([])};
        return([N].concat(array_of(N, L-1)));
    };
    function build_paths_db(Paths, DB) {
        if(Paths.length < 1) {
            return(DB);
        };
        if(Array.isArray(Paths[0])) {
            build_paths_db(Paths[0], DB);
            return(build_paths_db(Paths.slice(1), DB));
        };
        if(Paths[0] == "market") {
            var market = Paths;
            DB[market[1]] = market;
            return(DB);
        };
        if(Paths[0] == "contract") {
            var contract = Paths;
            var cid = contract_to_cid(contract);
            DB[cid] = contract;
            return(DB);
        };
        return build_paths_db(Paths.slice(1), DB);
    };
    function swap_price3(Paths, amount33, markets, callback) {
        //we need to find the optimal way to spend amount on the different paths to get the best price.
        //an initial guess we can keep improving.
        //Paths = Paths.slice(2);
        //console.log(JSON.stringify(Paths[1]));
        //Paths = [Paths[0]].concat(Paths.slice(2));
        //console.log(JSON.stringify(Paths));
        var L = Paths.length;
        var db = build_paths_db(Paths, {});
        //console.log(JSON.stringify(db));
        if(L == 1){
            var guess = [amount33];
            var db20 = make_trades(guess, Paths, db);
            var db2 = db20[0];
            return(make_tx(guess, amount33, Paths, db, db2, markets, callback));
        }
        var a = amount33 / L;

        var guess = array_of(a, L);
        //console.log("swap price 3");
        //console.log(guess);

        return(swap_price_loop(Paths, amount33, guess, db, markets, callback, loop_limit));
    }
    function reverse_swap_price3(Paths, amount, markets, gain_currency, callback){
        //This time "amount" is how much we want to receive, not how much we want to spend.
        swap_price3(Paths, amount*1000, markets, function(txs){
            var gain =
                calculate_gain(gain_currency, txs, markets) -
                calculate_loss(gain_currency, txs, markets);
            return(reverse_swap_binary_search([0,0], [amount*1000, gain], Paths, amount, markets, gain_currency, callback, 12));
        });
    };
    function reverse_swap_binary_search(low, high, Paths, amount, markets, gain_currency, callback, N){
        if(N < 1){
            //console.log(JSON.stringify([
            //    low, high
            //]));
            var average_amount = (low[0] + high[0])/2;
            return(swap_price3(
                Paths, average_amount, markets,
                callback));
        };
        var portion =
            (amount - low[1]) / (high[1] - low[1]);
        var next_guess = ((high[0] - low[0]) * portion) + low[0];
        swap_price3(Paths, next_guess, markets, function(txs){
            var gain =
                calculate_gain(gain_currency, txs, markets) -
                calculate_loss(gain_currency, txs, markets);
            //console.log(amount);
            //console.log(next_guess);
            //console.log(gain);
            if(gain > amount){
                return(reverse_swap_binary_search(low, [next_guess, gain], Paths, amount, markets, gain_currency, callback, N-1));
            } else {
                return(reverse_swap_binary_search([next_guess, gain], high, Paths, amount, markets, gain_currency, callback, N-1));
            };
        });
    };
    function swap_price_loop(Paths, amount, guess, db, markets, callback, N) {
        /*
        var guess = [];
        var Paths = [];
        for(var i = 0; i<guess0.length; i++){
            if(true){//(guess0[i] > 0.1)){
                guess = guess.concat([guess0[i]]);
                Paths = Paths.concat([Paths0[i]]);
            };
        };
        */

        //REVERSE HERE
        Paths = Paths.reverse();
        guess = guess.reverse();

        //with reverse. buying 1 and 10 veo worth
        //2.0998
        //14.487

        //without is worse.
        //2.1035
        //14.473

        //Paths = (Paths.concat([Paths[0]])).slice(1);
        //guess = (guess.concat([guess[0]])).slice(1);

        var db20 = make_trades(guess, Paths, db);
        var db2 = db20[0]
        if(N < 1) {
            return(make_tx(guess, amount, Paths, db, db2, markets, callback));
        };
        //make a database of the markets and contracts that can be updated with trades.

        //update the database based on our current guess of the distribution.
        //calculate the final price on every path to buy a bit more. this is the gradient vector.
        var gradient = get_gradient(Paths, db2, 1);
        var laplacian = get_laplacian(Paths, db2, gradient);

        //console.log(gradient);
        //console.log(laplacian);
        //console.log(guess);
        
        var average = average_fun(gradient, guess);
        final_price = 1/average;
        
        //if(good_enough(gradient, guess, average)){
        //if(false){
        //    console.log("done!");
        //    console.log(guess);
        //    return(make_tx(guess, amount, Paths, db, db2, markets, callback));
        //} else {
        var nextGuess = improve_guess(average, guess, gradient, amount, laplacian);
        return(swap_price_loop(Paths, amount, nextGuess, db, markets, callback, N-1));
        //};
        //for the paths that are more expensive than average, buy less in the next iteration. for the paths that are less expensive, buy more in the next iteration.
    };
    function improve_guess(average, guess, grad, amount, laplacian){
        //console.log("improve guess");
        var r = [];
        for(var i = 0; i<guess.length; i++){
            var n = (guess[i])*(1 + 0.5*((average - grad[i])/average));
            n = Math.max(n, 0);
            r = r.concat([n]);
        };
        //we also need to normalize, to make sure the sum of how much we are buying on each path is still equal to how much we want to spend.
        var t = normalize(r).map(function(x){
            return(x*amount);
        });
        //laplace strategy
        var r2 = [];
        for(var i = 0; i<guess.length; i++){
//X = (S-P)/A
//(updated guess on how much to spend on this path) = ((current price on this path)-(target price))/(inverse-liquidity value calculated for this path)
            var n = (grad[i] - average) / laplacian[i];
            n = guess[i] - n;
            if(amount > 0) {
                n = Math.max(n, 0);
            } else {
                n = Math.min(n, 0);
            };
            r2 = r2.concat([n]);
        };
        var t2 = normalize(r2).map(function(x){
            return(x*amount);
        });

        //to change back from the laplace strategy to the original strategy, change this t2 to a t.
        return(t2);
    };
    
    function average_fun(grad, guess) {
        //weighted average price paid on paths
        var guess_total = guess.reduce(function(a, b) {
            return(a+b);
        });
        var total = 0;
        for(var i = 0; i<grad.length; i++){
            total = total + (grad[i]*guess[i]);
            //total = total + (guess[i]/grad[i]);
        };
        var average = total / guess_total;
        return(average);
    };
    function good_enough(grad, guess, average) {
        for(var i = 0; i<grad.length; i++){
            var p = Math.abs(grad[i] - average) / average;
            //console.log(p);
            if(((guess[i] > 0.5)) && (p > 0.0001)){
                return(false);
            };
        };
        return(true);
    };
    function get_gradient(Paths, db3, Step) {
        //console.log("get gradient");
        //var db4;
        var db4 = JSON.parse(JSON.stringify(db3));
        var r = [];
        for(var i = 0; i<Paths.length; i++){
            db4 = JSON.parse(JSON.stringify(db3));
            var x = process_path(Step, Paths[i], 1, db4);
            if(!x[1]){
                console.log(JSON.stringify(x[0]));
                console.log(JSON.stringify(Paths[i]));
                console.log(JSON.stringify(i));
                console.log("x is null!");
                x[1] = 2;
            };
            if(x[1] == Infinity){
                x[1] = 10;
            };
            //r = r.concat([x[1]]);//bigger is worse
            r = r.concat([x[1]]);//bigger is worse
            //db4 = x[0];
            //r = r.concat([-1/x[1]]);//bigger is better
        };
        return(r);
    };
    function get_laplacian(Paths, db, gradient1){
        var gradient2 = get_gradient(Paths, db, 2);
        var laplacian = [];
        for(var i = 0; i<gradient1.length; i++){
            laplacian[i] =
                (gradient2[i] - gradient1[i])*2;
            laplacian[i] = Math.max(
                0.00000000000000000000000001,
                laplacian[i]);
        };
        //console.log(laplacian);
        return(laplacian);

    };
    function make_trades(guess, paths, db) {
        var db2 = JSON.parse(JSON.stringify(db));
        var grad = [];
        for(var i = 0; i<guess.length; i++){
            var x = process_path(guess[i], paths[i], 1, db2);
            db2 = x[0];
            grad = grad.concat([x[1]]);
        };
        return([db2, grad]);
    };
    function clean_market(m, K) {
        m[4] = Math.max(m[4], 1);
        m[7] = K/m[4];
        m[7] = Math.max(m[7], 1);
        m[4] = K/m[7];
        return(m);
    };
    function process_path(Amount, path, price, db){
        //console.log(JSON.stringify([Amount, price]));
        if(Amount == 0){
            return([db, 10]);
        }
        var StartAmount = Amount;
        var currency = path[0];
        if(path.length < 2){
            return([db, price]);
        };
        var type = path[1][0];
        var price1;
        if(type == "market") {
            var mid = path[1][1];
            var m = db[mid];
            var A1 = m[4];
            var A2 = m[7];
            var K = A1 * A2;
            path = path.slice(2);
            if((m[2] == currency[0])&&
               (m[3] == currency[1])){
                //console.log("here");
                //console.log([Amount, m[4], m[7]]);
                price1 = m[4]/m[7];
                m[4] = m[4] + Amount;
                var old = m[7];
                m[7] = K/m[4];
                //console.log(Amount);
                m = clean_market(m, K);
                Amount = (old - m[7]) * trading_fee;
                //console.log([StartAmount/Amount, price1]);
                db[mid] = m;
            } else if ((m[5] == currency[0]) &&
                       (m[6] == currency[1])){
                price1 = m[7]/m[4];
                m[7] = m[7] + Amount;
                var old = m[4];
                m[4] = K/m[7];
                m = clean_market(m, K);
                Amount = (old - m[4]) * trading_fee;
                db[mid] = m;
                //console.log([StartAmount/Amount, price1]);
            } else {
                console.log("process path bad error");
                console.log(currency);
                console.log(JSON.stringify(m));
                return(0);
            };
        } else if(type[0] == "contract"){
            var contract = path[1][0];
            var cid = contract_to_cid(contract);;
            var mid = path[1][1][1];
            var c = db[cid];
            var source = c[8];
            var source_type = c[9];
            var m = db[mid];
            var mcid1 = m[2];
            var mtype1 = m[3];
            var mcid2 = m[5];
            var mtype2 = m[6];
            /*
            console.log(JSON.stringify(
                [[mcid1, mtype1],
                 [mcid2, mtype2]]));
            */
            var K = m[4] * m[7];
            var start_currency = path[0];
            var end_currency = path[2];
            path = path.slice(2);

            if((start_currency[0] == source) &&
               (start_currency[1] == source_type))
               {
                   if((mcid2 == source) && (mtype2 == source_type)) {
                       //so we know that m[2] == source. so we are spending from m[7]
                       //we are using the market to buy source currency, while using the contract to sell it.
                       //starting with Amount of both types of subcurrency.

                       //we sell the source in contract: Amount + buy_from_market
                       //we spend in market: Amount + gain_from_market
                       //K = A2*A1;
                       //K = (A2-G)*(A1+Amount + G);
                       //K = -G^2 + G(A2 - A1 - Amount) + (A2*(A1+Amount));
                       //0 = G^2 + G(A1 + Amount - A2) + (K - A2*(A1+Amount));
                       //0 = G^2 + G(A1 + Amount - A2) + (K - A2*A1-A2*Amount));
                       //0 = G^2 + G(A1 + Amount - A2) + (-A2*Amount));
                       var a = 1;
                       var b = m[4] + Amount - m[7];
                       var c = -Amount * m[7];
                       var G0 = Math.sqrt(b*b - (4*a*c));
                       var G1 = (-b + G0)/ 2;
                       var G2 = (-b - G0)/ 2;
                       var G = Math.max(G1, G2);
                       price1 = m[4]/m[7];
                       m[7] = m[7] - G;
                       m[4] = m[4] + Amount + G;
                       //m[7] = K / m[4];
                       if(!(Math.pow((((m[4] * m[7])/K) - 1), 2)<0.00001)){
                           console.log("error");
                           return(0);
                       };
                       
                       m = clean_market(m, K);
                       Amount = Amount + (G * trading_fee);
                       db[mid] = m;
                   } else if((mcid1 == source) && (mtype1 == source_type)){
                       var a = 1;
                       var b = m[7] + Amount - m[4];
                       var c = -Amount * m[4];
                       var G0;
                       if((4*a*c) > (b*b)){
                           //G0 = -Math.sqrt(b*b - (4*a*c));
                           //G0 = 0;
                           //price1 = 1.1;
                           //Amount = 0;
                           console.log("error");
                           return(0)
                       } else {
                           G0 = Math.sqrt(b*b - (4*a*c));
                       };
                       var G1 = (-b + G0)/ 2;
                       var G2 = (-b - G0)/ 2;
                       var G = Math.max(G1, G2);
                       price1 = m[7]/m[4];
                       m[4] = m[4] - G;
                       m[7] = m[7] + Amount + G;
                       if(!(Math.pow((((m[4] * m[7])/K) - 1), 2)<0.00001)){
                           console.log(b*b - (4*a*c));
                           console.log(K);
                           console.log(m[4] * m[7]);
                           console.log("error");
                           return(0);
                       };
                       m = clean_market(m, K);
                       Amount = Amount + (G * trading_fee);
                       db[mid] = m;
                       //}
                   } else {
                       //starts at source. the market is between the subcurrencies.
                       if((end_currency[0] == mcid1) &&
                          (end_currency[1] == mtype1)){
                           price1 = m[7]/m[4];
                           m[7] = m[7] + Amount;
                           var old = m[4];
                           m[4] = K / m[7];
                           var gain = old - m[4];
                           m = clean_market(m, K);
                           Amount = Amount + (gain * trading_fee);
                           db[mid] = m;
                       } else if ((end_currency[0] == mcid2) &&
                                  (end_currency[1] == mtype2)){
                           price1 = m[4]/m[7];
                           m[4] = m[4] + Amount;
                           var old = m[7];
                           m[7] = K / m[4];
                           var gain = old - m[7];
                           m = clean_market(m, K);
                           Amount = Amount + (gain * trading_fee);
                           db[mid] = m;
                       } else {
                           console.log("bad error");
                           return(0);
                       };
                   };
                   //from now on we only consider cases where you start out owning one of the subcurrencies.
               } else if((end_currency[0] == source) &&
                         (end_currency[1] == source_type)) {
                   if((mcid1 == source)&&(mtype1 == source_type)){
                       //contract-buy source, market spend source to buy other subcurrency

                       //know: A1, A2, K
                       //to know: Contract Buy, S, G

                       //contract buy = amount,
                       //S = Amount
                       
                       //K = A1 * A2
                       //K = (A1 + S)(A2 - G)

                       //G = A2 - (K/(A1+S))

                       //var G = m[7] - (K/(m[4] + Amount));
                       /*
                       m[4] = m[4] + Amount;
                       var old = m[7];
                       m[7] = K/m[4];
                       var G = old - m[7];
                       Amount = (G * trading_fee) - Amount;
                       */
                       //A1*A2 = (A1 + ?)(A2 + -Amount)
                       //(A1*A2/(A2-Amount))-A1 = G

                       price1 = m[4]/m[7];
                       m[7] = m[7] - Amount;
                       var old = m[4];
                       m[4] = K/m[7];
                       var G = old - m[4];
                       //Amount = (G * trading_fee) - Amount;
                       m = clean_market(m, K);
                       Amount = Amount - G;
                       db[mid] = m;
                   } else if((mcid2 == source)&&(mtype2 == source_type)){
                       price1 = m[7]/m[4];
                       m[4] = m[4] - Amount;
                       var old = m[7];
                       m[7] = K/m[4];
                       var G = old - m[7];
                       m = clean_market(m, K);
                       Amount = Amount - G;
                       db[mid] = m;
                   } else if((mcid2 == start_currency[0]) &&
                             (mtype2 == start_currency[1])) {
                       //contract-buy source, market spend subcurrency to buy other subcurrency
                       //sell just enough to have equal amounts of bot
                        //buying m[5].
                        // buy B
                        //gain == Amount - B
                        //Amount - B = m[4] - m[4]
                        //B = Amount - m[4] + K/m[7]
                        //B = Amount - m[4] + K/(m[7] + B)
                        //(K/(m[7] + B)) = B - Amount + m[4]
                        //K = (m[7] + B) * (B - Amount + m[4])
                        //0 = B^2 + B(m[7] - Amount + m[4]) + ((m[7]*(m[4]-Amount)) - K)

                        //0 = a*x^2 + b*x + c
                        // a = 1;
                        // b = (m[7] + m[4] - Amount);
                        // c = ((m[7] * (m[4] - Amount)) - K)
                       // B = (-b +- sqrt(b*b - (4*a*c)))/ 2


                       //testing
                       //var temp = m[4];
                       //m[4] = m[7];
                       //m[7] = temp;

                       var K = m[4] * m[7];
                       var a = 1;
                       var b = m[7] + m[4] - Amount;
                       var c = ((m[7] * (m[4] - Amount)) - K);
                       var B0 = Math.sqrt(b*b - (4*a*c));
                       var B1 = (-b + B0)/ 2;
                       var B2 = (-b - B0)/ 2;
                       var B = Math.max(B1, B2);
                       price1 = m[7]/m[4];
                       m[7] = m[7] + B;
                       var old = m[4];
                       m[4] = K/m[7];
                       var gain = old - m[4];
                       m = clean_market(m, K);
                       Amount = (gain * trading_fee);
                       db[mid] = m;
                           
                   } else if ((mcid1 == start_currency[0]) &&
                              (mtype1 == start_currency[1])) {
                       var a = 1;
                       var b = m[7] + m[4] - Amount;
                       var c = ((m[4] * (m[7] - Amount)) - K);
                       var B0 = Math.sqrt(b*b - (4*a*c));
                       var B1 = (-b + B0)/ 2;
                       var B2 = (-b - B0)/ 2;
                       var B = Math.max(B1, B2);
                       price1 = m[4]/m[7];
                       m[4] = m[4] + B;
                       var old = m[7];
                       m[7] = K/m[4];
                       var gain = old - m[7];
                       m = clean_market(m, K);
                       Amount = (gain * trading_fee);//also = Amount - B
                       db[mid] = m;
                   } else {
                       console.log("bad error");
                       return(0);
                   };
               } else {
                //now we only consider cases of selling one subcurrency to get another.
                //we know that one end of the market is the source.
                   if((mcid1 == start_currency[0]) &&
                      (mtype1 == start_currency[1])){
                       //contract-sell source, market spend subcurrency to buy source.
                       //K = A1*A2
                       //K = (A1 + Amount + G)(A2 - G)

                       //K = (A1 + Amount + G)(A2 - G)
                       //0 = -G^2 + G*(A2 - A1 -Amount) + (K - K + A2*Amount)
                       //0 = G^2 + G*(A1 + Amount - A2) - (A2*Amount)
                       var a = 1;
                       var b = m[4]+Amount-m[7];
                       var c = -m[7]*Amount;
                       var G0 = Math.sqrt(b*b - (4*a*c));
                       var G1 = (-b + G0)/ 2;
                       var G2 = (-b - G0)/ 2;
                       var G = Math.max(G1, G2);
                       price1 = m[4]/m[7];
                       m[4] = m[4] + Amount + G;
                       m[7] = m[7] - G;
                       //m[7] = K / m[4];
                       if(!(Math.pow(((m[4] * m[7]) - K), 2)<1)){
                           console.log("error");
                           return(0);
                       };
                       m = clean_market(m, K);
                       Amount = (G * trading_fee);
                       db[mid] = m;
                   } else if ((mcid2 == start_currency[0]) &&
                              (mtype2 == start_currency[1])){
                       //a1*a2 = (a1+amount+g)(a2-g)
                       //a1*a2 = a1*a2 + amount*a2 + g(a2 - amount - a1) - g*g
                       //0 = -g*g + g(a2-amount-a1) + (amount*a2)
                       //0 = g*g + g(amount+a1-a2) - (amount*a2)
                       var a = 1;
                       var b = Amount + m[7] - m[4];
                       var c = -m[4]*Amount;
                       var G0;
                       if((4*a*c)>(b*b)){
                           //G0 = -Math.sqrt(b*b - (4*a*c));
                           //G0 = 0;
                           //price1 = 1.1;
                           //Amount = 0;
                           //console.log(JSON.stringify([4*a*c, b*b]));
                           console.log("error");
                           return(0);
                       } else {
                           G0 = Math.sqrt(b*b - (4*a*c));
                       };
                       var G1 = (-b + G0)/ 2;
                       var G2 = (-b - G0)/ 2;
                       //var G = Math.max(G1, G2);
                       var G = Math.max(G1, G2);
                       var m0 = JSON.parse(JSON.stringify(m));
                       price1 = m[7]/m[4];
                       m[7] = m[7] + Amount + G;
                       m[4] = m[4] - G;
                       //m[4] = K / m[7];
                       if(!(Math.pow((((m[4] * m[7])/K) - 1), 2)<0.0001)){
                           console.log([a, b, c]);
                           console.log(b*b - (4*a*c));
                           console.log(G0);
                           console.log([m[4], m[7], Amount, G, K]);
                           console.log((Math.pow((((m[4] * m[7]))/K) - 1, 2)));
                           console.log("error");
                           return(0);
                       };
                       m = clean_market(m, K);
                       Amount = (G * trading_fee);
                       db[mid] = m;
                   } else if ((mcid1 == end_currency[0]) &&
                              (mtype1 == end_currency[1])){
                       //K = A1 * A2;
                       //K = (A1 + Amount) * (A2 - G);
                       //G-A2 = -K/(A1 + Amount)
                       //G = A2 -(K/(A1+Amount));
                       //var G = m[7] - (K/(m[4] + Amount));
                       price1 = m[4]/m[7];
                       m[4] = m[4] + Amount;
                       var old = m[7];
                       m[7] = K/m[4];
                       var G = old - m[7];
                       m = clean_market(m, K);
                       Amount = (G * trading_fee) - Amount;
                       db[mid] = m;
                   } else if ((mcid2 == end_currency[0])&&
                              (mtype2 == end_currency[1])){
                       price1 = m[7]/m[4];
                       m[7] = m[7] + Amount;
                       var old = m[4];
                       m[4] = K/m[7];
                       var G = old - m[4];
                       m = clean_market(m, K);
                       Amount = (G * trading_fee) - Amount;
                       db[mid] = m;
                   } else {
                       console.log("bad error");
                       return(0);
                   };
               };
        } else {
            console.log("process path bad error");
            console.log(type);
            return(0);
        }
        //console.log([price1, StartAmount/Amount]);
        return(process_path(Amount, path, price*StartAmount/Amount, db));
    };
    function all_paths(Paths, cid2, type2, contracts, markets, Steps) {
        if(Steps < 1) {
            return(Paths);
        };
        var Paths2 = market_extentions(Paths, markets, cid2, type2);
        var Paths3 = contract_extentions(Paths2, contracts, markets, cid2, type2);
        var Paths4 = remove_cycles(Paths3);
        var Paths5 = remove_repeats(Paths4);
        var Paths7 = remove_repeats2(Paths5);
        //var Paths7 = remove_repeats3(Paths6);
        return(all_paths(Paths7, cid2, type2, contracts, markets, Steps-1));
    };
    function path2mids(L) {
        if(L.length < 1){
            return([]);
        } else if(L[0][0] == "market"){
            return([L[0][1]]
                   .concat(path2mids(L.slice(1))));
        } else if(L[0][0][0] == "contract"){
            return([L[0][1][1]]
                   .concat(path2mids(L.slice(1))));
        } else {
            return(path2mids(L.slice(1)));
        };
    };
    function currencies_add(cid, type, amount, currencies) {
        if(currencies[[cid, type]]){
            currencies[[cid, type]] += amount;
        } else {
            currencies[[cid, type]] = amount;
        }
    };
    function calculate_loss(currency, txs, markets) {
        //console.log(JSON.stringify(currency));
        var r = 0;
        for(var i = 0; i<txs.length; i++){
            if(txs[i][0]=="contract_use_tx"){
                if((txs[i][7] == currency[0]) &&
                   (txs[i][8] == currency[1])){
                    r += txs[i][5];
                };
                //if(txs[i][4] == currency[0]){
                //    r -= txs[i][5];
                //};
            } else if (txs[i][0] == "market_swap_tx") {
                var direction = txs[i][7];
                if(direction == 1){
                    if((currency[0] == txs[i][8]) &&
                       (currency[1] == txs[i][9])){
                        r += txs[i][5];
                    }
                } else if (direction == 2){
                    if((currency[0] == txs[i][10]) &&
                       (currency[1] == txs[i][11])){
                        r += txs[i][5];
                    };
                };
            } else if (txs[i][0] == "market_liquidity_tx") {
                //console.log(JSON.stringify(txs[i][4]));
                //console.log(JSON.stringify(markets));
                var market = get_market(txs[i][4], markets);
                var volume = market[8];
                //console.log(JSON.stringify(currency));
                //console.log(JSON.stringify([txs[i][6], txs[i][8]]));
                if((currency[0] == txs[i][6]) &&
                   (currency[1] == txs[i][7])){
                    var buy = txs[i][5];
                    console.log("buy 1");
                    r += (buy/(volume))*market[4];

                } else if ((currency[0] == txs[i][8]) &&
                           (currency[1] == txs[i][9])){
                    console.log("buy 2");
                    var buy = txs[i][5];
                    r += (buy/(volume))*market[7];

                };
            };
        };
        return(r);
    };
    function get_market(mid, markets){
        for(var i = 0; i<markets.length; i++){
            if(markets[i][1] == mid){
                return(markets[i]);
            };
        };
        return(0);
    };
    function calculate_gain(currency, txs, markets) {
        var r = 0;
        for(var i = 0; i<txs.length; i++){
            if(txs[i][0]=="contract_use_tx"){
                if(txs[i][4] == currency[0]){
                    r += txs[i][5];
                };
            } else if (txs[i][0] == "market_swap_tx") {
                var direction = txs[i][7];
                if(direction == 1){
                    if((currency[0] == txs[i][10]) &&
                       (currency[1] == txs[i][11])){
                        r += txs[i][6];
                    }
                } else if (direction == 2){
                    if((currency[0] == txs[i][8]) &&
                       (currency[1] == txs[i][9])){
                        r += txs[i][6];
                    };
                };
            } else if (txs[i][0] == "market_liquidity_tx") {
                if((currency[0] == txs[i][4]) &&
                   (currency[1] == 0)){
                    r += txs[i][5];
                }
               
            };
        };
        return(r);
    };
    function normalize(L) {
        var total = 0;
        for(var i = 0; i<L.length; i++){
            total = total + L[i];
        };
        var t = [];
        for(var i = 0; i<L.length; i++){
            t = t.concat([L[i] / total]);
        };
        return(t);
    };
    function make_tx(guess, amount, Paths, db, db2, markets, callback) {
        //console.log("make tx");
        var get_currency = Paths[0][Paths[0].length - 1];
        var maxGuess = 0;//the amount of money we are putting on the path we are putting the most money on.
        var tx_price;
        for(var i = 0; i<guess.length; i++){
            if(amount > 0){
            maxGuess = Math.max(
                maxGuess, guess[i]);
            } else {
            maxGuess = Math.min(
                maxGuess, guess[i]);
            }
        };
        //console.log("maxGuess");
        //console.log(maxGuess);
        //getting the tx price on the maxGuess path.
        for(var i = 0; i<guess.length; i++){
            var db3 = JSON.parse(JSON.stringify(db2));
            var x = process_path(1, Paths[i], 1, db3);
            if(guess[i] == maxGuess){
                tx_price = x[1];
            };
        };
        //console.log("tx price");
        //console.log(tx_price);
        //tx_price = median(tx_prices);
//        console.log(tx_price);
        var currencies = {};
        var first_cid = Paths[0][0][0];
        var first_type = Paths[0][0][1];
        currencies_add(first_cid, first_type, amount, currencies);
        //console.log("currencies 0 ");
        //console.log(JSON.stringify(currencies));
        //console.log(JSON.stringify(Paths));
        //console.log(JSON.stringify(currencies));
        //console.log(JSON.stringify(db));
        //console.log(JSON.stringify(db2));
        var txs = [];
        var mids = [];
        for(var i = 0; i<guess.length; i++){
            if(((amount > 0) && (guess[i] > 10)) ||
               (amount < 0) && (guess[i] < -10)) {
                var p = Paths[i];
                mids = mids.concat(path2mids(p));
            };
        };
        mids = remove_repeats(mids);
        //console.log("mids");
        //console.log(mids);
        for(var i = 0; i<mids.length; i++){
            var id = mids[i];
            var m1 = db[id];
            var m2 = db2[id];
            var tx = ["market_swap_tx", 0,
                      0, 0,
                      mids[i], 0,//parseInt(give.value),
                      0,//parseInt(take.value),
                      0,//parseInt(direction.value),
                      m1[2], m1[3],
                      m1[5], m1[6]];
            if(m1[7] < m2[7]){
                //var amount = m2[4] - m1[4];
                tx[5] = Math.ceil(m2[7] - m1[7]);
                currencies_add(m1[5], m1[6], -tx[5], currencies);
                tx[6] = Math.floor((m1[4] - m2[4])*trading_fee*slippage);
                currencies_add(m1[2], m1[3], tx[6], currencies);
                tx[7] = 2;//direction
                txs = txs.concat([tx]);
            } else if (m1[4] < m2[4]){
                //var amount = m2[7] - m1[7];
                tx[5] = Math.ceil(m2[4] - m1[4]);
                currencies_add(m1[2], m1[3], -tx[5], currencies);
                tx[6] = Math.floor((m1[7] - m2[7])*trading_fee*slippage);
                currencies_add(m1[5], m1[6], tx[6], currencies);
                tx[7] = 1;
                txs = txs.concat([tx]);
            } else {
                //console.log(JSON.stringify([m1, m2]));
                //console.log("failure");
                //return(0);
            };
            //txs = txs.concat([tx]);
        };
        //if any subcurrency balances are negative, buy enough complete sets to make it positive.
        var Accs = Object.keys(currencies);
        //console.log(JSON.stringify(currencies));
        var potential_use_contracts = [];
        var max_contract_needs = {};// cid -> amount
        for(var i = 0; i<Accs.length; i++){
            var Acc = currencies[Accs[i]];
            if((!(Accs[i] == [ZERO,0])) &&
               (!(Accs[i] == get_currency))){
                var puc = [Accs[i], Acc];
                var id = Accs[i];
                var id = id.slice(0, id.search(","));
                if(!(max_contract_needs[id])){
                    max_contract_needs[id] = puc[1];//+x;
                } else {
                    max_contract_needs[id] =
                        Math.min(puc[1],//+x,
                                 max_contract_needs[id]);
                }
            };
        };
        //console.log(JSON.stringify(max_contract_needs));
        var to_buy = Object.keys(max_contract_needs);
        for(var i = 0; i<to_buy.length; i++){
            var cid = to_buy[i];
            //console.log(cid);
            var c = db[cid];
            var source = c[8];
            var source_type = c[9];
            var tx = ["contract_use_tx", 0, 0, 0,
                      cid,
                      -max_contract_needs[cid],
                      2,
                      source, source_type];
            txs = [tx].concat(txs);
        };
        //console.log("made txs");
        //console.log(JSON.stringify(txs));
        return(callback(txs, markets));
        //return(make_tx2(txs, Paths[0][0], Paths[0][Paths[0].length - 1]));
    };
    function make_tx2(txs, markets, spend_currency, gain_currency) {
        var trading_fees = 0;
        for(var i = 0; i<txs.length; i++){
            if(txs[i][0] == "market_swap_tx"){
                trading_fees += txs[i][5] * 0.002;//hard coded governance fee
            }
        };
        var loss = calculate_loss(spend_currency, txs, markets) - calculate_gain(spend_currency, txs, markets);
        var gain = calculate_gain(gain_currency, txs, markets) - calculate_loss(gain_currency, txs, markets);
        var tx_price = loss/gain;
        get_oracle_text(gain_currency[0], function(gain_oracle_text){
            get_contract(gain_currency[0], function(gain_contract){
                get_oracle_text(spend_currency[0], function(spend_oracle_text){
                    get_contract(spend_currency[0], async function(spend_contract){
                        //TODO, before calling the slow multi_tx, we can display price information for the user.
                            //console.log(JSON.stringify(txs));
                        var gain_db = decode_oracle(gain_oracle_text, gain_contract, gain_currency, markets);
                        var spend_db = decode_oracle(spend_oracle_text, spend_contract, spend_currency, markets);
                        var price = gain * gain_db.limit / loss / spend_db.limit;
                        var price_old = gain_db.price_b / spend_db.price_b;
                        var slippage = Math.abs(price - price_old)/price_old;
                        var show_price = price.toFixed(4).toString()
                            .concat(gain_db.ticker)
                            .concat(" per ")
                            .concat(spend_db.ticker);
                        var to_display = "you can sell "
                            .concat(((loss * spend_db.limit)/ token_units()).toString())
                            .concat(spend_db.ticker)
                            .concat(" <br>to receive ")
                            .concat(((gain * gain_db.limit)/ token_units()).toFixed(8).toString())
                            .concat(gain_db.ticker)
                            .concat(" <br>trading at a price of: ")
                            .concat(show_price)
                            .concat(" <br>leaving the market at a price of: ")
                            .concat(final_price.toFixed(4).toString())
                            .concat(gain_db.ticker)
                            .concat(" per ")
                            .concat(spend_db.ticker)
                            .concat(" <br>slippage: ")
                            .concat((slippage*100).toFixed(2).toString())
                            .concat("%");
                        display.innerHTML = to_display;
                                      
                                     
                        if(gain_db.link){
                            display.appendChild(br());
                            var gain_span = document.createElement("span");
                            gain_span.innerHTML = "gain ";
                            display.appendChild(gain_span);
                            display.appendChild(gain_db.link);
                        };
                        if(spend_db.link){
                            display.appendChild(br());
                            var spend_span = document.createElement("span");
                            spend_span.innerHTML = "spend ";
                            display.appendChild(spend_span);
                            display.appendChild(spend_db.link);
                        };
                            
                        console.log(JSON.stringify(txs));
                        var tx = await multi_tx.amake(txs);
                        var fee_span = document.createElement("span");
                        fee_span.innerHTML = "<br>veo fees: "
                            .concat(((trading_fees + (slippage * loss) + tx[3])/token_units()).toFixed(8).toString());
                        display.appendChild(fee_span);

                        
                        
                        var stx = keys.sign(tx);
                        //console.log(JSON.stringify(tx));
                        //console.log(JSON.stringify(txs));
                        //return(0);
                        publish_tx_button.onclick = async function(){
                            //post_txs([stx], function(msg){
                            var msg = await apost_txs([stx]);
                            memoized_markets = {};
                            display.innerHTML = msg
                                .concat("<br>clearing cache of market data.");
                            keys.update_balance();
                            //});
                        };
                    });
                });
            });
        });
        //});
    };
    function decode_oracle(text, contract, currency, markets){
        if(contract === 0){
            return({
                price_b: 1,
                limit: 1,
                slippage: 0,
                ticker: " veo"
            });
        };
        var source = [contract[8], contract[9]];
        //console.log(JSON.stringify([source, currency]));

        var mid1 = new_market.mid(source[0], currency[0], 0, 1);
        var mid2 = new_market.mid(source[0], currency[0], 0, 2);
        var mid3 = new_market.mid(currency[0], currency[0], 1, 2);
        var market1 = get_market(mid1, markets);
        var market2 = get_market(mid2, markets);
        var market3 = get_market(mid3, markets);
        var P = price_estimate(market1, market2, market3);//value of a stablecoin in veo. between 0 and 1, 1 means the margin is used up.
        if(currency[1] === 2){
            P = 1-P;
        };
        var r = {
            ticker: " shares ",
            price_b: 1/P,
            limit: 1,
            slippage: 0
        };
        if(text && (!(text === 0))){
            text = atob(text[1]);
            if(tabs.is_ticker_format(text)){
                var limit = tabs.coll_limit(text);
                //var ticker = tabs.symbol(text);
                var front = " iv";
                if(currency[1] === 1){
                    //r.price = limit * gain / loss;
                    r.limit = limit;
                    r.price_b = limit / P;
                    front = " v";
                }
                r.ticker = front
                    .concat(tabs.symbol(text));
                //r.to_receive = limit * gain;
                //r.slippage = Math.abs(r.price - r.price_b)/r.price_b;
            };
        };
        var cid_link = document.createElement("a");
        cid_link.href = "explorers/contract_explorer.html?cid="
            .concat(currency[0]);
        cid_link.innerHTML = "currency info";//" shares ";
        cid_link.target = "_blank";
        r.link = cid_link;
        return(r);
    };

    function get_oracle_text(cid, callback){
        if(cid === ZERO){ return(callback(0)); }
        memoized_oracle_text_post(cid, function(x){
            return(callback(x));
        }, get_ip(), 8090);
    };
    function get_contract(cid, callback){
        if(cid === ZERO){ return(callback(0)); }
        memoized_contract_post(cid, function(x){
            return(callback(x));
        });
    };
    function contract_extentions(Paths, contracts, markets, cid2, type2) {
        var Paths2 = [];
        for (var p = 0; p<Paths.length; p++){
            for (var c = 0; c<contracts.length; c++){
                //if the contract source is the same as what I have, or if the mix of subcurrencies is what I have.
                var Path = Paths[p];
                var Tip = Path[Path.length - 1];
                var Contract = contracts[c];
                var Source = Contract[8];
                var SourceType = Contract[9];
                var MT = Contract[2];
                var cid = contract_to_cid(Contract);
                //if the tip is one of the currencies in this market, then make paths that lead to each of the other currencies that we can.
                if((Tip[0] == cid2) && (Tip[1] == type2)) {
                    Paths2 = Paths2.concat([Paths[p]]);
                } else if((Tip[0] == Source) && (Tip[1] == SourceType)) {
                    if(!(MT == 2))
                    {
                        display.innerHTML = "only programmed for scalar contracts so far";
                        Paths2 = Paths2.concat([Paths[p]]);
                        return(0);
                    };
                        //so we can change it into any of the subcurrencies.
                        //changing directly to the goal is done by market_executions.
                        //so we want a market that changes the wrong way + the contract.
                    //check if markets exist connecting the source to it's subcurrencies.
                    var Markets = markets_from_list(Source, SourceType, cid, markets);
                    var Markets2 = [];
                    for(var i = 0; i<Markets.length; i++) {
                        var other = market_other(Source, Markets[i]);
                        var step = [Contract, Markets[i]];
                        var newPath = Paths[p].concat([step, other]);
                        Markets2 = Markets2.concat([newPath]);
                    };
                    var direct = market_from_list(cid,1,cid,2,markets);
                    if(direct.length > 0){
                        var newPath = Paths[p].concat([[Contract,direct[0]],[cid, 1]]);
                        Markets2 = Markets2.concat([newPath]);
                        var newPath = Paths[p].concat([[Contract,direct[0]],[cid, 2]]);
                        Markets2 = Markets2.concat([newPath]);
                    }
                    Paths2 = Paths2
                        .concat([Paths[p]])
                        .concat(Markets2);
                        //*/
                //}
                } else if (Tip[0] == cid){
                    //so we can change it into any of the other subcurrencies, or the source.
                    //* 1 market directly to other subcurrency. this case is handled by the other
                    //* 1 market directly to source. handled by other.
                    //market to source + contract. to get to the other subcurrency.
                    //market to other subcurrency + contract

                    var otherType;
                    if(Tip[1] == 1){
                        otherType = 2;
                    } else if (Tip[1] == 2) {
                        otherType = 1;
                    } else {
                        console.log("bad tip");
                        return(0);
                    };

                    Paths2 = Paths2.concat([Paths[p]]);
                    var m2s = market_from_list(Source, SourceType, Tip[0], Tip[1], markets);
                    //var m2s = market_from_list(Source, SourceType, Tip[0], otherType, markets);
                    if(m2s.length > 0){
                        //var other = [Source, SourceType];
                        var other = [Tip[0], otherType];
                        var step = [Contract, m2s[0]];
                        var newPath = Paths[p].concat([step, other]);
                        //var newPath = Paths[p].concat([Contract, m2s[0], other]);
                        Paths2 = Paths2.concat([newPath]);
                    }
                    var m2other = market_from_list(Tip[0], otherType, Tip[0], Tip[1], markets);
                    if(m2other.length > 0){
                        //var other = [Tip[0], otherType];
                        var other = [Source, SourceType];
                        var step = [Contract, m2other[0]];
                        var newPath = Paths[p].concat([step, other]);
                        Paths2 = Paths2.concat([newPath]);
                    }
                } else {
                    Paths2 = Paths2.concat([Paths[p]]);
                }
            };
        };
        return Paths2;
    };
    function market_extentions(Paths, markets, cid2, type2) {
        var Paths2 = [];
        for (var p = 0; p<Paths.length; p++){
            for (var c = 0; c<markets.length; c++){
                //if one side or the other of the market is the same as what I have.
                var Path = Paths[p];
                var Tip = Path[Path.length - 1];
                var Market = markets[c];
                var CID1 = Market[2];
                var Type1 = Market[3];
                var CID2 = Market[5];
                var Type2 = Market[6];
                if((Tip[0] == cid2) && (Tip[1] == type2)){
                    Paths2 = Paths2.concat([Paths[p]]);
                } else if((Tip[0] == CID1) && (Tip[1] == Type1)){
                    Paths2 = Paths2
                        .concat([Paths[p]])
                        .concat([Paths[p].concat([Market, [CID2, Type2]])])
                } else if ((Tip[0] == CID2) && (Tip[1] == Type2)) {
                    Paths2 = Paths2.concat([Paths[p].concat([Market, [CID1, Type1]])])
                } else {
                    Paths2 = Paths2.concat([Paths[p]]);
                }
            };
        };
        return Paths2;
    };
    function markets_from_list(Source, SType, CID, markets) {
        var l = [];
        for(var m = 0; m<markets.length; m++) {
            if((markets[m][2] == Source)
               &&(markets[m][3] == SType)
               &&(markets[m][5] == CID))
            {
                l = l.concat([markets[m]]);
            } else if((markets[m][5] == Source)
                      &&(markets[m][6] == SType)
                      &&(markets[m][2] == CID))
            {
                l = l.concat([markets[m]]);
            }
        };
        return(l);
    };
    function market_from_list(CID1, Type1, CID2, Type2, markets) {
        var m2 = markets_from_list(CID1, Type1, CID2, markets);
        var m3 = markets_from_list(CID2, Type2, CID1, m2);
        return(m3);
    };
    function get_markets(MIDS, Markets, callback){
        if(MIDS.length < 1) {
            return(callback(Markets));
        };
        memoized_markets_post(MIDS[0], function(Market){
            get_markets(MIDS.slice(1),
                        Markets.concat([Market]),
                        callback);
        });
    };
    function get_contracts(CIDS, Contracts, callback){
        if(CIDS.length<1) {
            return(callback(Contracts));
        };
        memoized_contract_post(CIDS[0], function(Contract){
            get_contracts(CIDS.slice(1),
                          Contracts.concat([Contract]),
                          callback)
        });
    };
    function path2clist(L) {
        var r = [];
        for(var i = 0; i < L.length; i += 2){
            r = r.concat([L[i]]);
        };
        return(r);
    };
    function has_repeats2(L){
        if(L.length < 4){
            return(false);
        };
        var currency_list = path2clist(L);
        var start_c = currency_list[0];
        var end_c = currency_list.reverse()[0];
        //console.log(JSON.stringify([start_c, end_c]));
        for(var i = 1; i<L.length; i += 2){
            if(L[i][0] == "market"){
                //console.log("in has repeats");
                //return(true);
            } else {
                var market = L[i][1];
                var cid1 = market[2];
                var type1 = market[3];
                var cid2 = market[5];
                var type2 = market[6];
                //console.log("HERE");
                //console.log(
                //    JSON.stringify(
                //        [[start_c, end_c],
                //         [[cid1, type1],
                //          [cid2, type2]]]));
                if(((cid1 == start_c[0]) &&
                    (type1 == start_c[1])) &&
                   ((cid2 == end_c[0]) &&
                    (type2 == end_c[1]))){
                    return(true);
                };
                if(((cid2 == start_c[0]) &&
                    (type2 == start_c[1])) &&
                   ((cid1 == end_c[0]) &&
                    (type1 == end_c[1]))){
                    return(true);
                };
            };
        };
        return(false);
    };
    function has_repeats3(Path){
        var markets = {};
        for(var i = 1; i < Path.length; i+=2){
            var id;
            if(Path[i][0] === "market"){
                id = Path[i][1];
            } else {
                id = Path[i][1][1];
            };
            if(markets[id]){
                return(true);
            } else {
                markets[id] = [];
            };
        };
        return(false);
    };
    function remove_repeats3(L){
        var r = [];
        for(var i = 0; i < L.length; i++){
            if(!(has_repeats3(L[i]))){
                r = r.concat([L[i]]);
            };
        };
        return(r);
    };
    function remove_repeats2(L){
        var r = [];
        for(var i = 0; i<L.length; i++){
            if(!(has_repeats2(L[i]))){
                r = r.concat([L[i]]);
            };
        };
        return(r);
    };
    function remove_cycles(L) {
        if(L.length < 1){
            return([]);
        };
        var H = L[0];
        var H2 = remove_repeats(H);
        if(JSON.stringify(H) ==
           JSON.stringify(H2)){
            return([H].concat(remove_cycles(L.slice(1))));
        } else {
            return(remove_cycles(L.slice(1)));
        }
    };
    function remove_repeats(L) {
        if(L.length < 1){
            return([]);
        };
        var L2 = L.slice(1);
        var B = is_in(L[0], L2);
        if(B){
            return(remove_repeats(L2));
        } else {
            return([L[0]].concat(remove_repeats(L2)));
        };
    };
    function is_in(X, L) {
        for(var j = 0; j<L.length; j++){
            if(JSON.stringify(X) == JSON.stringify(L[j])){
                return(true);
            };
        };
        return(false);
    };
    function flatten(L) {
        if(L.length == 0){
            return(L);
        };
        if(Array.isArray(L[0])){
            return(flatten(L[0])
                   .concat(flatten(L.slice(1))));
        };
        return([L[0]]
               .concat(flatten(L.slice(1))));
    };
    function other_type2(N) {
        if(N == 1) { return(2);};
        if(N == 2) { return(1);};
        console.log("other type failure");
        return("bad");
    };
    function market_other(Source, Market) {

        if(Market[2] == Source){
            return([Market[5],
                    other_type2(Market[6])]);
        } else if(Market[5] == Source){
            return([Market[2],
                    other_type2(Market[3])]);
        } else {
            console.log("bad failure in market other.");
            return(0);
        };
    };
    var memoized_contracts = {};
    async function memoized_contract_post(cid, callback){
        var x = memoized_contracts[cid];
        if(x){
            return(callback(x));
        } else {
            var contract = await rpc.apost(["contracts", cid]);
            memoized_contracts[cid] = contract;
            return(callback(contract));
        };
    };
    var memoized_sub_accounts = {};
    async function memoized_sub_account_post(id, callback){
        var x = memoized_sub_accounts[id];
        if(x || (x === 0)){
            return(callback(x));
        } else {
            var acc = await rpc.apost(["sub_accounts", id]);
            memoized_sub_accounts[id] = acc;
            return(callback(acc));
        };
    };
    var memoized_r_paths = {};
    async function memoized_r_paths_post(cid1, cid2, callback){
        var x = memoized_r_paths[[cid1, cid2]];
        if(x){
            return(callback(x));
        } else {
            var r = await rpc.apost(["r", cid1, cid2], get_ip(), 8091);
            memoized_r_paths[[cid1, cid2]] = r;
            return(callback(r));
        //}, get_ip(), 8091);
        };
    };
    var memoized_oracle_text = {};
    async function memoized_oracle_text_post(cid, callback){
        var x = memoized_oracle_text[cid];
        if(x){
            return(callback(x));
        } else {
            var x = await rpc.apost(["read", 3, cid], get_ip(), 8090);
            memoized_oracle_text[cid] = x;
            return(callback(x));
        };
    };
    var memoized_markets = {};
    async function memoized_markets_post(mid, callback){
        var x = memoized_markets[mid];
        if(x){
            return(callback(x));
        } else {
            var x = await rpc.apost(["markets", mid]);
            memoized_markets[mid] = x;
            return(callback(x));
        };
    };

    function test(){
        var Paths = [[["G8dXI4RVHv75cOtLXX+fOZwfFMmPaZwjnnNj9LZz4l4=",1],[["contract","y3VnWqg/NKB2OThyueZDhqYwmBMUcDhjBBNaJ2Upk2Y=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",322517842],["market","ecbQ7aj9+60TuBJqEIFUftHXQOkVfz0JkSYZXrt4ylk=","G8dXI4RVHv75cOtLXX+fOZwfFMmPaZwjnnNj9LZz4l4=",1,169579958,"G8dXI4RVHv75cOtLXX+fOZwfFMmPaZwjnnNj9LZz4l4=",2,59331334,99999000]],["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0]]];
        var db = build_paths_db(Paths, {});
        var gradient = get_gradient(Paths, db, 1);
        var L = Paths.length;
        var amount = 100000000;
        var a = amount / L;
        var guess = array_of(a, L);
        var db2 = make_trades(guess, Paths, db)[0];
        //console.log(JSON.stringify(db));
        //console.log(JSON.stringify(db2));
        //var gradient1 = get_gradient(Paths, db2);
        //var average = average_fun(gradient1, guess);
        var markets = 
            [["market","ecbQ7aj9+60TuBJqEIFUftHXQOkVfz0JkSYZXrt4ylk=","G8dXI4RVHv75cOtLXX+fOZwfFMmPaZwjnnNj9LZz4l4=",1,169579958,"G8dXI4RVHv75cOtLXX+fOZwfFMmPaZwjnnNj9LZz4l4=",2,59331334,99999000]];
        return(make_tx(guess, amount, Paths, db, db2, markets, function(txs, markets){
            console.log(JSON.stringify([txs, markets]));
        }));
    };
    function test0(){
        var Paths = [[["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0],["market","rsElNHBtnaGnMGRYdcNm5nUVE8FSMvQsIvJFuM4AYkI=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,2,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1,9094,100],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1]],
                     [["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0],[["contract","Wx2YcdRvaTE0R9PRbGKUj9X9QrcfPq4h4btyCrkjCz4=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",6874237],["market","rsElNHBtnaGnMGRYdcNm5nUVE8FSMvQsIvJFuM4AYkI=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,2,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1,9094,100]],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2],["market","FZLd0BqjMKGt2UwU97m++LWuebV5T0TRPC5q4wu2Jrw=","Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1,5955367,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3032666,4249635],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1]],
                     [["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0],[["contract","Wx2YcdRvaTE0R9PRbGKUj9X9QrcfPq4h4btyCrkjCz4=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",6874237],["market","rsElNHBtnaGnMGRYdcNm5nUVE8FSMvQsIvJFuM4AYkI=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,2,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1,9094,100]],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2],[["contract","Wx2YcdRvaTE0R9PRbGKUj9X9QrcfPq4h4btyCrkjCz4=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",6874237],["market","ySFXS28nO1/DqD+RmKIKRLfyCNBADqLtpMFg+BGInXg=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,3227097,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3841571,3520283]],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1]],
                     [["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0],[["contract","Wx2YcdRvaTE0R9PRbGKUj9X9QrcfPq4h4btyCrkjCz4=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",6874237],["market","ySFXS28nO1/DqD+RmKIKRLfyCNBADqLtpMFg+BGInXg=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,3227097,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3841571,3520283]],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1]],[["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0],[["contract","Wx2YcdRvaTE0R9PRbGKUj9X9QrcfPq4h4btyCrkjCz4=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",6874237],["market","FZLd0BqjMKGt2UwU97m++LWuebV5T0TRPC5q4wu2Jrw=","Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1,5955367,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3032666,4249635]],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1]],[["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0],[["contract","Wx2YcdRvaTE0R9PRbGKUj9X9QrcfPq4h4btyCrkjCz4=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",6874237],["market","FZLd0BqjMKGt2UwU97m++LWuebV5T0TRPC5q4wu2Jrw=","Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1,5955367,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3032666,4249635]],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2],["market","FZLd0BqjMKGt2UwU97m++LWuebV5T0TRPC5q4wu2Jrw=","Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1,5955367,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3032666,4249635],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1]],[["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0],[["contract","Wx2YcdRvaTE0R9PRbGKUj9X9QrcfPq4h4btyCrkjCz4=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",6874237],["market","FZLd0BqjMKGt2UwU97m++LWuebV5T0TRPC5q4wu2Jrw=","Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1,5955367,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3032666,4249635]],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2],[["contract","Wx2YcdRvaTE0R9PRbGKUj9X9QrcfPq4h4btyCrkjCz4=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",6874237],["market","ySFXS28nO1/DqD+RmKIKRLfyCNBADqLtpMFg+BGInXg=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,3227097,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3841571,3520283]],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1]],[["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0],["market","ySFXS28nO1/DqD+RmKIKRLfyCNBADqLtpMFg+BGInXg=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,3227097,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3841571,3520283],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2],["market","FZLd0BqjMKGt2UwU97m++LWuebV5T0TRPC5q4wu2Jrw=","Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1,5955367,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3032666,4249635],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1]],[["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0],["market","ySFXS28nO1/DqD+RmKIKRLfyCNBADqLtpMFg+BGInXg=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,3227097,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3841571,3520283],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2],[["contract","Wx2YcdRvaTE0R9PRbGKUj9X9QrcfPq4h4btyCrkjCz4=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",6874237],["market","ySFXS28nO1/DqD+RmKIKRLfyCNBADqLtpMFg+BGInXg=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,3227097,"Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",2,3841571,3520283]],["Jif9Cg1v6na1hy1HZ6EbKkeVvH0KqUQ9Ghr1MYphdfw=",1]]];
        //Paths = Paths.reverse();
        Paths2 = [];//JSON.parse(JSON.stringify(Paths));
        var db = build_paths_db(Paths, {});
        var gradient0 = get_gradient(Paths, db, 1);
        console.log(JSON.stringify(gradient0));
        for(var i = 0; i<Paths.length; i++){
            if(//true){//
                gradient0[i] < 0.5){
                Paths2 = Paths2.concat([Paths[i]]);
            };
        };
        console.log(JSON.stringify([Paths.length, Paths2.length]));
        Paths = Paths2;
        //console.log(JSON.stringify(Paths));
        var db = build_paths_db(Paths, {});
        var L = Paths.length;
        var amount = 100000000;
        var a = amount / L;
        var guess = array_of(1, L);
        guess[0] = amount;
        var db2 = make_trades(guess, Paths, db)[0];
       // var gradient0 = get_gradient(Paths, db);
        var gradient1 = get_gradient(Paths, db2, 1);
        var laplacian = get_laplacian(Paths, db2, gradient1);
        var average = average_fun(gradient1, guess);
        var nextGuess = improve_guess(average, guess, gradient1, amount, laplacian);
        var db3 = make_trades(nextGuess, Paths, db)[0];
//        var gradient2 = get_gradient(Paths, db3);
        return(
            [average,
             //guess, //nextGuess,
                //gradient0[0],
             gradient0,
             //Paths[0]
             //gradient2[0],
             [db["rsElNHBtnaGnMGRYdcNm5nUVE8FSMvQsIvJFuM4AYkI="][4],
              db["rsElNHBtnaGnMGRYdcNm5nUVE8FSMvQsIvJFuM4AYkI="][7]],
             [db2["rsElNHBtnaGnMGRYdcNm5nUVE8FSMvQsIvJFuM4AYkI="][4],
             db2["rsElNHBtnaGnMGRYdcNm5nUVE8FSMvQsIvJFuM4AYkI="][7]],
             [db3["rsElNHBtnaGnMGRYdcNm5nUVE8FSMvQsIvJFuM4AYkI="][4],
             db3["rsElNHBtnaGnMGRYdcNm5nUVE8FSMvQsIvJFuM4AYkI="][7]]
            ]);
    };
    function vsum(l){
        var r = 0;
        for(var i = 0; i<l.length; i++){
            r += l[i];
        };
        return(r);
    };
    return({
        txs_maker: txs_maker,
        //contract_to_cid: contract_to_cid,
        calculate_gain: calculate_gain,
        calculate_loss: calculate_loss,
        get_market: get_market,
//        price_estimate_read: price_estimate_read,
        test: test
    });
};
