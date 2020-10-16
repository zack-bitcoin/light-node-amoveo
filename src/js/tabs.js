var tabs = (function(){
    const urlParams = new URLSearchParams(window.location.search);
    var hide_non_standard = urlParams.get('hide_non_standard');
    if(hide_non_standard == "true"){
        hide_non_standard = true;
    };
    var display = document.createElement("div");
    var balances = document.createElement("div");
    var div = document.getElementById("main");
    var current_tab = document.createElement("div");
    var swap_tab = document.createElement("div");
    var pool_tab = document.createElement("div");
    var spend_tab = document.createElement("div");
    var create_tab = document.createElement("div");
    var sub_accs = [];
    var liquidity_shares = [];
    var swap_selector = document.createElement("select");
    var create_selector = document.createElement("select");
    var pool_selector = document.createElement("select");
    var spend_selector = document.createElement("select");
    
    div.appendChild(balances);
    div.appendChild(display);
    div.appendChild(br());
    current_tab.appendChild(swap_tab);

    keys.update_balance_callback(load);

    function load() {
        display.innerHTML = "looking up which currencies you own.";
        setTimeout(function(){
            rpc.post(["account", keys.pub()], function(response){
                if(response == "error") {
                    display.innerHTML = "<h3>load a key with funds.</h3>";
                    //current_tab.innerHTML = "";
                } else {
                    sub_accs = response[1][3].slice(1);
                    liquidity_shares = response[1][4].slice(1);
                    //liquidity_shares = [];
                    display.innerHTML = "";
                }
                //swap_mode_f();
                /*
                swap_selector.innerHTML = "";
                create_selector.innerHTML = "";
                pool_selector.innerHTML = "";
                spend_selector.innerHTML = "";
                load_selector_options(
                    spend_selector, ["veo"]);
                load_selector_options(
                    swap_selector, ["veo"]);
                load_selector_options(
                    create_selector, ["veo"]);
                load_selector_options(
                    pool_selector, ["veo"]);
*/
                    //market_selector.innerHTML = "";
                    //TODO figure out which subcurrencies we own in each contract. each subcurrency goes into the selector seperately.
                contracts_to_subs(sub_accs, [], function(sub_accs2){
                    //console.log("about to load balances");
                    load_balances(
                        sub_accs2, liquidity_shares, "<h4>your balances in each subcurrency</h4>",
                        function(){
                            show_balances();
                            /*
                            sub_accs2 = sub_accs2.map(function(x) {
                                return(JSON.stringify(x));
                            });
                            liquidity_shares = liquidity_shares.map(function(x){return(JSON.stringify([x, 0]));});
                            var Options = liquidity_shares;
                            load_selector_options(
                                spend_selector, Options);
                            load_selector_options(
                                swap_selector, Options);
                            load_selector_options(
                                create_selector, Options);
                            load_selector_options(
                                pool_selector, Options);
                            */
                        });
                });
                
            }, get_ip(), 8091), 0
        });
    };
    function contracts_to_subs(contracts, R, callback) {
        //console.log("contracts to subs 1");
        if(contracts.length < 1){
            return(callback(R));
        };
        //merkle.request_proof("contracts", contracts[0], function(c) {
        /*
        setTimeout(function(){
            rpc.post(["contracts", contracts[0]], function(c) {
                many_types = c[2];
                contracts_to_subs2(contracts[0], 1, many_types, [], function(subs){
                    return(contracts_to_subs(
                        contracts.slice(1),
                        R.concat(subs),
                        callback));
                });
            });
        }, 100);
        */
        var many_types = 2;
        contracts_to_subs2(contracts[0], 1, many_types, [], function(subs){
            return(contracts_to_subs(
                contracts.slice(1),
                R.concat(subs),
                callback));
        });
            
    };
    function contracts_to_subs2(CID, N, L, R, callback) {
        //console.log("contracts to subs 2");
        if(N>L){
            return(callback(R));
        };
        //var subkey = sub_accounts.key(keys.pub(), CID, N);
        //var subkey = btoa(array_to_string(subkey));
        //merkle.request_proof("sub_accounts", key, function(x) {
        //setTimeout(function(){
            //rpc.post(["sub_accounts", subkey], function(x) {
            //if(x == "empty") {
            //    return(contracts_to_subs2(CID, N+1, L, R, callback));
            //} else {
                return(contracts_to_subs2(CID, N+1, L, R.concat([[CID, N]]), callback));

            //};
        //});
        //}, 100);
    };
    function load_balances2(ls, s, callback){
        if(ls.length < 1){
            //balances.innerHTML = s;
            return(callback());
        } else {
            var mid = ls[0];
            //console.log([keys.pub(), ls[0]]);
            var sk = sub_accounts.key(keys.pub(), ls[0], 0);
            var sk = btoa(array_to_string(sk));
            rpc.post(["sub_accounts", sk], function(sa) {
//                rpc.post(["markets", mid], function(market) {
                var balance = 0;
                if(!(sa == "empty")){
                    balance = sa[1];
                };
                if(balance > 10000){
                    var temp_span = document.createElement("span");
                    //s = s
                    temp_span.innerHTML = ""
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
                        .concat("<br>");
                    balances.appendChild(temp_span);
                }
                return(load_balances2(ls.slice(1), s, callback));
//                });
            });
        };
    };
    var balances_db = {};
    var update_frequency = 0;//1000 * 60 * 10;//by default don't re-check the same balance if it has been less than 10 minutes.
    function show_balances() {
        var sub_keys = Object.keys(balances_db);
        var s = "";
        balances.innerHTML = "";
        swap_selector.innerHTML = "";
        spend_selector.innerHTML = "";
        create_selector.innerHTML = "";
        pool_selector.innerHTML = "";
        load_selector_options(swap_selector, ["veo"]);
        load_selector_options(spend_selector, ["veo"]);
        load_selector_options(create_selector, ["veo"]);
        load_selector_options(pool_selector, ["veo"]);
        for(var i = 0; i<sub_keys.length; i++){
            //console.log(sub_keys[i]);
            //console.log(balances_db[sub_keys[i]]);
            var sa = balances_db[sub_keys[i]];
            if(sa &&
               sa.string){
                var temp = document.createElement("span");
                var s = sa.string;
                temp.innerHTML = s.concat("<br>");
                balances.appendChild(temp);
                var option = document.createElement("option");
                option.innerHTML = s;
                option.value = JSON.stringify([sa.cid, sa.type]);
                if(sa.type !== 0){
                    swap_selector.appendChild(option);
                };
                spend_selector.appendChild(option.cloneNode(true));
                create_selector.appendChild(option.cloneNode(true));
                pool_selector.appendChild(option.cloneNode(true));
            };
        };
    };
    function load_balances(accs, ls, s, callback) {
        console.log("load balances 1");
        var sub1 = accs.map(function(acc){
            var sk = sub_accounts.key(keys.pub(), acc[0], acc[1]);
            var sk2 = btoa(array_to_string(sk));
            return({sub_key:sk2,
                    cid: acc[0],
                    type: acc[1]
                   });
        });
        var sub2 = ls.map(function(mid){
            var sk = sub_accounts.key(keys.pub(), mid, 0);
            var sk2 = btoa(array_to_string(sk));
            return({sub_key:sk2,
                    cid: mid,
                    type: 0});
        });
        //console.log("load balances 2");
        var subs = sub1.concat(sub2);
        //console.log(JSON.stringify(subs));
        return(lb2(subs, callback));
    }
    function lb2(subs, callback){
        if(subs.length == 0){
            return(callback());
        };
        var sub = subs[0];
        //console.log("load balances in loop");
        //console.log(sub);
        var sk = sub.sub_key;
        if(balances_db[sk] &&
           balances_db[sk].time &&
           ((Date.now() - balances_db[sk].time) <
                update_frequency)){
            return(lb2(subs.slice(1), callback));
            //don't update.
        } else {
            if(!balances_db[sk]){
                balances_db[sk] = {};
            };
            balances_db[sk].time = Date.now();
            rpc.post(["sub_accounts", sk], function(sa){
                var balance = 0;
                if(!(sa == "empty")){
                    balance = sa[1];
                };
                if(balance < 10001){
                    balances_db[sk].time = Date.now()*2;
                    return(lb2(subs.slice(1), callback));
                };
                if(balance > 10000){
                    balances_db[sk].bal = balance;
                    balances_db[sk].type = sub.type;
                    balances_db[sk].cid = sub.cid;
                    if(sub.type == 0) {//its a market
                        //build the string. load it in balances_db.
                        var mid = sub.cid;
                        var s = "market: "
                            .concat(mid)
                            .concat(" balance : ")
                            .concat((balance / token_units()).toString());
                        balances_db[sk].string = s;
                        show_balances();
                        return(lb2(subs.slice(1), callback));
                    } else {//a subcurrency then
                        rpc.post(["read", 3, sub.cid], function(oracle_text){
                            console.log(sub.cid);
                            console.log(oracle_text);
                            //build the string. load it in balances_db.
                            var s = "";
                            if(sub.type == 2){
                                s = s.concat("inverse ");
                            };
                            if(oracle_text &&(!(oracle_text == 0))){
                                console.log(oracle_text);
                                var ot1 = atob(oracle_text[1]);
                                if(is_ticker_format(ot1)){
                                    var ticker = decode_ticker(ot1);
                                    s = s.concat("ticker: ")
                                        .concat(ticker);
                                } else {
                                    s = s.concat("oracle text: ")
                                        .concat(ot1)
                                        .concat("contract: ")
                                        .concat(sub.cid);
                                };
                            } else {
                                s = s
                                    .concat("contract: ")
                                    .concat(sub.cid);
                            };
                            s = s//.concat("contract: ")
                                //.concat(sub.cid)
                                .concat(" balance: ")
                                .concat((balance/token_units()).toString());
                            balances_db[sk].string = s;
                            show_balances();
                            setTimeout(function(){
                                return(lb2(subs.slice(1), callback));
                            }, 100);
                        }, get_ip(), 8090);
                    };
                };
            });
        };
        //if(subs.length == 1){
        //    console.log(JSON.stringify(balances_db));
        //    return(callback());
        //} else {
        //setTimeout(function(){
         //       return(lb2(subs.slice(1), callback));
         //   }, 100);
        //};
    };
    function load_balances_old(accs, ls, s, callback) {
        //console.log("load balances");
        //console.log(accs);
        if(accs.length < 1){
            return load_balances2(ls, s, callback);
        };
        var acc = accs[0];
        var sk = sub_accounts.key(keys.pub(), acc[0], acc[1]);
        var sk = btoa(array_to_string(sk));
        rpc.post(["sub_accounts", sk], function(sa){
            var balance = 0;
            if(!(sa == "empty")){
                balance = sa[1];
            };
            if(balance > 10000){
                //console.log(accs[0][0]);
                rpc.post(["read", 3, accs[0][0]], function(oracle_text) {
                    //console.log(oracle_text);
                    var option = document.createElement("option");
                    var option_type;
                    if(acc[1] == 1){
                        option_type = "";
                    } else if (acc[1] == 2){
                        option_type = "inverse ";
                    } else {
                        console.log("bad subcurrency type error");
                        return(0);
                    };

                    var text;
                    if(!(oracle_text == 0)) {
                        var ot1 = atob(oracle_text[1]);
                        //console.log(ot1);
                        if(is_ticker_format(ot1)){
                            var ticker =
                                decode_ticker(ot1);
                            text = ("ticker: ")
                                .concat(ticker)
                                .concat(" contract id: ")
                                .concat(accs[0][0]);
                            option.innerHTML =
                                option_type
                                .concat(ticker);
                        } else {
                            text = ("oracle text: ")
                                .concat(ot1)
                                .concat(" contract id: ")
                                .concat(accs[0][0]);
                            option.innerHTML = option_type
                                .concat((ot1).slice(0, 60));
                        }
                    } else {
                        var text = "contract: "
                            .concat(accs[0][0]);
                        option.innerHTML = JSON.stringify([acc[0], acc[1]]);
                    }
                    option.value = JSON.stringify([acc[0], acc[1]]);
                    if(!(acc[1] == 0)) {
                        swap_selector.appendChild(option);
                    };
                    spend_selector.appendChild(option.cloneNode(true));
                    create_selector.appendChild(option.cloneNode(true));
                    pool_selector.appendChild(option.cloneNode(true));
                    var temp_span = document.createElement("span");
                    
                    
                    // s = s
                    temp_span.innerHTML = ""
                        .concat(text)
//                        .concat("contract: ")
 //                       .concat(accs[0][0])
                        .concat(" type: ")
                        .concat(accs[0][1])
                        .concat(" balance: ")
                        .concat((balance / token_units()).toString())
                        .concat("<br>");
                    balances.appendChild(temp_span);
                    //return(load_balances(accs.slice(1), ls, s, callback));
                }, get_ip(), 8090);
            } else {
                //return(load_balances(accs.slice(1), ls, s, callback));
            };
            return(load_balances(accs.slice(1), ls, s, callback));
        });
    };
    function change_tab(To) {
        return(function(){
            current_tab.innerHTML = "";
            current_tab.appendChild(To);
        });
    };
    //const ticker_regex = RegExp("^W = [(a-z)(A-Z)]*\.[(a-z)(A-Z)]*; T = [\\d|:|\\-| ]*China Standard Time \\(GMT\\+8\\); ticker = [(a-z)(A-Z)]*; return\\(the price of ticker at time T according to website W\\) \\* \\d*$");
    const ticker_regex = RegExp("^W = (qtrade\.io)|(coinmarketcap\.com)|(coinpaprika\.com); T = [\\d|:|\\-| ]*China Standard Time \\(GMT\\+8\\); ticker = [(a-z)(A-Z)]*; return\\(the price of ticker at time T according to website W\\) \\* \\d*");
    function is_ticker_format(x) {
        return(ticker_regex.test(x));
    };
    function coll_limit(x) {
        var l = x.split(";");
        var scale = parseInt(l[3].split(" * ")[1]);
        var MaxVal = 4294967295;
        console.log(scale);
        return(MaxVal / scale);
    };
    function symbol(x) {
        console.log(x);
        var l = x.split(";");
        var ticker = l[2].split("= ")[1];
        return(ticker);
    };
    function decode_ticker(x, price) {
        var l = x.split(";");
        //var ticker = l[2].split("= ")[1];
        var ticker = symbol(x);
        var date = l[1].split("= ")[1].split(" China")[0];
        //var scale = parseInt(l[3].split(" * ")[1]);
        //var MaxVal = 4294967295;
        //var Max2 = MaxVal / scale;
        var Max2 = coll_limit(x);
        //console.log(x);
        //console.log(price);// 2/3. btc is 2/3rds of it's limit price.
        //limit of btc is 1/Max2
        //console.log(price/Max2);//value of btc in veo
        //console.log(Max2 / price);//value of veo in btc
        //console.log(Max2);
        var collateral = 1 + (((1-price)/price));
        //var collateral = 1 + ((price/(1-price)));
        var display_price = Max2 / ((price));
        if(price){
            return(ticker
                   .concat(" - ")
                   .concat(date)
                   .concat(" - collateral: ")
                   .concat((100*collateral).toFixed(2).toString())//is 150, should be 200
                   .concat("% - price: ")
                   .concat((display_price).toFixed(8).toString())
                   .concat(" "));
        } else {
            //console.log(display_price);
            //console.log(collateral);
            return(ticker
                   .concat(" - ")
                   .concat(date)
                   .concat(" - collateral limit price: ")
                   .concat(Max2.toFixed(8).toString())
               //.concat((display_price / collateral).toFixed(8).toString())
                   .concat(""));
        };
    };
    function test() {
        var x = "W = qtrade.io; T = 12:00 20-9-2020 China Standard Time (GMT+8); ticker = BTC; return(the price of ticker at time T according to website W) * 810371187736";
        console.log(ticker_regex.test(x));
    };
    var swap_mode =
        button_maker2("swap", change_tab(swap_tab));
    var pool_mode =
        button_maker2("pool", change_tab(pool_tab));
    var create_mode =
        button_maker2("create", change_tab(create_tab));
    var spend_mode =
        button_maker2("send", change_tab(spend_tab));
    div.appendChild(swap_mode);
    div.appendChild(pool_mode);
    div.appendChild(create_mode);
    div.appendChild(spend_mode);
    div.appendChild(br());
    div.appendChild(current_tab);

    var pool = pool_tab_builder(pool_tab, pool_selector, hide_non_standard);
    var spend = spend_tab_builder(spend_tab, spend_selector);
    var swap = swap_tab_builder(swap_tab, swap_selector, hide_non_standard);
    //var swap = swap_tab_builder(swap_tab, spend_selector.cloneNode(true));
    var create = create_tab_builder(create_tab, create_selector, hide_non_standard);
    //var create = create_tab_builder(create_tab, spend_selector.cloneNode(true));

    return({pool: pool,
            swap: swap,
            spend: spend,
            create: create,
            is_ticker_format: is_ticker_format,
            decode_ticker: decode_ticker,
            coll_limit: coll_limit,
            symbol: symbol,
            balances_db: balances_db,
            test: test});
})();
