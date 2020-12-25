var tabs = (function(){
    const urlParams = new URLSearchParams(window.location.search);
    var hide_non_standard = urlParams.get('hide_non_standard');
    if(hide_non_standard == "true"){
        hide_non_standard = true;
    };
    var swap_cid = urlParams.get('swap_cid');
    var swap_type = urlParams.get('swap_type');
    if(swap_cid && swap_type){
        swap_cid = swap_cid.replace(/\ /g, "+");
        var preload_swap =
            JSON.stringify(
                [swap_cid, swap_type]);
    }

    var display = document.createElement("div");
    var balances = document.createElement("div");
    var div = document.getElementById("main");
    var current_tab = document.createElement("div");
    var tab_builder =
        [["swap", swap_tab_builder, "swap"],
         ["pool", pool_tab_builder, "pool"],
         ["spend", spend_tab_builder, "spend"],
         ["create", create_tab_builder, "create stablecoin"],
         ["create_binary", create_binary_tab_builder, "create binary"],
         ["create_scalar", create_scalar_tab_builder, "create scalar"],
         ["create_futarchy", create_futarchy_tab_builder, "create futarchy"]
        ];
    var tabs = {};
    for (var i = 0; i<tab_builder.length; i++){
        var d = document.createElement("div");
        var s = document.createElement("select");
        //console.log(JSON.stringify(s));
        load_selector_options(s, ["veo"]);
        tabs[tab_builder[i][0]] =
            {div: d,
             selector: s,
             button: button_maker3(tab_builder[i][2], change_tab(d)),
             tab: tab_builder[i][1](d, s, hide_non_standard)};
    };
    var sub_accs = [];
    var liquidity_shares = [];
    div.appendChild(display);
    div.appendChild(br());
    current_tab.appendChild(tabs["swap"].div);//default starts in swap tab.
    keys.update_balance_callback(load);

    function load() {
        display.innerHTML = "looking up which currencies you own.";
        setTimeout(function(){
            rpc.post(["account", keys.pub()], function(response){
                if(response == "error") {
                    display.innerHTML = "<h3>load a key with funds.</h3>";
                } else {
                    sub_accs = response[1][3].slice(1);
                    liquidity_shares = response[1][4].slice(1);
                    display.innerHTML = "";
                }
                    //TODO figure out which subcurrencies we own in each contract. each subcurrency goes into the selector seperately.
                contracts_to_subs(sub_accs, [], function(sub_accs2){
                    load_balances(
                        sub_accs2, liquidity_shares, "<h4>your balances in each subcurrency</h4>",
                        function(){
                            show_balances();
                        });
                });
                
            }, get_ip(), 8091), 0
        });
    };
    function contracts_to_subs(contracts, R, callback) {
        if(contracts.length < 1){
            return(callback(R));
        };
        var many_types = 2;
        contracts_to_subs2(contracts[0], 1, many_types, [], function(subs){
            return(contracts_to_subs(
                contracts.slice(1),
                R.concat(subs),
                callback));
        });
            
    };
    function contracts_to_subs2(CID, N, L, R, callback) {
        if(N>L){
            return(callback(R));
        };
                return(contracts_to_subs2(CID, N+1, L, R.concat([[CID, N]]), callback));
    };
    function load_balances2(ls, s, callback){
        if(ls.length < 1){
            return(callback());
        } else {
            var mid = ls[0];
            var sk = sub_accounts.key(keys.pub(), ls[0], 0);
            var sk = btoa(array_to_string(sk));
            rpc.post(["sub_accounts", sk], function(sa) {
                var balance = 0;
                if(!(sa == "empty")){
                    balance = sa[1];
                };
                return(load_balances2(ls.slice(1), s, callback));
            });
        };
    };
    var balances_db = {};
    var update_frequency = 0;//1000 * 60 * 10;//by default don't re-check the same balance if it has been less than 10 minutes.
    var loaded_into_selector = {};
    function show_balances() {
        var sub_keys = Object.keys(balances_db);
        var s = "";
        balances.innerHTML = "";
        for(var i = 0; i<sub_keys.length; i++){
            var sa = balances_db[sub_keys[i]];
            if(sa && sa.string){
                var s = sa.string;
                console.log(s);
                if(!(loaded_into_selector[sub_keys[i]])){
                    loaded_into_selector[sub_keys[i]] = true;

                    var option = document.createElement("option");
                    option.innerHTML = s;
                    option.value = JSON.stringify([sa.cid, sa.type]);
                    for (var j = 0; j<tab_builder.length; j++){
                        if((!("swap" === tab_builder[j][0])) ||
                           (! (0 === sa.type))){
                        tabs[tab_builder[j][0]].
                            selector.appendChild(
                                option.cloneNode(
                                    true));
                        };
                    };
                };
            };
        };
    };
    function load_balances(accs, ls, s, callback) {
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
        var subs = sub1.concat(sub2);
        return(lb2(subs, callback));
    }
    function lb2(subs, callback){
        if(subs.length == 0){
            return(callback());
        };
        var sub = subs[0];
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
                    //do we need to erase it, if it exists?
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
                            console.log(oracle_text);
                            //build the string. load it in balances_db.
                            var s = "";
                            if(sub.type == 2){
                                s = s.concat("inverse ");
                            };
                            if(oracle_text &&(!(oracle_text == 0))){
                                var ot1 = atob(oracle_text[1]);
                                if(is_ticker_format(ot1)){
                                    var ticker = decode_ticker(ot1);
                                    var limit = coll_limit(ot1);
                                    balances_db[sk].limit = limit;
                                    var ticker_symbol = symbol(ot1);
                                    balances_db[sk].ticker_symbol = "v".concat(ticker_symbol);
                                    s = s.concat("ticker: v")
                                        .concat(ticker);
                                    if(sub.type === 1){
                                        s = s
                                            .concat(" balance: ")
                                            .concat((balance * limit / token_units()).toString())
                                            .concat(" v")
                                            .concat(ticker_symbol);
                                    } else {
                                        s = s
                                            .concat(" balance: ")
                                            .concat((balance/token_units()).toString());
                                    };
                                } else {
                                    if(ot1.length > 64){
                                        ot1 = ot1.slice(0, 64)
                                            .concat("...");
                                    };
                                    s = s.concat("oracle text: ")
                                        .concat(ot1)
                                        .concat("contract: ")
                                        .concat(sub.cid)
                                        .concat(" balance: ")
                                        .concat((balance/token_units()).toString());
                                };
                            } else {
                                s = s
                                    .concat("contract: ")
                                    .concat(sub.cid)
                                    .concat(" balance: ")
                                    .concat((balance/token_units()).toString());
                            };
                            balances_db[sk].string = s;
                            show_balances();
                            setTimeout(function(){
                                return(lb2(subs.slice(1), callback));
                            }, 0);
                        }, get_ip(), 8090);
                    };
                };
            });
        };
    };
    function change_tab(To) {
        return(function(button){
            buttons.map(function(aa){
                aa.style.backgroundColor = "";
            });
            button.style.backgroundColor = "red";
            current_tab.innerHTML = "";
            current_tab.appendChild(To);
        });
    };
    const ticker_regex = /W = ((qtrade\.io)|(coinmarketcap\.com)|(coinpaprika\.com)); T = [\d|:|\-| ]*China Standard Time \(GMT\+8\); ticker = [(a-z)(A-Z)]*; return\(the price of ticker at time T according to website W\) \* \d*/;
    const stablecoin_0 = /standard\s+stablecoin\s+0\s*;\s*ticker_path\s*=\s*\[(\w+\s*,\s*)*\w+\s*\]\s*;\s*website_path\s*=\s*\[([^,\]]+,\s*)[^,\]]+\]\s*;\s*time\s*=[^;]+;\s*price\s*=\s*\d+\s*;\s*for\(i=0; i<website_path\.length; i\+\+\)\{\s*price \*= \(the price of ticker_path\[i\] in ticker_path\[i\+1\] according to website\[i\]\)\s*\};\s*scale\s*=\s*\d+\s*;\s*return\(price\s*\*\s*scale\);/;
    function is_ticker_format(x) {
        var b = (ticker_regex.test(x) ||
                 stablecoin_0.test(x));
        if(!(b)){
            //console.log(x);
        };
        return(b);
    };
    const get_scale = /;\s*scale\s*=\s*\d+;/
    function coll_limit(x) {
        var MaxVal = 4294967295;
        var scale;
        if(ticker_regex.test(x)){
            var l = x.split(";");
            scale = l[3].split(" * ")[1];
        } else if (stablecoin_0.test(x)){
            var scale = x.match(get_scale)[0]
                .match(/\d+/)[0];
        };
        scale = parseInt(scale, 10);
        //console.log(scale);
        return(MaxVal / scale);
    };
    const get_ticker_path = /;\s*ticker_path\s*=\s*[^;]+;/
    function symbol(x) {
        if(ticker_regex.test(x)){
            var l = x.split(";");
            var ticker = l[2].split("= ")[1];
            return(ticker);
        } else if (stablecoin_0.test(x)){
            return(
                x.match(get_ticker_path)[0]
                    .match(/,\s*\w+\]/)[0]//last in list
                    .match(/\w+/)[0]);//grab ticker
        }
    };
    var months = {1:"jan",
                  2:"feb",
                  3:"mar",
                  4:"apr",
                  5:"may",
                  6:"jun",
                  7:"jul",
                  8:"aug",
                  9:"sep",
                  10:"oct",
                  11:"nov",
                  12:"dec"};
    const get_time = /;\s*time\s*=[^;]+;/
    function decode_date(x) {
        var date;
        if(ticker_regex.test(x)){
            var l = x.split(";");
            date = l[1].split("= ")[1].split(" China")[0];
            //return(date);
        } else if(stablecoin_0.test(x)){
            //console.log(x.match(get_time)[0]);
            //console.log(x.match(get_time)[0]
            //            .match(/=[^;]*;/));
            date = x.match(get_time)[0]
                .match(/=[^;]*;/)[0]
                .match(/[^=\s][^;]*/)[0]
                .split(" China")[0]
        }
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth()+1;
        //console.log(date);
        return(
            date
                .replace("12:00 ", "")
                .replace(/-\d\d?-/,
                         function(s){
                             n = Math.abs(parseInt(s));
                             if(n === month){
                                 return(s);
                             };
                             var m = months[n];
                             if(!(m)){
                                 m = n;
                             };
                             return("-".concat(m).concat("-"))
                         })
                .replace("-".concat(month.toString()).concat("-"), "-")
                .replace("-".concat(year.toString()), "")
        );
            
    };
    function decode_ticker(x, price, kind) {
        var ticker = symbol(x);
        var date = decode_date(x);
        var Max2 = coll_limit(x);
        var collateral = 1 + (((1-price)/price));
        var display_price = Max2 / ((price));
        var coll_string = ""
            .concat(" - collateral: ")
            .concat((100*collateral).toFixed(2).toString())
            .concat("%");
        var lev_string = ""
            .concat(" - leverage: ")
            .concat((1/(1-price)).toFixed(2).toString())
            .concat("x");
        var coll_lev_string =
            coll_string
            .concat(lev_string);
        if(kind === "stablecoin"){
            coll_lev_string = coll_string;
        } else if(kind === "long-veo"){
            coll_lev_string = lev_string;
            display_price = 1-price;
        };
        var ticker_front = "v";
        if(kind === "long-veo"){
            ticker_front = "iv";
        };
        if(price){
            return(ticker_front
                   .concat(ticker)
                   .concat(" - ")
                   .concat(date)
                   .concat(coll_lev_string)
                   .concat(" - price: ")
                   .concat((display_price).toFixed(3).toString())
                   .concat(" "));
        } else {
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
        //console.log(ticker_regex.test(x));
        x = "standard stablecoin 0; ticker_path = [veo, btc, usd]; website_path = [qtrade.io, coinpaprika.com]; time = 12:00 10-29-2020 China Standard Time (GMT+8); price = 1; for(i=0; i<website_path.length; i++){ price *= (the price of ticker_path[i] in ticker_path[i+1] according to website[i]) }; scale = 157903209; return(price * scale);";
        x = "standard stablecoin 0; ticker_path = [VEO, BTC, USD]; website_path = [qtrade.io, coinmarketcap.com]; time = 12:00 19-11-2020 China Standard Time (GMT+8); price = 1; for(i=0; i<website_path.length; i++){price *= (the price of ticker_path[i] in ticker_path[i+1] according to website[i])}; scale = 238609294; return(price * scale);";
        console.log(stablecoin_0.test(x));
    };
    var buttons = [];
    for (var i = 0; i<tab_builder.length; i++){
        buttons = buttons.concat([(tabs[tab_builder[i][0]].button)]);
    };
    tabs["swap"].button.style.backgroundColor = "red";
    for(var i = 0; i<tab_builder.length; i++){
           
        div.appendChild(tabs[tab_builder[i][0]].button);
    };
    div.appendChild(br());
    div.appendChild(current_tab);

    return({
        tabs: tabs,
        is_ticker_format: is_ticker_format,
        decode_ticker: decode_ticker,
        coll_limit: coll_limit,
        symbol: symbol,
        balances_db: balances_db,
        show_balances: show_balances,
        test: test});
})();
