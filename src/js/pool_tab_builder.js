/*
The new plan is to first swap to the source of the contract we want liquidity in, 
then we do a use_contract_tx to buy a set of the subcurrency.
Then 3 market_liquidity_tx to convert our currencies into liquidities.



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
function pool_tab_builder(pool_tab, selector, hide_non_standard) {
    var trading_fee = 0.9979995;
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var display = document.createElement("div");
    var contracts_div = document.createElement("div");
    display_contracts(contracts_div);
    pool_tab.appendChild(contracts_div);

    var pool_title = document.createElement("h3");
    pool_title.innerHTML = "Pool Currencies";
    pool_tab.appendChild(pool_title);
    pool_tab.appendChild(display);
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "which currency to sell: ";
    pool_tab.appendChild(selector_label);
    pool_tab.appendChild(selector);
    pool_tab.appendChild(br());
    var amount_input = text_input("amount to sell: ", pool_tab);
    pool_tab.appendChild(br());
    var contract_id = text_input("contract id to be paid in (leave blank for veo): ", pool_tab);
    pool_tab.appendChild(br());
    var pool_price_button =
        button_maker2("lookup price", lookup_price);
    var publish_tx_button =
        button_maker2("confirm the trade",
                      function(){
                          display.innerHTML = "lookup the price first";
                          return(0);});
    pool_tab.appendChild(pool_price_button);
    pool_tab.appendChild(publish_tx_button);


    function lookup_price(){
        console.log("lookup price");
        var C1 = selector.value;
        var CID1, Type1;
        if(C1 == "veo") {
            //buying something with veo
            CID1 = ZERO;
            Type1 = 0;
        } else {
            C1 = JSON.parse(C1);
            CID1 = C1[0];
            Type1 = C1[1];
        };
        var GoalCID = contract_id.value;
        rpc.post(
            ["contracts", GoalCID],
            function(contract){
                var SourceCID = contract[8];
                var SourceType = contract[9];
                var A = Math.round(parseFloat(amount_input.value) * token_units());
                if((CID1 == SourceCID) && (Type1 == SourceType)){
                    return(lookup_price2(A, [], SourceCID, SourceType, GoalCID, [CID1, Type1]));
                };
                tabs.swap.txs_maker(A, CID1, Type1, SourceCID, SourceType, function(swap_txs){
                    var A2 = tabs.swap.calculate_gain([SourceCID, SourceType], swap_txs, []);
                    return(lookup_price2(A2, swap_txs, SourceCID, SourceType, GoalCID, [CID1, Type1]));
                });
            });
    };
    function lookup_price2(Amount, swap_txs, SourceCID, SourceType, CID, SpentCurrency){
        //move all 3 markets to the same price in such a way that you are left profiting in source currency terms.
        //console.log(SourceCID);
        //console.log(SourceType);
        //console.log(CID);
        var mid1 = new_market.mid(SourceCID, CID, SourceType, 1);
        var mid2 = new_market.mid(SourceCID, CID, SourceType, 2);
        var mid3 = new_market.mid(CID, CID, 1, 2);
        rpc.post(["markets", mid1], function(market1){
            rpc.post(["markets", mid2], function(market2){
                rpc.post(["markets", mid3], function(market3){
                    /*
definition of constant product
K1 = A00 * A10 = A01 * A11
K2 = B00 * B10 = B01 * B11
K3 = C00 * C10 = C01 * C11
[
require all have the same price
P = A01/A11
(1-P) = B01/B11
C01 / C11 = (1-P)/P
->
A01 = sqrt(P*K1)
B01 = sqrt((1-P)*K2)
C01 = sqrt((1-P)*K3/P)
A11 = sqrt(K1/P)
B11 = sqrt(K2/(1-P))
C11 = sqrt(K3*P/(1-P))

require that we don't lose currency
C00 + A10 >= C01 + A11
B10 + C10 >= B11 + C11
A00 + B00 >= A01 + B01
->
E1) C00 + A10 >= sqrt((1-P)*K3/P) + sqrt(K1/P) 
E2) B10 + C10 >= sqrt(K2/(1-P)) + sqrt(K3*P/1-P)
E3) A00 + B00 >= sqrt(P*K1) + sqrt((1-P)*K2)

E1)
A = sqrt(B/x) + sqrt(C*(1-x)/x)
A = C00 + A10
B = K3
C = K1
->
x = (1/(A^4 + 2*A^2*C + C^2))*(A^2*B + A^2*C - B*C + C^2 + 2*sqrt(A^4*B*C - A^2*B^2*C + A^2*B*C^2))
always decreasing. only crosses zero once for positive x.

E2)
A = sqrt(B/(1-x)) + sqrt(C*x/(1-x))
A = B10 + C10
B = K2
C = K3
->
x = (1/(A^4 + 2*A^2*C + C^2))*(A^4 - A^2*B + A^2*C + B*C + 2*sqrt(A^4*B*C - A^2*B^2*C + A^2*B*C^2))
always increasing. only crosses zero once for positive x.

E3)
A = sqrt(B*x) + sqrt(C*(1-x))
A = A00 + B00
B = K1
C = K2
x = (1/(B^2 + 2*B*C + C^2))*(A^2*B - A^2*C + B*C + C^2 +/- 2*sqrt(A^2*B*C - A^2*B^2*C + A^2*B*C^2))
second derivative is always negative



                      */
                    var A00 = market1[4];
                    var A10 = market1[7];
                    var B00 = market2[4];
                    var B10 = market2[7];
                    var C00 = market3[4];
                    var C10 = market3[7];
                    //console.log(JSON.stringify([[A00, A10], [B00, B10], [C00, C10]]));
                    var K1 = A00 * A10;
                    var K2 = B00 * B10;
                    var K3 = C00 * C10;
                    //console.log(JSON.stringify([K1, K2, K3]));
                    var X = B10 + C10;
                    var Y = A10 + C00;

                    var A = C00 + A10;
                    var B = K3;
                    var C = K1;
                    var P_lower_limit = (1/(Math.pow(A, 4) + 2*A*A*C + C*C))*(A*A*B + A*A*C - B*C + C*C + 2*Math.sqrt(A*A*A*A*B*C - A*A*B*B*C + A*A*B*C*C));
                    //var P_lower_limit = (K1+K3)/((C00 + A10)^2 + K3);
                    A = B10 + C10;
                    B = K2;
                    C = K3;
                    //var P_upper_limit = ((B10 + C10)^2 - K2) / ((B10 + C10)^2 + K3);
                    var P_upper_limit = (1/(Math.pow(A, 4) + 2*A*A*C + C*C))*(Math.pow(A, 4) - A*A*B + A*A*C + B*C + 2*Math.sqrt(Math.pow(A, 4)*B*C - A*A*B*B*C + A*A*B*C*C));
                    if(P_lower_limit > P_upper_limit) {
                        console.log(P_lower_limit);
                        console.log(P_upper_limit);
                        console.log("impossible error");
                        return(0);
                    };
                    var Pl = P_lower_limit;
                    var Pu = P_upper_limit;
                    console.log(JSON.stringify([Pl, Pu]));

                    var C1 = Math.sqrt(Pl*K1) + Math.sqrt((1-Pl)*K2);
                    var C2 = Math.sqrt(Pu*K1) + Math.sqrt((1-Pu)*K2);
                    var P;
                    console.log(JSON.stringify([C1, C2]));
                    if(C1 > C2) {
                        P = Pu;
                    } else {
                        P = Pl;
                    };
                    //P = (Pu + Pl)/2;
                    //P = 1-P;
                    A01 = Math.sqrt(P*K1);
                    B01 = Math.sqrt((1-P)*K2);
                    C01 = Math.sqrt((1-P)*K3/P);
                    A11 = Math.sqrt(K1/P);
                    B11 = Math.sqrt(K2/(1-P));
                    C11 = Math.sqrt(K3*P/(1-P));
                    /*
                    
                    //console.log(JSON.stringify([X, Y]));
                    //console.log(JSON.stringify(1));
                    //var a = 1;
                    //var b = ((K2*K3/(K1*X*X)) - (2*(Y+(K3/X))));
                    //var c = Math.pow((Y+(K3/X)), 2);

                    var a = (K1*X*X - (K2*K3));
                    var b = -(K1*K3*X - (2*Y*K1*X*X));
                    var c = (Y*Y*X*X*K1 + (K1*K3*K3) + (K1*K3*X*Y));
                    
                    var A11H = Math.sqrt(b*b - (4*a*c));
                    var A11a = (-b + A11H)/(2*a);
                    var A11b = (-b - A11H)/(2*a);
                    var A11 = Math.max(A11a, A11b);
                    var A01 = K1 / A11;
                    var C01 = (A10 + C00) - A11;
                    var C11 = K3 / C01;
                    var B11 = B10 + C10 - C11;
                    var B01 = K2 / B11;
                    */
                    market1[4] = A01;
                    market1[7] = A11;
                    market2[4] = B01;
                    market2[7] = B11;
                    market3[4] = C01;
                    market3[7] = C11;
                    console.log(JSON.stringify(
                        [[A01, A11],[B01, B11],[C01,C11]]));
                    var price1 = A01/A11;
                    var price2 = B01/B11;
                    var price3 = C11 / C01;
                    var price3b = price1/price2;
                    if(Math.abs(price3-price3b)>0.0001){
                        console.log(price3);
                        console.log(price3b);
                        console.log("bad market mix");
                        return(0);
                    }
                    var txs2 = [];
                    if(A01 > A00){
                        console.log("buy type 2 in market 1");
                        console.log(A01 - A00);
                        txs2 = txs2.concat([
                            ["market_swap_tx",
                             0,0,0, mid1,
                             Math.ceil(A01 - A00),
                             Math.floor((A10 - A11)*trading_fee),
                             1,
                             SourceCID, SourceType,
                             CID, 1]]);
                    } else if (A01 < A00){
                        console.log("buy type 1 in market 1");
                        console.log(A11 - A10);
                        txs2 = txs2.concat([
                            ["market_swap_tx",
                             0,0,0, mid1,
                             Math.ceil(A11 - A10),
                             Math.floor((A00 - A01)*trading_fee),
                             2,
                             SourceCID, SourceType,
                             CID, 1]]);
                    };
                    if(B01 > B00){
                        console.log("buy type 2 in market 2");
                        console.log(B01 - B00);
                        txs2 = txs2.concat([
                            ["market_swap_tx",
                             0,0,0, mid2,
                             Math.ceil(B01 - B00),
                             Math.floor((B10 - B11)*trading_fee),
                             1,
                             SourceCID, SourceType,
                             CID, 2]]);
                    } else if (B01 < B00){
                        console.log("buy type 1 in market 2");
                        console.log(B11 - B10);
                        txs2 = txs2.concat([
                            ["market_swap_tx",
                             0,0,0, mid2,
                             Math.ceil(B11 - B10),
                             Math.floor((B00 - B01)*trading_fee),
                             2,
                             SourceCID, SourceType,
                             CID, 2]]);
                    };
                    if(C01 > C00){
                        console.log("buy type 2 in market 3");
                        console.log(C01 - C00);
                        txs2 = txs2.concat([
                            ["market_swap_tx",
                             0,0,0, mid3,
                             Math.ceil(C01 - C00),
                             Math.floor((C10 - C11)*trading_fee),
                             1,
                             CID, 1,
                             CID, 2]]);
                    } else if (C01 < C00){
                        console.log("buy type 1 in market 3");
                        console.log(C11 - C10);
                        txs2 = txs2.concat([
                            ["market_swap_tx",
                             0,0,0, mid3,
                             Math.ceil(C11 - C10),
                             Math.floor((C00 - C01)*trading_fee),
                             2,
                             CID, 1,
                             CID, 2]]);
                    };
                    //console.log(JSON.stringify(swap_txs));
                    //console.log(JSON.stringify(txs2));
                    return(lookup_price3(swap_txs, txs2, Amount, (A01/A11), mid1, mid2, mid3, CID, SourceCID, SourceType, market1, market2, market3, SpentCurrency));
                });
            });
        });
    };
    function lookup_price3(swap_txs, arb_txs, amount, price, mid1, mid2, mid3, cid, source_cid, source_type, market1, market2, market3, SpentCurrency) {
        //var B = amount * (1-price)*(1-price)/(2 - (4*price) - (price*price));

        var mida;
        var typea;
        var marketa;
        var starta;
        if(price > 0.5) {
            mida = mid1;
            typea = 1;
            marketa = market1;
            starta = market3[7];
        } else {
            mida = mid2;
            typea = 2;
            marketa = market2;
            price = 1-price;
            starta = market3[4];
        };
        /*
          T = total to spend*
          B = portion to turn to subcurrency
          P3 = price in market 3 
          PA = price in the market with the more valuable subcurrency and with veo.*
          I3 = amount of the more expensive currency to invest in market 3 
          IA = amount of source to invest in marketa. 

A          IA + B = T   //unconverted source is put into a market
B          IA/(B-I3) = PA //definition of price in marketa. a number < 1, >0.5.
C          P3 = (1-PA)/PA //we can calculate the price in market3 based on the price in the other market. A number >0 and < 0.5
D          P3 = I3/B // definition of price in market3


IA + B = T
IA/(B-I3) = PA
(1-PA)/PA = I3/B
-> I3 = B(1-PA)/PA


IA + B = T
IA/(B-(B(1-PA)/PA)) = PA
->
IA/(B(1-((1-PA)/PA)) = PA
IA/(B(((PA-1+PA)/PA)) = PA
IA/(B(((2PA-1)/PA)) = PA
IA*PA/(B*(2PA-1)) = PA
IA = B*(2PA-1)


IA + B = T
IA = B*(2PA-1)
-> B(1+(2PA-1)) = T
->B = T/2/PA


         */
        //var B = amount*(price / (price + ((1 + price) * (1 - price))));
        //var B = amount*(price / (price + ((1 + price) * (1 - price))));
        //var B = amount * (1-price)*(1-price)/(2 - (4*price) - (price*price));
        var B = amount / 2 / price;
        //var B = amount / 2 / price;
        //console.log(JSON.stringify([B, B/amount, amount, price]));
        var V = amount - B;
        //var A1 = V/price;
        var A1 = V*price;
        //xvar A2 = B - A1;
        //console.log(JSON.stringify([A1, A2]));
        //var A1 = B*(1 - price);
        //var A2 = B*price;

//in the market between 2 subcurrencies, invest B and A2.
        //in the market between source and the more valuable currency, invest (T-B) source, and A1 of the more valuable kind.
        var B0 = Math.ceil(B);
        var B1 = Math.floor(B*trading_fee);
        var A1 = Math.floor(A1*trading_fee);
        //var A1 = Math.floor(A1);
        var liquidity_txs = [
            ["contract_use_tx", 0,0,0,
             cid, B0, 2, source_cid, source_type],
            ["market_liquidity_tx",0,0,0,
             mid3,Math.floor((B1/(starta))*market3[8]),cid,1,cid,2],
            ["market_liquidity_tx",0,0,0,
             mida,Math.floor((V/(marketa[4]))*marketa[8]),source_cid,
             source_type,cid,typea]
        ];
        //console.log(JSON.stringify(txs));
        //console.log(price);
        //console.log(amount);
        var full_txs = swap_txs
            .concat(arb_txs)
            .concat(liquidity_txs);
        multi_tx.make(full_txs, function(tx){
            console.log(JSON.stringify(tx));
            //calculate loss/gain info, and display it.
            var markets = [market1, market2, market3];
            var loss = tabs.swap.calculate_loss(SpentCurrency, full_txs, markets) - tabs.swap.calculate_gain(SpentCurrency, full_txs, markets);
            var loss1 = tabs.swap.calculate_loss([cid, 1], full_txs, markets) - tabs.swap.calculate_gain([cid, 1], full_txs, markets);
            var loss2 = tabs.swap.calculate_loss([cid, 2], full_txs, markets) - tabs.swap.calculate_gain([cid, 2], full_txs, markets);

            var gain1 = tabs.swap.calculate_gain([mid1, 0], full_txs, markets);
            var gain2 = tabs.swap.calculate_gain([mid2, 0], full_txs, markets);
            var gain3 = tabs.swap.calculate_gain([mid3, 0], full_txs, markets);
            console.log(JSON.stringify([loss, loss1, loss2//,
                                        //gain1, gain2, gain3
                                       ]));
            display.innerHTML = "you can sell "
                .concat((loss / token_units()).toString())
                .concat(" to gain <br>")
                .concat((gain1 / token_units()).toString())
                .concat(" of liquidity shares type 1 <br>")
                .concat((gain2 / token_units()).toString())
                .concat(" of liquidity shares type 2 <br>")
                .concat((gain3 / token_units()).toString())
                .concat(" of liquidity shares type 3 <br>")
                .concat("");
            var stx = keys.sign(tx);
            publish_tx_button.onclick = function(){
                post_txs([stx], function(msg){
                    display.innerHTML = msg;
                    keys.update_balance();
                });
            };
        });
    };
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
        cid = tabs.swap.contract_to_cid(contracts[0]); 
        rpc.post(["read", 3, cid], function(oracle_text) {
            //console.log(contracts[0]);
            //console.log(cid);
            if(!(oracle_text == 0)) {
                var type = oracle_text[0];
                var text = atob(oracle_text[1]);
                //console.log(text);
                //console.log(JSON.stringify(oracle_text));
                var TickerBool =
                    tabs.is_ticker_format(text);
                if(TickerBool){
                    text = tabs.decode_ticker(text);
                } else {
                    //text = atob(oracle_text[1]);
                }
                if((!(hide_non_standard)) || TickerBool){
                    var mid = new_market.mid(cid, cid, 1, 2);
                    s = s
//                    .concat("id: ")
//                    .concat(cid)
                    //.concat("oracle question: \"")
                        .concat("\"")
                        .concat(text)
                        .concat("\"~ ")
                    //                    .concat(type)
                        .concat("; volume: ")
                        .concat((contracts[0][11] / token_units()).toString())
                        .concat("<button onclick=\"tabs.pool.cid('")
                        .concat(cid)
                        .concat("');\"> pool</button>")
//                        .concat("<button onclick=\"tabs.swap.cid('")
//                        .concat(cid)
//                        .concat("'); tabs.swap.type(2);\"> short</button>")
//                        .concat("<button onclick=\"tabs.swap.cid('")
//                        .concat(mid)
//                        .concat("'); tabs.swap.type(0);\"> pool</button>")
                        .concat("<br>")
                        .concat("");
                };
            }
            display_contracts2(div, contracts.slice(1), s);
        }, get_ip(), 8090);
    };
    
    return({
        cid: function(x){ contract_id.value = x}
    });
};
/*

    
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

*/
