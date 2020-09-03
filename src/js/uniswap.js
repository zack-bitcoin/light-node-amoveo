var uniswap = (function(){
    var div = document.getElementById("main");
    var display = document.createElement("div");
    var current_tab = document.createElement("div");
    var swap_tab = document.createElement("div");
    var pool_tab = document.createElement("div");
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));

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

    var swap_title = document.createElement("h3");
    swap_title.innerHTML = "Swap Currencies";
    swap_tab.appendChild(swap_title);
    var sub_accs = [];
    var liquidity_shares = [];
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "which currency to lose ";
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
                    //TODO figure out which subcurrencies we own in each contract. each subcurrency goes into the selector seperately.
                    contracts_to_subs(sub_accs, [], function(sub_accs2){
                        //console.log(sub_accs2);
                        sub_accs2 = sub_accs2.map(function(x) {
                            return(JSON.stringify(x));
                        });
                        load_options(selector, ["veo"]
                                     .concat(sub_accs2)
                                     .concat(liquidity_shares));
                    });

                };
            }, get_ip(), 8091);
        }, 0);
    };


    var selector = document.createElement("select");
    //console.log(sub_accs);
    //console.log(liquidity_shares);
/*    load_options(selector, ["veo"]
                 .concat(sub_accs)
                 .concat(liquidity_shares));
*/
    swap_tab.appendChild(selector);
    swap_tab.appendChild(br());
    var amount = text_input("amount to sell: ", swap_tab);
    swap_tab.appendChild(br());
    var contract_id = text_input("contract id to be paid in (leave blank for veo): ", swap_tab);
    swap_tab.appendChild(br());
    var contract_type = text_input("contract type to be paid in (leave blank for veo): ", swap_tab);
    swap_tab.appendChild(br());
    var swap_price_button =
        button_maker2("lookup price", swap_price);
    swap_tab.appendChild(swap_price_button);

    //trying to calculate the optimal path.
    // constant factor markets.

    //buying P of type 1.
    //[m1, m2] -> [m1 + P, m2m1/(m1+P))]

    //original price m1/m2
    //final price ((m1+P)^2)/(m1*m2)
    
    //if there are 2 markets in parallel, we want their final prices to be equal.
    //how much should we buy in each market?
    // (m1+P1)/K1 = (m2+P2)/K2  (where K1 = sqrt(m1*m1b), and K2 is the same for market 2)


    
    //buying P of type 1.
    //[m1, m2] -> [m1 + P, m2m1/(m1+P))]
    
    //g = m2 - m2*m1/(m1+P)
    //g = m2 - K1/(m1+P)
    //g = m2(1 - m1/(m1+P))
    //g = m2(P/(m1+P))
    //g = m2/((m1/P)+1))

    //g' = m2*m1/((m1+P)^2)
    //g' = m2/m1


    //g2 = n2/((n1/g)+1)
    //g2 = n2/((n1((m1/P)+1)/m2)+1)
    //g2 = n2/((n1*(m1/P + 1)/m2)+1)
    //g2 = n2/((n1*(m1/P + 1) + m2)/m2))
    //g2 = n2*m2/(n1*m1/P + n1 + m2)
//*** g2 = n2/(n1*((m1/P) + 1)/m2) + 1)

    //g2 = n2 - n2*n1/(n1+g)
    //g2'= n2*n1/((n1+g)^2
    // = n2*m2/(n1*m1)

    
    //g2 = n2(1/((n1/g)+1))
    //g2 = n2(1/((n1/(m2(1/((m1/P)+1))))+1))
   


    //this is the familiar Q1/C1 = Q2/C2 formula for capacitors in parallel and all share the same voltage drop.
    //so markets have a concept of "capacitance", which is the sqrt of (coins1 * coins2), this is the sqrt of the constant factor that the constant factor market is based on.

    // V*C = Q
    // sqrt(price)*constant = m1
    // sqrt(m1/m2)*sqrt(m1*m2) = m1

    



    

