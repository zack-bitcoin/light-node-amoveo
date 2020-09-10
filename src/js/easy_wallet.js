var tabs = (function(){
    var display = document.createElement("div");
    var balances = document.createElement("div");
    var div = document.getElementById("main");
    var current_tab = document.createElement("div");
    var swap_tab = document.createElement("div");
    var pool_tab = document.createElement("div");
    var sub_accs = [];
    var liquidity_shares = [];
    var swap_selector = document.createElement("select");
    
    div.appendChild(balances);
    div.appendChild(display);
    div.appendChild(br());
    current_tab.appendChild(swap_tab);

    keys.update_balance_callback(load);

    function load() {
        setTimeout(function(){
            rpc.post(["account", keys.pub()], function(response){
                if(response == "error") {
                    display.innerHTML = "<h1>load a key with funds.</h1>";
                    //current_tab.innerHTML = "";
                } else {
                    sub_accs = response[1][3].slice(1);
                    liquidity_shares = response[1][4].slice(1);
                    display.innerHTML = "";
                }
                //swap_mode_f();
                swap_selector.innerHTML = "";
                    //market_selector.innerHTML = "";
                    //TODO figure out which subcurrencies we own in each contract. each subcurrency goes into the selector seperately.
                contracts_to_subs(sub_accs, [], function(sub_accs2){
                        console.log(JSON.stringify(sub_accs2));
                        load_balances(sub_accs2, liquidity_shares, "<h4>your balances in each subcurrency</h4>");
                        sub_accs2 = sub_accs2.map(function(x) {
                            return(JSON.stringify(x));
                        });
                        liquidity_shares = liquidity_shares.map(function(x){return(JSON.stringify([x, 0]));});
                        load_selector_options(
                            swap_selector, ["veo"]
                                .concat(sub_accs2)
                                .concat(liquidity_shares));
//                        load_options(market_selector,
//                                     liquidity_shares);
                    });
                
            }, get_ip(), 8091);
        });
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
            if(balance > 1){
                s = s
                    .concat("contract: ")
                    .concat(accs[0][0])
                    .concat(" type: ")
                    .concat(accs[0][1])
                    .concat(" balance: ")
                    .concat((balance / token_units()).toString())
                    .concat("<br>");
            }
            return(load_balances(accs.slice(1),
                                 ls, s));
        });
    };
    function change_tab(To) {
        return(function(){
            current_tab.innerHTML = "";
            current_tab.appendChild(To);
        });
    };
    var swap_mode =
        button_maker2("swap", change_tab(swap_tab));
    var pool_mode =
        button_maker2("pool", change_tab(pool_tab));
    div.appendChild(swap_mode);
    div.appendChild(pool_mode);
    div.appendChild(br());
    div.appendChild(current_tab);

    var pool = pool_tab_builder(pool_tab);
    var swap = swap_tab_builder(swap_tab, swap_selector);

    return({pool: pool,
            swap: swap});
})();
