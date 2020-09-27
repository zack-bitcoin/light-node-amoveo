/*
The new plan is to first swap to the source of the contract we want liquidity in, 
then we do a use_contract_tx to buy a set of the subcurrency.
Then 3 market_liquidity_tx to convert our currencies into liquidities.


move all 3 markets to the same price in such a way that you are left holding equal amounts of each subcurrency.

K1 = A00 * A10 = A01 * A11
K2 = B00 * B10 = B01 * B11
K3 = C00 * C10 = C01 * C11

A10 + C00 = A11 + C01
B10 + C10 = B11 + C11
A00 + B00 > A01 + B01

A10 + C00 = A11 + (K3/C11)
B10 + C10 = B11 + C11
A00 + B00 > (K1/A11) + (K2/B11)

C11 = K3/(A10 + C00 - A11)

B11 = B10 + C10 + K3/(A10 + C00 - A11)

A00 + B00 > (K1/A11) + (K2/(B10 + C10 + K3/(A10 + C00 - A11)))
-> choose A11 to minimize: (K1/A11) + (K2/(B10 + C10 + K3/(A10 + C00 - A11)))
= (K1/A11) + (K2*(A10 + C00 - A11)/((B10 + C10)*(A10 + C00 - A11) + K3)

d(A11)/dx -> (-K1/A11) + K2*((((B10 + C10)*(A10 + C00 - A11) + K3) * (-1)) - (((A10 + C00 - A11))*(B10 + C10)(-1)))/(((B10 + C10)*(A10 + C00 - A11) + K3)^2) = 0

let Z = (B10 + C10)*(A10 + C00 - A11)

0 = (-K1/A11) + (K2*((-(Z+K3) + Z)))/((Z+K3)^2)
0 = (-K1/A11) + (K2*(-K3))/((Z+K3)^2)
0 = (K1/A11) + (K2*K3)/((Z+K3)^2)
0 = (K1)((Z+K3)^2) + (K2*K3)*A11
0 = (K1)((((B10 + C10)*(A10 + C00 - A11))+K3)^2) + (K2*K3)*A11

let X = B10 + C10, Y = A10 + C00

0 = K1(((X*(Y-A11))+K3)^2) + K2*K3*A11
0 = K1(X*Y +K3 - X*A)^2 + K2*K3*A

let Z = X*Y + K3

0 = K1(Z - X*A)^2 + K2*K3*A
0 = K1(Z*Z - 2*X*A*Z + X*X*A*A) + K2*K3*A
0 = A*A(X*X*K1) + A(K2*K3 - K1*2*X*Z) + K1*Z*Z
0 = A*A(X*X) + A((K2*K3/K1) - 2*X*Z) + Z*Z
0 = A*A + A((K2*K3/(K1*X*X)) - 2*Z/X) + Z*Z/X/X

reminder Z/X = Y+(K3/X)

0 = A*A + A((K2*K3/(K1*X*X)) - 2*(Y+(K3/X))) + (Y+(K3/X))^2

a=1
b=((K2*K3/(K1*X*X)) - 2*(Y+(K3/X)))
c = (Y+(K3/X))^2

A11a = (-b + sqrt(b*b - 4*a*c))/2
A11b = (-b + sqrt(b*b - 4*a*c))/2

A11 = max(A11a, A11b)
A01 = K1 / A11
C01 = (A10 + C00) - A11
C11 = K3 / C01
B11 = B10 + C10 - C11
B01 = K2 / B11




3) 
T = how much source you start with.
P = inititial probability
B = amount of source to convert to subcurrencies
B = T(P/((1+P)(1-P)))
A1 = B(1-P)
A2 = B*P

in the market between 2 subcurrencies, invest B and A2.
in the market between source and the more valuable currency, invest (T-B) source, and A1 of the more valuable kind.

*/
function pool_tab_builder(pool_tab) {
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var display = document.createElement("div");
    var markets_div = document.createElement("div");
    display_markets(markets_div);
    pool_tab.appendChild(markets_div);
    
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
    var sell_all_button = button_maker2("sell max", sell_all_fun);
    pool_tab.appendChild(sell_all_button);

    pool_tab.appendChild(br());
    var market_trade_button =
        button_maker2("buy/sell liquidity", liquidity_trade);
    pool_tab.appendChild(market_trade_button);
    pool_tab.appendChild(br());
    //todo, once a market is selected, display your current balance, and the price for buying/selling right now.
    // possibly use a market swap, and/or a contract_use_tx in a flash loan to get the currency you need to participate in the pool.
    //have a field to type the amount to buy, a button for 'buy more liquidity shares', and a button for 'sell your liquidity shares'.


    pool_tab.appendChild(br());
    //div.appendChild(balances);
//    div.appendChild(current_tab);
    pool_tab.appendChild(display);


/*    function load_options(selector, L) {
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
*/
    function sell_all_fun() {
        var C1 = market_selector.value;
        var C1 = JSON.parse(C1);
        var mid = C1[0];
        var trie_key = sub_accounts.key(keys.pub(), mid, 0);
        var trie_key = btoa(array_to_string(trie_key));
        merkle.request_proof("sub_accounts", trie_key, function(x) {
            var amount = 0;
            if(x[0] == "sub_acc"){
                amount = (x[1] - 1);
            };
            amount = (-1) * amount / token_units();
            market_amount.value = (amount).toString();
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
            rpc.post(["account", keys.pub()], function(Acc){
                var Nonce = Acc[2] + 1;
                var fee = 152050;
                var tx = ["market_liquidity_tx",
                          keys.pub(),Nonce,fee,
                          mid, mav,
                          CID1, Type1, CID2, Type2];
                console.log(JSON.stringify(tx));
                var stx = keys.sign(tx);
                post_txs([stx], function(msg){
                    display.innerHTML = msg;
                    keys.update_balance();
                });


/*
                
            var txs = [tx];
            if(mav > 0) {
                //var tx2 = ["spend", 0, 0, 0, "BL0SzhkFGFW1kTTdnO8sGnwPEzUvx2U2nyECwWmUJPRhLxbPPK+ep8eYMxlTxVO/wnQS5WmsGIKcrPP7/Fw1WVc=", 1, 0];
            txs = [tx, tx2];
            } else if (CID1 == CID2) {
                var tx2 = ["contract_use_tx",
                           0,0,0,
                           CID1,
                           -mav,
                           2,
                           ZERO, 0];
                var tx3 = JSON.parse(JSON.stringify(tx2));
                tx3[5] = mav;
                txs = [tx2, tx];
            } else {
                display.innerHTML("temporarily impossible.");
            };
            multi_tx.make(txs, function(tx){
                console.log(JSON.stringify(tx));
                var stx = keys.sign(tx);
                post_txs([stx], function(msg){
                    display.innerHTML = msg;
                    keys.update_balance();
                });
*/
            });
        });
    };
    
    function markets_consensus_state(L, R, callback){
        if(L.length < 1) {
            return(callback(R));
        } else {
            var mid = L[0][1];
            //console.log(mid);
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
            //console.log(m2);
            market_selector.innerHTML = "";
            load_selector_options(market_selector, m2);
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
            //console.log(s);
            div.innerHTML = s;
            return(0);
        };
        //-record(market, {mid, height, volume = 0, txs = [], cid1, type1, cid2, type2, amount1, amount2}).
        var market = markets[0];
        var market2 = markets2[0];
        var mid = market[1];
        //console.log(JSON.stringify(market));
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
                //console.log([oracle_text1, oracle_text2]);
                var include = true;
                var text1, text2;
                if(cid1 == ZERO){
                    text1 = "veo <br>";
                } else if(!oracle_text1){
                    include = false;
                } else {
                    text1 = ("oracle question: ")
                        .concat(atob(oracle_text1[1]));
                };
                if(cid2 == ZERO){
                    text2 = "veo <br>";
                } else if(!oracle_text2){
                    include = false;
                } else {
                    text2 = ("oracle question: ")
                        .concat(atob(oracle_text2[1]));
                }
                s = s
                    .concat("Market id: ")
                    .concat(mid)
                    .concat("<br>");
                if(include){
                    s = s
                        .concat("Currency 1. ")
                    //.concat("oracle question: ")
                        .concat(text1);
                    if(!(type1 == 0)){
                    s = s
                        .concat(". It wins if result is: ")
                        .concat(type1)
//                    .concat(". amount in market: ")
//                    .concat(amount1)
                            .concat(".<br> Currency 2. ")// oracle question: ")
                    };
                    s = s
                        .concat(text2)
                    if(!(type2 == 0)){
                        s = s
                            .concat(". It wins if result is: ")
                            .concat(type2)
                    };
                    s = s
                        .concat("<br> amounts: ")
                        .concat((amount1).toString())
                        .concat(" ")
                        .concat((amount2).toString())
                        .concat(" price: ")
                        .concat((amount1/amount2).toString())
                        .concat("<br><button onclick=\"tabs.pool.market('")
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
    return({
        market: function(x){ market_selector.value = JSON.stringify([x, 0]) }
    });
};