//If we consider 2 markets in series, then the total price slippage of the system is the sum of the price slippage of the parts. and the quantity of subcurrency pushed through is the same for the entire path.
//(total slippage) = slipage1 + slippage2
//total slippage = paid / capacitance1 + paid/capacitance2
//total paid / total capacitance = paid / capcitance1 + paid / capacitance2
//-> 1/C = 1/c1 + 1/c2

    // Q = C * V.
    // amount of charge = capacitance * voltage
    // amount of money added to the market =
    //   capacitance * price slippage

    
    //todo
    //* we need a way to start from a contract id, and look up all the markets that connect to that contract.


    
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
        rpc.post(["r", CID1, CID2], function(response){
            console.log("got paths");
            var markets = response[1].slice(1);
            var contracts = response[2].slice(1);
            return(swap_price2(markets, contracts,
                               parseInt(amount.value),
                               CID1, Type1,
                               CID2, Type2));
        }, get_ip(), 8091);
    };
    function swap_price2(
        marketids, cids, amount,
        cid1, type1, cid2, type2)
    {
        //console.log(JSON.stringify([amount, type1, type2, cid1, cid2, cids, marketids]));
        return(get_contracts(cids, [], function(contracts){
            return(get_markets(marketids, [], function(markets) {
//                console.log(JSON.stringify([amount, type1, type2, cid1, cid2, contracts, markets]));
                var Paths = all_paths([[[cid1, type1]]], cid2, type2, contracts, markets, 5);
                //console.log(JSON.stringify(Paths));
                var Paths2 = end_goal(cid2, type2, Paths);//TODO, remove paths that do not end at our goal.
                console.log(JSON.stringify(Paths2));
                console.log(JSON.stringify(Paths2.length));
                return(swap_price3(Paths2, amount));
                //["contract_use_tx", 0, 0, 0,
                //cid, amount, many, source, source_type]
                //["market_swap_tx, 0, 0, 0,
                //mid, give, take, direction,
                //cid1, type1, cid2, type2]
                //multi_tx.make(txs, function(tx){

//            };
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
            DB[contract[1]] = contract;
            return(DB);
        };
        return build_paths_db(Paths.slice(1), DB);
    };
    function swap_price3(Paths, amount) {
        //we need to find the optimal way to spend amount on the different paths to get the best price.

        //an initial guess we can keep improving.
        var L = Paths.length;
        var a = amount / L;
        var guess = array_of(a, L);

        //make a database of the markets and contracts that can be updated with trades.
        var db = build_paths_db(Paths, {});
        console.log(JSON.stringify(db));

        //update the database based on our current guess of the distribution.
        var db2 = make_trades(guess, Paths, JSON.parse(JSON.stringify(db)));
        console.log(JSON.stringify(db2));
        //calculate the final price on every path to buy a bit more. this is the gradient vector.
        var gradient = get_gradient(Paths, db2);
        //if the price on every path is within 0.01% of the same, then we are done.
        //for the paths that are more expensive than average, buy less in the next iteration. for the paths that are less expensive, buy more in the next iteration.
    };
    function make_trades(guess, paths, db) {
        for(var i = 0; i<guess.length; i++){
            db = process_path(guess[i], paths[i], db);
        };
        return(db);
    };
    function process_path(Amount, path, db){
        var currency = path[0];
        if(path.length < 2){
            return(db);
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
                Amount = old - m[7];
                db[mid] = m;
                return(process_path(Amount, path, db));
            } else if ((m[5] == currency[0]) &&
                       (m[6] == currency[1])){
                m[7] = m[7] + Amount;
                var old = m[4];
                m[4] = K/m[7];
                Amount = old - m[4];
                db[mid] = m;
                return(process_path(Amount, path, db));
            } else {
                console.log("process path bad error");
                return(0);
            };
        };
        if(type[0] == "contract"){
            //start_currency can be any of 3 spots.
            //end_currency can be any of 3 spots.
            //market start can be any of 3.
            //market end can be any of 3.

            var cid = path[1][0][1];
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
                       Amount = Amount + G;
                       db[mid] = m;
                       return(process_path(Amount, path, db));
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
                       Amount = Amount + G;
                       db[mid] = m;
                       return(process_path(Amount, path, db));
                   } else {
                       //starts at source. the market is between the subcurrencies.
                       if((end_currency[0] == mcid1) &&
                          (end_currency[1] == mtype1)){
                           m[7] = m[7] + Amount;
                           var old = m[4];
                           m[4] = K / m[7];
                           var gain = old - m[4];
                           Amount = Amount + gain;
                           return(process_path(Amount, path, db));
                       } else if ((end_currency[0] == mcid2) &&
                                  (end_currency[1] == mtype2)){
                           m[4] = m[4] + Amount;
                           var old = m[7];
                           m[7] = K / m[4];
                           var gain = old - m[7];
                           Amount = Amount + gain;
                           db[mid] = m;
                           return(process_path(Amount, path, db));
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
                       Amount = G - Amount;
                       db[mid] = m;
                       return(process_path(Amount, path, db));
                   } else if((mcid2 == source)&&(mtype2 == source_type)){
                       m[7] = m[7] + Amount;
                       var old = m[4];
                       m[4] = K/m[7];
                       var G = old - m[4];
                       Amount = G - Amount;
                       db[mid] = m;
                       return(process_path(Amount, path, db));
                       
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
                           Amount = gain;
                           db[mid] = m;
                           return(process_path(Amount, path, db));
                           
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
                           Amount = gain;//also = Amount - B
                           db[mid] = m;
                           return(process_path(Amount, path, db));
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
                       Amount = G;
                       db[mid] = m;
                       return(process_path(Amount, path, db));
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
                       Amount = G;
                       db[mid] = m;
                       return(process_path(Amount, path, db));
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
                       Amount = G - Amount;
                       db[mid] = m;
                       return(process_path(Amount, path, db));
                   } else if ((mcid2 == end_currency[0])&&
                              (mtype2 == end_currency[1])){
                       m[7] = m[7] + Amount;
                       var old = m[4];
                       m[4] = K/m[7];
                       var G = old - m[4];
                       Amount = G - Amount;
                       db[mid] = m;
                       return(process_path(Amount, path, db));
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
    function remove_cycles(x){
        //TODO
        //if a path loops back on itself, then remove it.
        return(x);
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
                var CH = Contract[1];
                var cid = merkle.contract_id_maker(CH, MT, Source, SourceType);
                //if the tip is one of the currencies in this market, then make paths that lead to each of the other currencies that we can.
                if((Tip[0] == cid2) && (Tip[1] == type2)) {
                    Paths2 = Paths2.concat([Paths[p]]);
                    console.log("this path is done.");
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
                        //var step = [Contract, Markets[i]];
                        //var newPath = Paths[p].concat([Contract, Markets[i], other]);
                        Markets2 = Markets2.concat([newPath]);
                    };
                    Paths2 = Paths2
                        .concat([Paths[p]])
                        .concat(Markets2);
                        //*/
//                        console.log("tip matches source");
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
                        //var newPath = Paths[p].concat([Contract, m2other[0], other]);
                        Paths2 = Paths2.concat([newPath]);
                    }
                    console.log("tip matches subcurrency");
                } else {
                    Paths2 = Paths2.concat([Paths[p]]);
                    console.log(JSON.stringify(Tip));
                    console.log("tip is other");
                }
//                Paths2 = Paths2.concat([Paths[p]]);
                //console.log(JSON.stringify(Paths2));
//                Paths2 = Paths2.concat([Paths[p]]);
//                console.log(JSON.stringify([
 //                   Paths[p], {Source, SourceType}]));
            };
            //Paths2 = Paths2.concat([Paths[p]]);
        };
        return Paths2;
    };
    function market_extentions(Paths, markets, cid2, type2) {
        //console.log(JSON.stringify(markets));
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
                console.log(JSON.stringify(Tip));
                console.log(JSON.stringify(cid2));
                console.log(JSON.stringify(type2));
                if((Tip[0] == cid2) && (Tip[1] == type2)){
                    //console.log("this path is done.");
                    Paths2 = Paths2.concat([Paths[p]]);
                } else if((Tip[0] == CID1) && (Tip[1] == Type1)){
                    Paths2 = Paths2
                        .concat([Paths[p]])
                        .concat([Paths[p].concat([Market, [CID2, Type2]])])
                    //console.log(JSON.stringify(Path));
                    //console.log("extend paths");
                } else if ((Tip[0] == CID2) && (Tip[1] == Type2)) {
                    Paths2 = Paths2.concat([Paths[p].concat([Market, [CID1, Type1]])])
                    //console.log("extend paths2");
                    //console.log(Market);
                } else {
                    Paths2 = Paths2.concat([Paths[p].concat([Market, [CID1, Type1]])])
                    //console.log(JSON.stringify([Type1, Type2, type2, CID1, CID2, cid2]));
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
        merkle.request_proof("markets", MIDS[0], function(Market){
            get_markets(MIDS.slice(1),
                        Markets.concat([Market]),
                        callback);
        });
    };
    function get_contracts(CIDS, Contracts, callback){
        if(CIDS.length<1) {
            return(callback(Contracts));
        };
        merkle.request_proof("contracts", CIDS[0], function(Contract){
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
        

/*
        var MIDDirect = new_market.mid(CID1, CID2, Type1, Type2);
        var Paths = [[MIDDirect]];
        if((!(CID1 == ZERO)) && (!(CID2 == ZERO))){
            var MID1 = new_market.mid(CID1, ZERO, Type1, 0);
            var MID2 = new_market.mid(ZERO, CID2, 0, Type2);
            Paths = Paths.concat([[MID1, MID2]]);
        };
        mids_to_markets(flatten(Paths), [], function(Markets){
            console.log(JSON.stringify(Paths));
            console.log(JSON.stringify(Markets));
        });
*/
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
    function mids_to_markets(P, R, callback) {
        if(P.length == 0){
            return(callback(R));
        };
        merkle.request_proof("markets", P[0], function(market){
            return(mids_to_markets(
                P.slice(1),
                R.concat([market]),
                callback));
        });
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


//    var next_button = button_maker2("next", function(){
//        console.log(selector.value);
//    });
//    swap_tab.appendChild(next_button);
//    swap_tab.appendChild(br());
    //todo, create a dropdown menu of the currencies you own, to choose which one to spend.
    //todo, create a dropdown menu of all the currencies that this can be sold for.
    //todo, they should write how much they want to sell
    //todo, the amount that they receive, and the price they are trading at, it should be automatically displayed.
    //todo, the balance should have a zeroth-confirmation component, so they get immediate feedback that the tx was published, and the effect it has.

    var pool_title = document.createElement("h3");
    pool_title.innerHTML = "Buy/Sell Liquidity Pool Shares";
    pool_tab.appendChild(pool_title);
    //todo, create a dropdown menu of the markets you own liquidity shares in. Also make a button to look up other markets.
    //todo, once a market is selected, display your current balance, and the price for buying/selling right now.
    // possibly use a market swap, and/or a contract_use_tx in a flash loan to get the currency you need to participate in the pool.
    //have a field to type the amount to buy, a button for 'buy more liquidity shares', and a button for 'sell your liquidity shares'.


    div.appendChild(br());
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
        merkle.request_proof("contracts", contracts[0], function(c) {
            many_types = c[2];
            contracts_to_subs2(contracts[0], 1, many_types, [], function(subs){
                return(contracts_to_subs(
                    contracts.slice(1),
                    R.concat([subs]),
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
        merkle.request_proof("sub_accounts", key, function(x) {
            if(x == "empty") {
                return(contracts_to_subs2(CID, N+1, L, R, callback));
            } else {
                return(contracts_to_subs2(CID, N+1, L, R.concat([CID, N]), callback));

            };
        });
    };
    function end_goal(cid, type, paths) {
        var paths2 = [];
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            var last = path[path.length - 1];
            //console.log(JSON.stringify(last));
            //console.log([cid, type]);
            //console.log(JSON.stringify(path));
            //console.log(JSON.stringify(paths));
            if((last[0] == cid) && (last[1] == type)){
                paths2 = paths2.concat([paths[i]]);
            }
        };
        return(paths2);
    };
    function helper(){
        contract_id.value = "95bMsSPuGa2s3M6gADqmbdBjuCVTIYc2Nf6KMw4xl48=";
        amount.value = 100000000;
        contract_type.value = "1";
    // uniswap.cid("1qSyvrk/L3uBxN6uSsaX3oVypSzLpL260/CJl6e4Dq8="),
    };
    helper();
    return({load: load,
            //cid1: function(x){ cid1.value = x },
            helper: helper
            //button: next_button
           });
     
    })();
