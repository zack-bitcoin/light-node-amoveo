var uniswap = (function(){
    var div = document.getElementById("main");
    var display = document.createElement("div");
    var balances = document.createElement("div");
    var current_tab = document.createElement("div");
    var swap_tab = document.createElement("div");
    var pool_tab = document.createElement("div");
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var trading_fee = 0.9979995;
    var slippage = 1;

    function swap_mode_f() {
        current_tab.innerHTML = "";
        current_tab.appendChild(swap_tab);
    };
    function pool_mode_f() {
        current_tab.innerHTML = "";
        current_tab.appendChild(pool_tab);
    };
    var swap_mode = button_maker2("swap mode", swap_mode_f);
    var pool_mode = button_maker2("pool mode", pool_mode_f);
    pool_tab.appendChild(swap_mode);
    swap_tab.appendChild(pool_mode);
    
    var contracts_div = document.createElement("div");
    display_contracts(contracts_div);
    var markets_div = document.createElement("div");
    display_markets(markets_div);

    swap_tab.appendChild(contracts_div);
    pool_tab.appendChild(markets_div);

    var swap_title = document.createElement("h3");
    swap_title.innerHTML = "Swap Currencies";
    swap_tab.appendChild(swap_title);
    var sub_accs = [];
    var liquidity_shares = [];
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "which currency to sell: ";
    swap_tab.appendChild(selector_label);
    function load() {
        setTimeout(function(){
            rpc.post(["account", keys.pub()], function(response){
                if(response == "error") {
                    display.innerHTML = "<h1>load a key with funds.</h1>";
                    current_tab.innerHTML = "";
                } else {
                    //console.log(JSON.stringify(response[1]));
                    sub_accs = response[1][3].slice(1);
                    //console.log(sub_accs);
                    liquidity_shares = response[1][4].slice(1);
                    display.innerHTML = "";
                    swap_mode_f();
                    selector.innerHTML = "";
                    //market_selector.innerHTML = "";
                    //TODO figure out which subcurrencies we own in each contract. each subcurrency goes into the selector seperately.
                    contracts_to_subs(sub_accs, [], function(sub_accs2){
                        load_balances(sub_accs2, liquidity_shares, "<h4>your balances in each subcurrency</h4>");
                        sub_accs2 = sub_accs2.map(function(x) {
                            return(JSON.stringify(x));
                        });
                        liquidity_shares = liquidity_shares.map(function(x){return(JSON.stringify([x, 0]));});
                        load_options(selector, ["veo"]
                                     .concat(sub_accs2)
                                     .concat(liquidity_shares));
//                        load_options(market_selector,
//                                     liquidity_shares);
                    });

                };
            }, get_ip(), 8091);
        }, 0);
    };


    var selector = document.createElement("select");
    swap_tab.appendChild(selector);
    swap_tab.appendChild(br());
    var amount_input = text_input("amount to sell: ", swap_tab);
    swap_tab.appendChild(br());
    var contract_id = text_input("contract id to be paid in (leave blank for veo): ", swap_tab);
    swap_tab.appendChild(br());
    //    var contract_type = text_input("contract type to be paid in (leave blank for veo): ", swap_tab);
    var contract_type = document.createElement("select");
    var type_label = document.createElement("span");
    type_label.innerHTML = "you win if the outcome is: ";
    var true_option = document.createElement("option");
    true_option.innerHTML = "true";
    true_option.value = 1;
    var false_option = document.createElement("option");
    false_option.innerHTML = "false";
    false_option.value = 2;
    contract_type.appendChild(true_option);
    contract_type.appendChild(false_option);
    swap_tab.appendChild(type_label);
    swap_tab.appendChild(contract_type);
    swap_tab.appendChild(br());
    var swap_price_button =
        button_maker2("lookup price", swap_price);
    var publish_tx_button =
        button_maker2("publish the trade",
                      function(){
                          display.innerHTML = "lookup the price first";
                          return(0);});
    swap_tab.appendChild(swap_price_button);
    swap_tab.appendChild(publish_tx_button);

    function load_balances2(ls, s){
        if(ls.length < 1){
            balances.innerHTML = s;
            return(0);
        } else {
            var mid = ls[0];
            
            var sk = sub_accounts.key(keys.pub(), ls[0], 0);
            var sk = btoa(array_to_string(sk));
            rpc.post(["sub_accounts", sk], function(sa) {
//                rpc.post(["markets", mid], function(market) {
                var balance = 0;
                if(!(sa == "empty")){
                    balance = sa[1];
                };
                if(balance > 1){
                    s = s
                        .concat("market: ")
                        .concat(mid)
/*                        .concat(" cid1: ")
                        .concat(market[2])
                        .concat(" type1: ")
                        .concat(market[3])
                        .concat(" amount1: ")
                        .concat((market[4] / token_units()).toString())
                        .concat(" cid2: ")
                        .concat(market[5])
                        .concat(" type2: ")
                        .concat(market[6])
                        .concat(" amount2: ")
                        .concat((market[7] / token_units()).toString())
*/
                        //.concat(" price: ")
                        //.concat((market[4]/market[7]).toString())
//                        .concat(" shares: ")
//                        .concat((market[8] / token_units()).toString())
                        .concat(" balance: ")
                        .concat((balance / token_units()).toString())
                        .concat("<br><br>");
                }
                return(load_balances2(ls.slice(1), s));
//                });
            });
        };
    };
    function load_balances(accs, ls, s) {
        if(accs.length < 1){
            return load_balances2(ls, s);
        };
        var acc = accs[0];
        var sk = sub_accounts.key(keys.pub(), acc[0], acc[1]);
        var sk = btoa(array_to_string(sk));
        rpc.post(["sub_accounts", sk], function(sa){
            var balance = 0;
            if(!(sa == "empty")){
                balance = sa[1];
            };
            if(balances > 1){
                s = s
                    .concat("contract: ")
                    .concat(accs[0][0])
                    .concat(" type: ")
                    .concat(accs[0][1])
                    .concat(" balance: ")
                    .concat((balance / token_units()).toString)
                    .concat("<br>");
            }
            return(load_balances(accs.slice(1),
                                 ls, s));
        });
    };
    function liquidity_trade() {
        //TODO copy code from subcurrency set buy
        var C1 = market_selector.value;
        var C1 = JSON.parse(C1);
        var mid = C1[0];
        //var source = contract[8];
        //var source_type = contract[9];
        //var many_types = contract[2];
        var mav = Math.round(parseFloat(market_amount.value) * token_units());
        rpc.post(["markets", mid], function(Market){
            var CID1 = Market[2];
            var Type1 = Market[3];
            var CID2 = Market[5];
            var Type2 = Market[6];
            var tx = ["market_liquidity_tx",
                      0,0,0,
                      mid, mav,
                      CID1, Type1, CID2, Type2];
            var txs = [tx];
            multi_tx.make(txs, function(tx){
                console.log(JSON.stringify(tx));
                var stx = keys.sign(tx);
                post_txs([stx], function(msg){
                    display.innerHTML = msg;
                });
            });
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
        var A = Math.round(parseFloat(amount_input.value) * token_units());
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
                               CID2, Type2));
            }, get_ip(), 8091);
        });
    };
    function swap_price2(
        marketids, cids, amount234,
        cid1, type1, cid2, type2)
    {
        return(get_contracts(cids, [], function(contracts){
            return(get_markets(marketids, [], function(markets) {
                var Paths = all_paths([[[cid1, type1]]], cid2, type2, contracts, markets, 5);
                var Paths2 = end_goal(cid2, type2, Paths);
                return(swap_price3(Paths2, amount234));
            }));
        }));
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
    function swap_price3(Paths, amount33) {
        //we need to find the optimal way to spend amount on the different paths to get the best price.
        //an initial guess we can keep improving.
        var L = Paths.length;
        if(L == 0){
            display.innerHTML = "error. there is no way to transform the input currency into the output currency.";
        };
        var db = build_paths_db(Paths, {});
        if(L == 1){
            var guess = [amount33];
            var db2 = make_trades(guess, Paths, JSON.parse(JSON.stringify(db)));
            return(make_tx(guess, amount33, Paths, db, db2));
        }
        var a = amount33 / L;

        var guess = array_of(a, L);
        console.log("swap price 3");
        console.log(guess);
        return(swap_price_loop(Paths, amount33, guess, db, 30));
    }
    function swap_price_loop(Paths, amount, guess, db, N) {
        if(N < 1) {
            var db2 = make_trades(guess, Paths, JSON.parse(JSON.stringify(db)));
            var gradient = get_gradient(Paths, db2);
            return(make_tx(guess, amount, Paths, db, db2));
        };
        //make a database of the markets and contracts that can be updated with trades.

        //update the database based on our current guess of the distribution.
        var db2 = make_trades(guess, Paths, JSON.parse(JSON.stringify(db)));
        //calculate the final price on every path to buy a bit more. this is the gradient vector.
        var gradient = get_gradient(Paths, db2);
        var average = average_fun(gradient, guess);
        if(good_enough(gradient, guess, average)){
            console.log("done!");
            return(make_tx(guess, amount, Paths, db, db2));
        } else {
            var nextGuess = improve_guess(average, guess, gradient, amount);
            return(swap_price_loop(Paths, amount, nextGuess, db, N-1));
        };
        //for the paths that are more expensive than average, buy less in the next iteration. for the paths that are less expensive, buy more in the next iteration.
    };
    function improve_guess(average, guess, grad, amount){
        var r = [];
        for(var i = 0; i<guess.length; i++){
            var n = guess[i] - 0.9*guess[i]*((grad[i]-average)/average);
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
        };
        var average = total / guess_total;
        return(average);
    };
    function good_enough(grad, guess, average) {
        for(var i = 0; i<grad.length; i++){
            var p = Math.abs(grad[i] - average) / average;
            if((!(guess[i] == 0)) && (p > 0.001)){
                return(false);
            };
        };
        return(true);
    };
    function get_gradient(Paths, db) {
        var r = [];
        for(var i = 0; i<Paths.length; i++){
            var x = process_path(1, Paths[i], 1, db);
            r = r.concat([x[1]]);
        };
        return(r);
    };
    function make_trades(guess, paths, db) {
        for(var i = 0; i<guess.length; i++){
            var x = process_path(guess[i], paths[i], 1, db);
            db = x[0];
        };
        return(db);
    };
    function process_path(Amount, path, price, db){
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
                m[4] = m[4] + Amount;
                var old = m[7];
                m[7] = K/m[4];
                Amount = (old - m[7]) * trading_fee;
                db[mid] = m;
                return(process_path(Amount, path, price*StartAmount/Amount, db));
            } else if ((m[5] == currency[0]) &&
                       (m[6] == currency[1])){
                m[7] = m[7] + Amount;
                var old = m[4];
                m[4] = K/m[7];
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
            var K = m[4] * m[7];
            var start_currency = path[0];
            var end_currency = path[2];
            path = path.slice(2);

            if((start_currency[0] == source) &&
               (start_currency[1] == source_type))
               {
                   if((mcid1 == source) && (mtype1 == source_type)) {
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
                       Amount = Amount + (G * trading_fee);
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else if((mcid2 == source) && (mtype2 == source_type)){
                       var a = 1;
                       var b = m[7] + Amount - m[4];
                       var c = -Amount * m[4];
                       var G0 = Math.sqrt(b*b - (4*a*c));
                       var G1 = (-b + G0)/ 2;
                       var G2 = (-b - G0)/ 2;
                       var G = Math.max(G1, G2);
                       m[4] = m[4] - G;
                       m[7] = m[7] + Amount + G;
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
                           Amount = Amount + (gain * trading_fee);
                           return(process_path(Amount, path, price*StartAmount/Amount, db));
                       } else if ((end_currency[0] == mcid2) &&
                                  (end_currency[1] == mtype2)){
                           m[4] = m[4] + Amount;
                           var old = m[7];
                           m[7] = K / m[4];
                           var gain = old - m[7];
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
                       m[4] = m[4] + Amount;
                       var old = m[7];
                       m[7] = K/m[4];
                       var G = old - m[7];
                       Amount = (G * trading_fee) - Amount;
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else if((mcid2 == source)&&(mtype2 == source_type)){
                       m[7] = m[7] + Amount;
                       var old = m[4];
                       m[4] = K/m[7];
                       var G = old - m[4];
                       Amount = (G * trading_fee) - Amount;
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                       
                   } else if((mcid1 == start_currency[0]) &&
                             (mtype1 == start_currency[1])) {
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
                       Amount = (gain * trading_fee);
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                           
                   } else if ((mcid2 == start_currency[0]) &&
                              (mtype2 == start_currency[1])) {
                           //buying m[5], source.
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
                       //K = -G^2 + G*(A1 - A2 + Amount) + A2(A1+Amount)
                       //0 = G^2 + G*(A2 - A1 -Amount) + (K - K - A2*Amount)
                       //0 = G^2 + G*(A2 - A1 -Amount) + (- A2*Amount)
                       var a = 1;
                       var b = (m[7]-m[4]-Amount);
                       var c = -m[4]*Amount;
                       var G0 = Math.sqrt(b*b - (4*a*c));
                       var G1 = (-b + G0)/ 2;
                       var G2 = (-b - G0)/ 2;
                       var G = Math.max(G1, G2);
                       m[4] = m[4] + Amount + G;
                       m[7] = m[7] - G;
                       Amount = (G * trading_fee);
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else if ((mcid2 == start_currency[0]) &&
                              (mtype2 == start_currency[1])){
                       var a = 1;
                       var b = (m[4]-m[7]-Amount);
                       var c = -m[7]*Amount;
                       var G0 = Math.sqrt(b*b - (4*a*c));
                       var G1 = (-b + G0)/ 2;
                       var G2 = (-b - G0)/ 2;
                       var G = Math.max(G1, G2);
                       m[7] = m[7] + Amount + G;
                       m[4] = m[4] - G;
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
                       Amount = (G * trading_fee) - Amount;
                       db[mid] = m;
                       return(process_path(Amount, path, price*StartAmount/Amount, db));
                   } else if ((mcid2 == end_currency[0])&&
                              (mtype2 == end_currency[1])){
                       m[7] = m[7] + Amount;
                       var old = m[4];
                       m[4] = K/m[7];
                       var G = old - m[4];
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
        return(all_paths(Paths5, cid2, type2, contracts, markets, Steps-1));
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
    function make_tx(guess, amount, Paths, db, db2) {
        //remove paths where the guess is less than a tx fee.
        var maxGuess = 0;
        var price;
        for(var i = 0; i<guess.length; i++){
            maxGuess = Math.max(maxGuess, guess[i]);
        };
        for(var i = 0; i<guess.length; i++){
            if(guess[i] == maxGuess){
                var x = process_path(1, Paths[i], 1, db2);
                price = x[1];
            };
        };
        if(!(price)){
            console.log(JSON.stringify(Paths));
            console.log(JSON.stringify(maxGuess));
            console.log("price is not defined");
            return(0);
        };
        var currencies = {};
        var first_cid = Paths[0][0][0];
        var first_type = Paths[0][0][1];
        currencies_add(first_cid, first_type, amount, currencies);
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
            if(m1[7]<m2[7]){
                //var amount = m2[4] - m1[4];
                tx[5] = Math.round(m2[7] - m1[7]);
                currencies_add(m1[5], m1[6], -tx[5], currencies);
                tx[6] = Math.round((m1[4] - m2[4])*trading_fee*slippage);
                currencies_add(m1[2], m1[3], tx[6], currencies);
                tx[7] = 2;//direction
            } else if (m1[4] < m2[4]){
                //var amount = m2[7] - m1[7];
                tx[5] = Math.round(m2[4] - m1[4]);
                currencies_add(m1[2], m1[3], -tx[5], currencies);
                tx[6] = Math.round((m1[7] - m2[7])*trading_fee*slippage);
                currencies_add(m1[5], m1[6], tx[6], currencies);
                tx[7] = 1;
                //direction should be 1
            } else {
                console.log("failure");
                return(0);
            };
            txs = txs.concat([tx]);
        };
        //if any subcurrency balances are negative, buy enough complete sets to make it positive.
        var Accs = Object.keys(currencies);
        var potential_use_contracts = [];
        for(var i = 0; i<Accs.length; i++){
            var Acc = currencies[Accs[i]];
            if(Acc < 0){
                if(!(Accs[i] == [ZERO,0])){
                    potential_use_contracts =
                        potential_use_contracts.concat([[Accs[i], Acc]]);
                };
            };
        };
        var max_contract_needs = {};// cid -> amount
        for(var i = 0; i<potential_use_contracts.length; i++){
            var puc = potential_use_contracts[i];
            var id = puc[0];
            var id = id.slice(0, id.search(","));
            if(!(max_contract_needs[id])){
                max_contract_needs[id] = puc[1];
            } else {
                max_contract_needs[id] =
                    Math.max(puc[1],
                             max_contract_needs[id]);
            }
        };
        var to_buy = Object.keys(max_contract_needs);
        for(var i = 0; i<to_buy.length; i++){
            var cid = to_buy[i];
            var c = db[cid];
            var source = c[8];
            var source_type = c[9];
            var tx = ["contract_use_tx", 0, 0, 0,
                      cid,
                      -max_contract_needs[cid],
                      2,
                      source, source_type];
            txs = txs.concat([tx]);
        };
        multi_tx.make(txs, function(tx){
            display.innerHTML = "you can sell "
                .concat(amount)
                .concat(" at a price of ")
                .concat(price)
                .concat(". in total you receive ")
                .concat(Math.round(amount / price));
            console.log(JSON.stringify(tx));
            var stx = keys.sign(tx);
            publish_tx_button.onclick = function(){
                post_txs([stx], function(msg){
                    display.innerHTML = msg;
                });
            };
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

    var pool_title = document.createElement("h3");
    pool_title.innerHTML = "Buy/Sell Liquidity Pool Shares";
    pool_tab.appendChild(pool_title);
    //todo, create a dropdown menu of the markets you own liquidity shares in. Also make a button to look up other markets.
    var market_selector = document.createElement("select");
    var market_selector_label = document.createElement("span");
    market_selector_label.innerHTML = "which market: ";
    pool_tab.appendChild(market_selector_label);
    pool_tab.appendChild(market_selector);
    pool_tab.appendChild(br());
    var market_amount = text_input("amount of liquidity to give/take: ", pool_tab);
    pool_tab.appendChild(br());
    var market_trade_button =
        button_maker2("buy/sell liquidity", liquidity_trade);
    pool_tab.appendChild(market_trade_button);
    pool_tab.appendChild(br());
    //todo, once a market is selected, display your current balance, and the price for buying/selling right now.
    // possibly use a market swap, and/or a contract_use_tx in a flash loan to get the currency you need to participate in the pool.
    //have a field to type the amount to buy, a button for 'buy more liquidity shares', and a button for 'sell your liquidity shares'.


    div.appendChild(br());
    div.appendChild(balances);
    div.appendChild(current_tab);
    div.appendChild(display);

    keys.update_balance_callback(load);

    function load_options(selector, L) {
        if(L.length < 1) {
            return(0);
        };
        var option = document.createElement("option");
        option.innerHTML = L[0];
        option.value = L[0];
        selector.appendChild(option);
        var L2 = L.slice(1);
        load_options(selector, L2);
    };
    function contracts_to_subs(contracts, R, callback) {
        if(contracts.length < 1){
            return(callback(R));
        };
        //merkle.request_proof("contracts", contracts[0], function(c) {
        rpc.post(["contracts", contracts[0]], function(c) {
            many_types = c[2];
            contracts_to_subs2(contracts[0], 1, many_types, [], function(subs){
                return(contracts_to_subs(
                    contracts.slice(1),
                    R.concat(subs),
                    callback));
            });
        });
    };
    function contracts_to_subs2(CID, N, L, R, callback) {
        if(N>L){
            return(callback(R));
        };
        var key = sub_accounts.key(keys.pub(), CID, N);
        var key = btoa(array_to_string(key));
        //merkle.request_proof("sub_accounts", key, function(x) {
        rpc.post(["sub_accounts", key], function(x) {
            if(x == "empty") {
                return(contracts_to_subs2(CID, N+1, L, R, callback));
            } else {
                return(contracts_to_subs2(CID, N+1, L, R.concat([[CID, N]]), callback));

            };
        });
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
    function display_contracts(div) {
        rpc.post(["contracts"], function(contracts){
            var s = "<h4>existing contracts</h4>";
            return(display_contracts2(div, contracts.slice(1), s));
        }, get_ip(), 8091);//8091 is explorer
    };
    function display_contracts2(div, contracts, s) {
        console.log(JSON.stringify(contracts));
        if(contracts.length < 1) {
            console.log(s);
            div.innerHTML = s;
            return(0);
        }
        //var cid = contracts[0][1];
        cid = contract_to_cid(contracts[0]); 
        rpc.post(["read", 3, cid], function(oracle_text) {
            console.log(contracts[0]);
            console.log(cid);
            if(!(oracle_text == 0)) {
                var type = oracle_text[0];
                var text = atob(oracle_text[1]);
                console.log(text);
                console.log(JSON.stringify(oracle_text));
                s = s
//                    .concat("id: ")
//                    .concat(cid)
                    .concat("oracle question: \"")
                    .concat(text)
                    .concat("\"; ")
                    .concat(type)
                    .concat("; volume: ")
                    .concat((contracts[0][11] / token_units()).toString())
                    .concat("<button onclick=\"uniswap.cid('")
                    .concat(cid)
                    .concat("'); uniswap.type(1);\"> buying true</button>")
                    .concat("<button onclick=\"uniswap.cid('")
                    .concat(cid)
                    .concat("'); uniswap.type(2);\"> buying false</button>")
                    .concat("<br>")
                    .concat("");
            };
            display_contracts2(div, contracts.slice(1), s);
        }, get_ip(), 8090);

    };
    function display_contracts_old(div) {
        rpc.post(["contracts"], function(contracts){
            var s = "";
            for(var i = 1; i<contracts.length; i++){
                var cid = contracts[i][1];
                rpc.post(["read", 3, cid], function(oracle_text) {
                    console.log(cid);
                    console.log(oracle_text);
                }, get_ip(), 8090)
                s = s
                    .concat("contract: ")
                    .concat(cid)
                    .concat(" flavors ")
                    .concat(contracts[i][2])
                    .concat(" volume ")
                    .concat(contracts[i][11])
            };
            console.log(JSON.stringify(contracts));
            }, get_ip(), 8091);
    };
    function markets_consensus_state(L, R, callback){
        if(L.length < 1) {
            return(callback(R));
        } else {
            var mid = L[0][1];
            console.log(mid);
            rpc.post(["markets", mid], function(market){
                return(markets_consensus_state(
                    L.slice(1),
                    R.concat([market]),
                    callback));
            });
        };
    };
    function display_markets(div) {
        rpc.post(["markets"], function(markets){
            var s = "<h4>existing markets</h4>";
            markets = markets.slice(1);
            var m2 = markets.map(function(m) {return(JSON.stringify([m[1], 0]));});
            console.log(m2);
            market_selector.innerHTML = "";
            load_options(market_selector, m2);
            markets_consensus_state(
                markets,
                [],
                function(markets2){
                    return(display_markets2(div, markets, markets2, s));
                });
            }, get_ip(), 8091);
    };
    function display_markets2(div, markets, markets2, s){
        if(markets.length < 1) {
            console.log(s);
            div.innerHTML = s;
            return(0);
        };
        //-record(market, {mid, height, volume = 0, txs = [], cid1, type1, cid2, type2, amount1, amount2}).
        var market = markets[0];
        var market2 = markets2[0];
        var mid = market[1];
        console.log(JSON.stringify(market));
        var cid1 = market[5];
        var type1 = market[6];
        var cid2 = market[7];
        var type2 = market[8];
        var amount1 = market2[4] / token_units();
        var amount2 = market2[7] / token_units();
        if(type1 == 1){
            type1 = "true";
        } else if(type1 == 2){
            type1 = "false";
        }
        if(type2 == 1){
            type2 = "true";
        } else if(type2 == 2){
            type2 = "false";
        }
        rpc.post(["read", 3, cid1], function(oracle_text1) {
            rpc.post(["read", 3, cid2], function(oracle_text2) {
                console.log([oracle_text1, oracle_text2]);
                var include = true;
                var text1, text2;
                if(!oracle_text1){
                    include = false;
                } else {
                    text1 = ("oracle question: ")
                        .concat(atob(oracle_text1[1]));
                };
                if(!oracle_text2){
                    include = false;
                } else {
                    text2 = ("oracle question: ")
                        .concat(atob(oracle_text2[1]));
                }
                if(include){
                s = s
                    .concat("Currency 1. ")
                    //.concat("oracle question: ")
                    .concat(text1)
                    .concat(". It wins if result is: ")
                    .concat(type1)
//                    .concat(". amount in market: ")
//                    .concat(amount1)
                    .concat(".<br> Currency 2. ")// oracle question: ")
                    .concat(text2)
                    .concat(". It wins if result is: ")
                    .concat(type2)
                    .concat("<br> amounts: ")
                    .concat((amount1).toString())
                    .concat(" ")
                    .concat((amount2).toString())
                    .concat(" price: ")
                    .concat((amount1/amount2).toString())
                    .concat("<br><button onclick=\"uniswap.market('")
                    .concat(mid)
                    .concat("')\">buy/sell liquidity in this market</button>")
                    .concat("<br><br>")
                        .concat("");
                }
                display_markets2(
                    div,
                    markets.slice(1),
                    markets2.slice(1),
                    s);
            }, get_ip(), 8090);
        }, get_ip(), 8090);
    };
    function helper(){
        contract_id.value = "1qSyvrk/L3uBxN6uSsaX3oVypSzLpL260/CJl6e4Dq8=";//"95bMsSPuGa2s3M6gADqmbdBjuCVTIYc2Nf6KMw4xl48=";
        amount_input.value = "2";
        contract_type.value = "1";
    // uniswap.cid("1qSyvrk/L3uBxN6uSsaX3oVypSzLpL260/CJl6e4Dq8="),
    };
    //helper();
    return({load: load,
            cid: function(x){ contract_id.value = x },
            type: function(x){ contract_type.value = x },
            market: function(x){ market_selector.value = JSON.stringify([x, 0]) },
            helper: helper
            //button: next_button
           });
     
    })();
