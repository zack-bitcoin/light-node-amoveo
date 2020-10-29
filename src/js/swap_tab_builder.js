function swap_tab_builder(swap_tab, selector, hide_non_standard){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var trading_fee = 0.9979995;
    var loop_limit = 90;
    //var trading_fee = 0.98;
    var slippage = 1;
    var display = document.createElement("div");
    
    var contracts_div = document.createElement("div");
    display_contracts(contracts_div);
    swap_tab.appendChild(contracts_div);
    
    var swap_title = document.createElement("h3");
    swap_title.innerHTML = "Swap Currencies";
    swap_tab.appendChild(swap_title);
    swap_tab.appendChild(display);
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "which currency to sell: ";
    swap_tab.appendChild(selector_label);

//    var selector = document.createElement("select");
    swap_tab.appendChild(selector);
    swap_tab.appendChild(br());
    var amount_input = text_input("amount to sell: ", swap_tab);
    var sell_all_button = button_maker2("sell all", function(){
        var currency = selector.value;
        if(currency == "veo") {
            rpc.post(["account", keys.pub()], function(acc){
                amount_input.value = (acc[1] / token_units()).toFixed(8);
            });
        } else {
            currency = JSON.parse(currency);
            console.log(currency);
            var trie_key = sub_accounts.key(keys.pub(), currency[0], currency[1]);
            trie_key = btoa(array_to_string(trie_key));
            rpc.post(["sub_accounts", trie_key], function(acc) {
                var balance = 0;
                if(!(acc == "empty")){
                    balance = acc[1];
                };
                var limit = 1;
                if(currency[1] === 1){
                    limit = tabs.balances_db[trie_key].limit;
                };
                amount_input.value = (balance * limit / token_units()).toFixed(8);
                
            });
        };
    });
    swap_tab.appendChild(sell_all_button);
    swap_tab.appendChild(br());
    var contract_id = text_input("contract id to be paid in (leave blank for veo): ", swap_tab);
    swap_tab.appendChild(br());
    //    var contract_type = text_input("contract type to be paid in (leave blank for veo): ", swap_tab);
    var contract_type = document.createElement("select");
    var type_label = document.createElement("span");
    type_label.innerHTML = "kind to buy: ";
    var true_option = document.createElement("option");
    true_option.innerHTML = "contract";
    true_option.value = 1;
    var false_option = document.createElement("option");
    false_option.innerHTML = "inverse contract";
    false_option.value = 2;
    var pool_option = document.createElement("option");
    pool_option.innerHTML = "pool";
    pool_option.value = 0;
    contract_type.appendChild(true_option);
    contract_type.appendChild(false_option);
    //contract_type.appendChild(pool_option);
    swap_tab.appendChild(type_label);
    swap_tab.appendChild(contract_type);
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

    function display_contracts(div) {
        rpc.post(["contracts"], function(contracts){
            var s = "<h4>existing contracts</h4>";
            return(display_contracts2(div, contracts.slice(1), s));
        }, get_ip(), 8091);//8091 is explorer
    };
    function display_contracts2(div, contracts, s) {
        //console.log(JSON.stringify(contracts));
        if(contracts.length < 1) {
            //console.log(s);
            div.innerHTML = s;
            return(0);
        }
        //var cid = contracts[0][1];
        var cid = contract_to_cid(contracts[0]);
        var source = contracts[0][8];
        rpc.post(["read", 3, cid], function(oracle_text) {
            var mid1 = new_market.mid(source, cid, 0, 1);
            var mid2 = new_market.mid(source, cid, 0, 2);
            var mid3 = new_market.mid(cid, cid, 1, 2);
            rpc.post(["markets", mid1], function(market1){
                rpc.post(["markets", mid2], function(market2){
                    rpc.post(["markets", mid3], function(market3){
                        var p_est = price_estimate(market1, market2, market3);
                        console.log(p_est);
                        console.log(JSON.stringify([cid, mid3]));
            //console.log(contracts[0]);
            //console.log(cid);
            if(!(oracle_text == 0)) {
                var type = oracle_text[0];
                var text = atob(oracle_text[1]);
                var text0 = text;
                //console.log(text);
                //console.log(JSON.stringify(oracle_text));
                var ticker_bool =
                    tabs.is_ticker_format(text);
                //console.log(hide_non_standard);
                if((!(hide_non_standard)) || ticker_bool){
                    var button1_text = " contract ";
                    var button2_text = " inverse contract ";
                    if(ticker_bool){
                        //console.log("about to decode");
                        text = tabs.decode_ticker(text, p_est);
                        var ticker = "v".concat(tabs.symbol(text0));
                        var button1_text = ticker;
                        var button2_text =
                            " i".concat(ticker);
                    };
                    button_text = ""
                        .concat("<button onclick=\"tabs.swap.cid('")
                        .concat(cid)
                        .concat("'); tabs.swap.type(1);\"> buy ")
                        .concat(button1_text)
                        .concat(" </button>")
                        .concat("<button onclick=\"tabs.swap.cid('")
                        .concat(cid)
                        .concat("'); tabs.swap.type(2);\"> buy ")
                        .concat(button2_text)
                        .concat(" </button>");
                    s = s
                        .concat("\"")
                        .concat(text)
                        .concat("\"~ ")
                        .concat("; volume: ")
                        .concat((contracts[0][11] / token_units()).toString())
                        .concat(button_text)
                        .concat("<br>")
                        .concat("");
                };
            }
                    display_contracts2(div, contracts.slice(1), s);
                });
            });
            });
        }, get_ip(), 8090);//p2p derivatives server
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
        if(contract_id.value == "") {
            //selling something for veo
            CID2 = ZERO;
            Type2 = 0;
        } else {
            CID2 = contract_id.value;
            Type2 = parseInt(contract_type.value);
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
        rpc.post(["sub_accounts", sub_acc], function(SA) {
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
            rpc.post(["r", CID1, CID2], function(response){
                var markets = response[1].slice(1);
                var contracts = response[2].slice(1);
                return(swap_price2(markets, contracts,
                                   A,
                                   CID1, Type1,
                                   CID2, Type2,
                                   callback));
            }, get_ip(), 8091);
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
                return(swap_price3(Paths2, amount234, markets, callback));
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
        console.log(JSON.stringify(Paths));
        var L = Paths.length;
        if(L == 0){
            display.innerHTML = "error. there is no way to transform the input currency into the output currency.";
        };
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
        Paths = Paths.reverse();
        guess = guess.reverse();

        //Paths = (Paths.concat([Paths[0]])).slice(1);
        //guess = (guess.concat([guess[0]])).slice(1);

        var db20 = make_trades(guess, Paths, db);
        var db2 = db20[0]
        if(N < 1) {
            //var gradient = get_gradient(Paths, db2);
            return(make_tx(guess, amount, Paths, db, db2, markets, callback));
        };
        //make a database of the markets and contracts that can be updated with trades.

        //update the database based on our current guess of the distribution.
        //calculate the final price on every path to buy a bit more. this is the gradient vector.
        var gradient = get_gradient(Paths, db2);
        //var gradient = db20[1];
                           
        //console.log(JSON.stringify(Paths[0]));
        var average = average_fun(gradient, guess);
        console.log(guess);
        console.log(JSON.stringify(gradient));
        console.log(JSON.stringify(average));
        if(good_enough(gradient, guess, average)){
            console.log("done!");
            console.log(guess);
            return(make_tx(guess, amount, Paths, db, db2, markets, callback));
        } else {
            var nextGuess = improve_guess(average, guess, gradient, amount);
            return(swap_price_loop(Paths, amount, nextGuess, db, markets, callback, N-1));
        };
        //for the paths that are more expensive than average, buy less in the next iteration. for the paths that are less expensive, buy more in the next iteration.
    };
    function improve_guess(average, guess, grad, amount){
        var r = [];
        for(var i = 0; i<guess.length; i++){
            //var n = guess[i]*(1/(1+(Math.pow(Math.E, (grad[i]-average)/average))));

            //var n = guess[i] - 0.9*guess[i]*((grad[i]-average)/average);
            //var n = (guess[i]) - 0.1*guess[i]*((grad[i]-average)/average);
            //var n = (0.9*guess[i] * (1 + average) / (1 + grad[i])) + (0.1*guess[i]);
            //var n = guess[i]*(1/(1+(Math.pow(Math.E, 1/grad[i]))));
            //var n = guess[i]*(1/(1+(Math.pow(Math.E, -1/grad[i]))));
            var n = (guess[i])*(1 + 0.5*((average - grad[i])/average));
            //var prev = guess[i];
            //var n = (n + prev)/2;

            //var n =guess[i]+((average - grad[i])/2);
               //var n = (n + prev)/2;
               //var n = Math.min(n, prev*10);
               //var n = Math.max(n, prev/10);
            //var n = guess[i]*((grad[i]-average)/average);
            //var n = guess[i]*((grad[i]-average)/average);
            //var n = (0.9*guess[i]) + (0.1*guess[i]*((grad[i]-average)/average));
            //var n = (0.9*guess[i]) - (0.1*guess[i]*((grad[i]-average)/average));
            //var n = (guess[i]*0.9) - (grad[i]*0.1);
            var n = Math.max(n, 0);
            r = r.concat([n]);
        };
        //we also need to normalize, to make sure the sum of how much we are buying on each path is still equal to how much we want to spend.
        var total = 0;
        for(var i = 0; i<r.length; i++){
            total = total + r[i];
        };
        var t = [];
        for(var i = 0; i<r.length; i++){
            t = t.concat([amount * r[i] / total]);
        };
        return(t);
    };
    function average_fun(grad, guess) {
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
    function get_gradient(Paths, db3) {
        //var db4;
        var db4 = JSON.parse(JSON.stringify(db3));
        var r = [];
        for(var i = 0; i<Paths.length; i++){
            db4 = JSON.parse(JSON.stringify(db3));
            var x = process_path(1, Paths[i], 1, db4);
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
        if(Amount == 0){
            return([db, 10]);
        }
        var StartAmount = Amount;
        var currency = path[0];
        if(path.length < 2){
            return([db, price]);
        };
        var type = path[1][0];
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
                m[4] = m[4] + Amount;
                var old = m[7];
                m[7] = K/m[4];
                //console.log(Amount);
                m = clean_market(m, K);
                Amount = (old - m[7]) * trading_fee;
                db[mid] = m;
                return(process_path(Amount, path, price*StartAmount/Amount, db));
            } else if ((m[5] == currency[0]) &&
                       (m[6] == currency[1])){
                m[7] = m[7] + Amount;
                var old = m[4];
                m[4] = K/m[7];
                m = clean_market(m, K);
                Amount = (old - m[4]) * trading_fee;
                db[mid] = m;
                return(process_path(Amount, path, price*StartAmount/Amount, db));
            } else {
                console.log("process path bad error");
                console.log(currency);
                console.log(JSON.stringify(m));
                return(0);
            };
        };
        if(type[0] == "contract"){
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
            console.log(JSON.stringify(
                [[mcid1, mtype1],
                 [mcid2, mtype2]]));
            /*
            if([string_to_array(atob(mcid1)), mtype1]
               < [string_to_array(atob(mcid2)), mtype2]){
                temp_cid = mcid1;
                temp_type = mtype1;
                mcid1 = mcid2;
                mtype1 = mtype2;
                mcid2 = temp_cid;
                mtype2 = temp_type;
            };
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
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else if((mcid1 == source) && (mtype1 == source_type)){
                       var a = 1;
                       var b = m[7] + Amount - m[4];
                       var c = -Amount * m[4];
                       var G0 = Math.sqrt(b*b - (4*a*c));
                       var G1 = (-b + G0)/ 2;
                       var G2 = (-b - G0)/ 2;
                       var G = Math.max(G1, G2);
                       m[4] = m[4] - G;
                       m[7] = m[7] + Amount + G;
                       if(!(Math.pow((((m[4] * m[7])/K) - 1), 2)<0.00001)){
                           console.log(K);
                           console.log(m[4] * m[7]);
                           console.log("error");
                           return(0);
                       };
                       m = clean_market(m, K);
                       Amount = Amount + (G * trading_fee);
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else {
                       //starts at source. the market is between the subcurrencies.
                       if((end_currency[0] == mcid1) &&
                          (end_currency[1] == mtype1)){
                           m[7] = m[7] + Amount;
                           var old = m[4];
                           m[4] = K / m[7];
                           var gain = old - m[4];
                           m = clean_market(m, K);
                           Amount = Amount + (gain * trading_fee);
                           db[mid] = m;
                           return(process_path(Amount, path, price*StartAmount/Amount, db));
                       } else if ((end_currency[0] == mcid2) &&
                                  (end_currency[1] == mtype2)){
                           m[4] = m[4] + Amount;
                           var old = m[7];
                           m[7] = K / m[4];
                           var gain = old - m[7];
                           m = clean_market(m, K);
                           Amount = Amount + (gain * trading_fee);
                           db[mid] = m;
                           return(process_path(Amount, path, price*StartAmount/Amount, db));
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

                       m[7] = m[7] - Amount;
                       var old = m[4];
                       m[4] = K/m[7];
                       var G = old - m[4];
                       //Amount = (G * trading_fee) - Amount;
                       m = clean_market(m, K);
                       Amount = Amount - G;
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else if((mcid2 == source)&&(mtype2 == source_type)){
                       m[4] = m[4] - Amount;
                       var old = m[7];
                       m[7] = K/m[4];
                       var G = old - m[7];
                       m = clean_market(m, K);
                       Amount = Amount - G;
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                       
                   //} else if((mcid1 == start_currency[0]) &&
                    //         (mtype1 == start_currency[1])) {
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
                       m[7] = m[7] + B;
                       var old = m[4];
                       m[4] = K/m[7];
                       var gain = old - m[4];
                       m = clean_market(m, K);
                       Amount = (gain * trading_fee);

                       //testing
                       //temp = m[4];
                       //m[4] = m[7];
                       //m[7] = temp;

                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                           
                   //} else if ((mcid2 == start_currency[0]) &&
                    //          (mtype2 == start_currency[1])) {
                   } else if ((mcid1 == start_currency[0]) &&
                              (mtype1 == start_currency[1])) {
                       var a = 1;
                       var b = m[7] + m[4] - Amount;
                       var c = ((m[4] * (m[7] - Amount)) - K);
                       var B0 = Math.sqrt(b*b - (4*a*c));
                       var B1 = (-b + B0)/ 2;
                       var B2 = (-b - B0)/ 2;
                       var B = Math.max(B1, B2);
                       m[4] = m[4] + B;
                       var old = m[7];
                       m[7] = K/m[4];
                       var gain = old - m[7];
                       m = clean_market(m, K);
                       Amount = (gain * trading_fee);//also = Amount - B
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   };
                       console.log("bad error");
                       return(0);
               //};
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
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else if ((mcid2 == start_currency[0]) &&
                              (mtype2 == start_currency[1])){
                       //a1*a2 = (a1+amount+g)(a2-g)
                       //a1*a2 = a1*a2 + amount*a2 + g(a2 - amount - a1) - g*g
                       //0 = -g*g + g(a2-amount-a1) + (amount*a2)
                       //0 = g*g + g(amount+a1-a2) - (amount*a2)
                       var a = 1;
                       var b = Amount + m[7] - m[4];
                       var c = -m[4]*Amount;
                       var G0 = Math.sqrt(b*b - (4*a*c));
                       var G1 = (-b + G0)/ 2;
                       var G2 = (-b - G0)/ 2;
                       //var G = Math.max(G1, G2);
                       var G = Math.max(G1, G2);
                       var m0 = JSON.parse(JSON.stringify(m));
                       m[7] = m[7] + Amount + G;
                       m[4] = m[4] - G;
                       //m[4] = K / m[7];
                       if(!(Math.pow((((m[4] * m[7])/K) - 1), 2)<0.0001)){
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
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else if ((mcid1 == end_currency[0]) &&
                              (mtype1 == end_currency[1])){
                       //K = A1 * A2;
                       //K = (A1 + Amount) * (A2 - G);
                       //G-A2 = -K/(A1 + Amount)
                       //G = A2 -(K/(A1+Amount));
                       //var G = m[7] - (K/(m[4] + Amount));
                       m[4] = m[4] + Amount;
                       var old = m[7];
                       m[7] = K/m[4];
                       var G = old - m[7];
                       m = clean_market(m, K);
                       Amount = (G * trading_fee) - Amount;
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else if ((mcid2 == end_currency[0])&&
                              (mtype2 == end_currency[1])){
                       m[7] = m[7] + Amount;
                       var old = m[4];
                       m[4] = K/m[7];
                       var G = old - m[4];
                       m = clean_market(m, K);
                       Amount = (G * trading_fee) - Amount;
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else {
                       console.log("bad error");
                       return(0);
                   };
               };
            console.log("bad error");
            return(0);
        };
        console.log("process path bad error");
        console.log(type);
        return(0);
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
    function contract_to_cid(Contract) {
        var Source = Contract[8];
        var SourceType = Contract[9];
        var MT = Contract[2];
        var CH = Contract[1];
        var cid = merkle.contract_id_maker(CH, MT, Source, SourceType);
        return(cid);
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
            total += L[i];
        };
        for(var i = 0; i<L.length; i++){
            L[0] = L[0] / i;
        };
        return(L);
    };
    function make_tx(guess, amount, Paths, db, db2, markets, callback) {
        console.log("make tx guess is ");
        console.log(JSON.stringify(guess));
        //remove paths where the guess is less than a tx fee.
        //guess = normalize(guess);
        var maxGuess = 0;
        var tx_price;
        for(var i = 0; i<guess.length; i++){
            maxGuess = Math.max(maxGuess, guess[i]);
        };
        //console.log(maxGuess);
        for(var i = 0; i<guess.length; i++){
            var db3 = JSON.parse(JSON.stringify(db2));
            var x = process_path(1, Paths[i], 1, db3);
            //console.log(x[1]);
            if(guess[i] == maxGuess){
                //console.log("max");
                tx_price = x[1];
            };
        };
        //tx_price = median(tx_prices);
//        console.log(tx_price);
        var currencies = {};
        var first_cid = Paths[0][0][0];
        var first_type = Paths[0][0][1];
        currencies_add(first_cid, first_type, amount, currencies);
        console.log(JSON.stringify(Paths));
        console.log(JSON.stringify(currencies));
        console.log(JSON.stringify(db));
        console.log(JSON.stringify(db2));
        var txs = [];
        var mids = [];
        for(var i = 0; i<guess.length; i++){
            if(guess[i] > 10){
                var p = Paths[i];
                mids = mids.concat(path2mids(p));
            };
        };
        mids = remove_repeats(mids);
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
        console.log(JSON.stringify(currencies));
        var potential_use_contracts = [];
        for(var i = 0; i<Accs.length; i++){
            var Acc = currencies[Accs[i]];
            //if(Acc < 0){
                if(!(Accs[i] == [ZERO,0])){
                    potential_use_contracts =
                        potential_use_contracts.concat([[Accs[i], Acc]]);
                };
            //};
        };
        var max_contract_needs = {};// cid -> amount
        for(var i = 0; i<potential_use_contracts.length; i++){
            var puc = potential_use_contracts[i];
            var id = puc[0];
            var id = id.slice(0, id.search(","));
            var spend_currency = Paths[0][0];
            //console.log(spend_currency);
            //console.log((spend_currency).toString());
            //console.log(puc);
            //console.log(puc[0]);
            //var x = 0;
            //if ((spend_currency).toString() ===
            //    puc[0]) {
                //x = amount; 
            //};
            if(!(max_contract_needs[id])){
                max_contract_needs[id] = puc[1];//+x;
            } else {
                max_contract_needs[id] =
                    Math.min(puc[1],//+x,
                             max_contract_needs[id]);
            }
        };
        console.log(JSON.stringify(max_contract_needs));
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
        return(callback(txs, markets));
        //return(make_tx2(txs, Paths[0][0], Paths[0][Paths[0].length - 1]));
    };
    function make_tx2(txs, markets, spend_currency, gain_currency) {
        //look up oracle text
        multi_tx.make(txs, function(tx){
            //var maximized = read_max(currencies, apply(T, M), cid2, type2);
            //var price = amount234/maximized;
            //var loss = calculate_loss(amount, Paths[0][0], txs);
            var loss = calculate_loss(spend_currency, txs, markets) - calculate_gain(spend_currency, txs, markets);
            var gain = calculate_gain(gain_currency, txs, markets) - calculate_loss(gain_currency, txs, markets);
            var tx_price = loss/gain;
            rpc.post(["read", 3, gain_currency[0]], function(oracle_text) {
                rpc.post(["contracts", gain_currency[0]], function(Contract){
                    var Source = [Contract[8], Contract[9]];
                    var to_display = "you can sell "
                //.concat((amount / token_units()).toString())
                        .concat((loss / token_units()).toString())
                        .concat(" at a price of ")
                        .concat(1/tx_price)
                        .concat(". in total you receive ")
                        .concat((gain / token_units()).toString())
                        .concat("");

                    if(oracle_text && (!(oracle_text == 0))) {
                        var text = atob(oracle_text[1]);
                        var ticker_bool =
                            tabs.is_ticker_format(text);
                        if(ticker_bool){
                            var Limit = tabs.coll_limit(text);
                            var ticker = tabs.symbol(text);
                            var mid1 = new_market.mid(Source[0], gain_currency[0], 0, 1);
                            var mid2 = new_market.mid(Source[0], gain_currency[0], 0, 2);
                            var mid3 = new_market.mid(gain_currency[0], gain_currency[0], 1, 2);
                            var market1 = get_market(mid1, markets);
                            var market2 = get_market(mid2, markets);
                            var market3 = get_market(mid3, markets);
                            var P = price_estimate(market1, market2, market3);//value of a stablecoin in veo. between 0 and 1, 1 means the margin is used up.
                            if(gain_currency[1] === 2){
                                P = 1-P;
                            };
                            
                            //console.log([P, Limit, W_total]);
                            //console.log(P*Limit);
                            //var price = loss / Limit / gain;
                            //var price_a = 1/price;
                            console.log(JSON.stringify([gain, loss, Limit, P]));
                            var price = gain / Limit / loss;
                            //var price_a = Limit * loss / gain;
                            var price_a = Limit * gain / loss;
                            var price_b = Limit / P;
                            if(gain_currency[1] === 2){
                                price_a = gain/loss;
                                price_b = 1/P;
                                gain_ticker_direction = " iv";
                            };
                            //var price_b = Limit * P;
                            console.log(JSON.stringify([price_a, price_b, Limit, P]));
                            var slippage = (Math.abs(price_a - price_b))/price_b;
                            //console.log(JSON.stringify([P1, P2, P3]));
                            //console.log(JSON.stringify([price_a, price_b, slippage]));
                            var trading_fees = 0;
                            for(var i = 0; i<txs.length; i++){
                                if(txs[i][0] == "market_swap_tx"){
                                    trading_fees += txs[i][5] * 0.002;//hard coded governance fee
                                }
                            };
                            
                            var total_fees =
                                tx[3]//mining fee
                                + (slippage * loss)//slippage loss
                                + trading_fees;
                            //console.log(total_fees);
                            var gain_ticker_direction = " v";
                            //console.log(gain_currency);
                            var to_receive = 
                                (Limit * gain / token_units()).toFixed(8).toString();
                            if(gain_currency[1] === 2){
                                to_receive = (gain / token_units()).toFixed(8).toString();
                                price_a = (Limit/(1 - (price_a / Limit)));
                                price_b = Limit / (1 - P);
                                slippage = (Math.abs(price_a - price_b))/price_b;
                            };
                            var show_price =
                                (price_a).toFixed(8).toString()
                                .concat(gain_ticker_direction)
                                .concat(ticker)
                                .concat(" per X");
                            
                            to_display = "you can sell "
                                .concat((loss / token_units()).toString())
                                .concat(" X<br> price is ")
                                .concat(show_price)
                            //.concat((1/price).toFixed(8).toString())
                            /*
                                .concat((price_a).toFixed(8).toString())
                                .concat(" v")
                                .concat(ticker)
                                .concat(" per X")
                            */
                                .concat("<br> slippage is ")
                            //.concat(((1/price)-(P*Limit)).toFixed(8).toString())
                                .concat((slippage * 100).toFixed(3).toString())
                                .concat("% <br> you receive ")
                            //.concat((Limit * gain / token_units()).toFixed(8).toString())
                                .concat(to_receive)
                                .concat(gain_ticker_direction)
                                //.concat(" v")
                                .concat(ticker)
                                .concat("<br>veo fees: ")
                                .concat(((trading_fees + tx[3])/token_units()).toFixed(8).toString())
//                                .concat("<br>portion fee: ")
//                                .concat((slippage*100).toFixed(2).toString())
//                                .concat("%")
                                .concat("");
                        };
                    };
                    display.innerHTML = to_display;
                    console.log(JSON.stringify(tx));
                    //return(0);
                    var stx = keys.sign(tx);
                    publish_tx_button.onclick = function(){
                        post_txs([stx], function(msg){
                            display.innerHTML = msg;
                            keys.update_balance();
                        });
                    };
                });
            }, get_ip(), 8090);
        });
    };
    function price_estimate(market1, market2, market3) {
        var K1 = market1[4] * market1[7];
        var K2 = market2[4] * market2[7];
        var K3 = market3[4] * market3[7];
        var P1 = market1[4] / market1[7];
        var P2 = 1 - (market2[4]/market2[7]);
        //R = (1-P)/P
        //PR = 1-P
        //P(R+1) = 1
        //P = 1/(R+1)
        var P3 = 1/(1 + (market3[4]/market3[7]));
        var W1 = Math.sqrt(K1);
        var W2 = Math.sqrt(K2);
        var W3 = Math.sqrt(K3);
        var Ps = [P1, P2, P3];
        console.log([market1[4], market1[7]]);
        console.log(Ps);
        var Ws = [W1, W2, W3];
        console.log(Ws);
        var W_total = 0;
        var P = 0;
        for(var i = 0; i<Ps.length; i++) {
            if(!(Number.isNaN(Ps[i]))){
                P += Ps[i]*Ws[i];
                W_total += Ws[i];
            };
        };
        P = P / W_total;
        console.log(P);
        return(P);
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
        rpc.post(["markets", MIDS[0]], function(Market){
            get_markets(MIDS.slice(1),
                        Markets.concat([Market]),
                        callback);
        });
    };
    function get_contracts(CIDS, Contracts, callback){
        if(CIDS.length<1) {
            return(callback(Contracts));
        };
        rpc.post(["contracts", CIDS[0]], function(Contract){
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
        console.log(JSON.stringify([start_c, end_c]));
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
    function test(){
        var Paths = [[["G8dXI4RVHv75cOtLXX+fOZwfFMmPaZwjnnNj9LZz4l4=",1],[["contract","y3VnWqg/NKB2OThyueZDhqYwmBMUcDhjBBNaJ2Upk2Y=",2,0,0,0,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",322517842],["market","ecbQ7aj9+60TuBJqEIFUftHXQOkVfz0JkSYZXrt4ylk=","G8dXI4RVHv75cOtLXX+fOZwfFMmPaZwjnnNj9LZz4l4=",1,169579958,"G8dXI4RVHv75cOtLXX+fOZwfFMmPaZwjnnNj9LZz4l4=",2,59331334,99999000]],["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0]]];
        var db = build_paths_db(Paths, {});
        var gradient = get_gradient(Paths, db);
        var L = Paths.length;
        var amount = 100000000;
        var a = amount / L;
        var guess = array_of(a, L);
        var db2 = make_trades(guess, Paths, db)[0];
        console.log(JSON.stringify(db));
        console.log(JSON.stringify(db2));
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
        var gradient0 = get_gradient(Paths, db);
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
        var gradient1 = get_gradient(Paths, db2);
        var average = average_fun(gradient1, guess);
        var nextGuess = improve_guess(average, guess, gradient1, amount);
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
        cid: function(x){ contract_id.value = x },
        type: function(x){ contract_type.value = x },
        txs_maker: txs_maker,
        contract_to_cid: contract_to_cid,
        calculate_gain: calculate_gain,
        calculate_loss: calculate_loss,
        get_market: get_market,
        test: test
    });
};
