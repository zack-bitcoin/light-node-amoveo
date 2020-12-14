/*
The new plan is to first swap to the source of the contract we want liquidity in, 
then we do small trades so all 3 markets have the same price.
then we do a use_contract_tx to buy a set of the subcurrency.
Then 3 market_liquidity_tx to convert our currencies into liquidities.

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


    var buy_label = document.createElement("span");
    buy_label.innerHTML = "which contract to buy liquidity shares in: ";
    pool_tab.appendChild(buy_label);
    var contract_to_buy = document.createElement("select");
    pool_tab.appendChild(contract_to_buy);
    pool_tab.appendChild(br());

    var amount_input = text_input("amount to spend: ", pool_tab);
    pool_tab.appendChild(br());

    //var contract_id = text_input("contract id: ", pool_tab);
    pool_tab.appendChild(br());
    var pool_price_button =
        button_maker2("lookup price to buy liquidity shares", lookup_price);
    var pool_sell_button =
        button_maker2("lookup price to sell all liquidity shares", sell_all);
    var publish_tx_button =
        button_maker2("confirm the trade",
                      function(){
                          display.innerHTML = "lookup the price first";
                          return(0);});
    pool_tab.appendChild(pool_price_button);
    pool_tab.appendChild(pool_sell_button);
    pool_tab.appendChild(publish_tx_button);

    function sell_all(){
        console.log("sell all");
        //var GoalCID = contract_id.value;
        var GoalCID = contract_to_buy.value;
        rpc.post(
            ["contracts", GoalCID],
            function(contract){
                var SourceCID = contract[8];
                var SourceType = contract[9];
                var CID = GoalCID;
                var mid1 = new_market.mid(SourceCID, CID, SourceType, 1);
                var mid2 = new_market.mid(SourceCID, CID, SourceType, 2);
                var mid3 = new_market.mid(CID, CID, 1, 2);
                merkle.request_proof("markets", mid1, function(market1){
                    merkle.request_proof("markets", mid2, function(market2){
                        merkle.request_proof("markets", mid3, function(market3){
                            var markets = [market1, market2, market3];
                            var mid2key = function(m){
                                return(btoa(array_to_string(sub_accounts.key(keys.pub(), m, 0))));
                            };
                            var key1 = mid2key(mid1);
                            var key2 = mid2key(mid2);
                            var key3 = mid2key(mid3);
                            var txs = [];
                            rpc.post(["sub_accounts", key1], function(sa1) {
                                rpc.post(["sub_accounts", key2], function(sa2) {
                                    rpc.post(["sub_accounts", key3], function(sa3) {
                            //merkle.request_proof("sub_accounts", key1, function(sa1) {
                             //   merkle.request_proof("sub_accounts", key2, function(sa2) {
                              //      merkle.request_proof("sub_accounts", key3, function(sa3) {
                                        console.log(JSON.stringify([CID, sa1, sa2, sa3, key1, key2, key3]));
                                        var make_tx = function(mid, sa, market){
                                            if(sa == "empty"){
                                                return([]);
                                            } else {
                                                return([["market_liquidity_tx", 0,0,0,
                                                         mid, 1-sa[1], market[2], market[3],
                                                         market[5], market[6]]]);
                                            };
                                        };
                                        txs = txs.concat(make_tx(mid1, sa1, market1));
                                        txs = txs.concat(make_tx(mid2, sa2, market2));
                                        txs = txs.concat(make_tx(mid3, sa3, market3));
                                        display.innerHTML = sell_ls_msg(txs, markets);
        var cid_link = document.createElement("a");
        cid_link.href = "contract_explorer.html?cid="
            .concat(txs[0][8]);
        cid_link.innerHTML = "lookup contract";
                                        display.appendChild(cid_link);

                                        
                                        console.log(JSON.stringify(txs));
                                        multi_tx.make(txs, function(tx){
                                            var stx = keys.sign(tx);
                                            publish_tx_button.onclick = function(){
                                                post_txs([stx], function(msg){
                                                    display.innerHTML = msg;
                                                    keys.update_balance();
                                                });
                                            };
                                            
                                        });
                                    })
                                });
                            });
                        });
                    });
                });
            });
    };
    function sell_ls_msg(txs, markets) {
        var r = "";
        var currencies = {};//source, sub1, sub2
        console.log(JSON.stringify(txs));
        var loss = [0,0,0];
        for(var i = 0; i<txs.length; i++){
            var id = txs[i][4];
            var loss = -txs[i][5];
            var market =
                tabs.tabs.swap.tab.get_market(id, markets);
            var key1 = [market[2], market[3]];
            var key2 = [market[5], market[6]];
            if(!(currencies[key1])){
                currencies[key1] = 0;
            };
            if(!(currencies[key2])){
                currencies[key2] = 0;
            };
            currencies[key1] += loss*market[4]/market[8];
            currencies[key2] += loss*market[7]/market[8];
        };
        r = ("you can sell all your liquidity shares to receive: <br>");
        //r = r.concat(cid_link);
        for(var k in currencies){
            r = r.concat((currencies[k] / token_units()).toString())
                .concat(" of currency type ")
                .concat((k).toString())
                .concat("<br>");
        };
        console.log(JSON.stringify(currencies));
       /* 
        r = ("you can sell all your liquidity shares to receive: <br>")
            .concat((currencies[0] / token_units()).to_string)
            .concat(" of the source currency. <br>")
            .concat((currencies[1] / token_units()).to_string)
            .concat(" of subcurrency type 1. <br>")
            .concat((currencies[2] / token_units()).to_string)
            .concat(" of subcurrency type 2. <br>");
        for(var i = 0; i<txs.length; i++){
            txs[i][5];
            r = r.concat("you can sell ")
                .concat((-txs[i][5]/token_units()).toString())
                .concat(" of market ")
                .concat(txs[i][4])
                .concat("<br>");
        };
*/
        return(r);
    };
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
        //var GoalCID = contract_id.value;
        var GoalCID = contract_to_buy.value;
        rpc.post(
            ["contracts", GoalCID],
            function(contract){
                var SourceCID = contract[8];
                var SourceType = contract[9];
                var A = Math.round(parseFloat(amount_input.value) * token_units());
                if((CID1 == SourceCID) && (Type1 == SourceType)){
                    return(lookup_price2(A, [], SourceCID, SourceType, GoalCID, [CID1, Type1]));
                };
                tabs.tabs.swap.tab.txs_maker(A, CID1, Type1, SourceCID, SourceType, function(swap_txs){
                    var A2 = tabs.tabs.swap.tab.calculate_gain([SourceCID, SourceType], swap_txs, []);
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
                    var db = JSON.parse(JSON.stringify([market1, market2, market3]));
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
//using wolframalpha to solve for x
A = sqrt(B/x) + sqrt(C*(1-x)/x)
A = C00 + A10
B = K1
C = K3
->
x = (1/(A^4 + 2*A^2*C + C^2))*(A^2*B + A^2*C - B*C + C^2 + 2*sqrt(A^4*B*C - A^2*B^2*C + A^2*B*C^2))
d/dx A(x) is always negative, so it is always decreasing with x. 

E2)
A = sqrt(B/(1-x)) + sqrt(C*x/(1-x))
A = B10 + C10
B = K2
C = K3
->
x = (1/(A^4 + 2*A^2*C + C^2))*(A^4 - A^2*B + A^2*C + B*C - 2*sqrt(A^4*B*C - A^2*B^2*C + A^2*B*C^2))
d/dx A(x) always positive, so it is always increasing with x. 

E3)
A = sqrt(B*x) + sqrt(C*(1-x))
A = A00 + B00
B = K1
C = K2
x = (1/(B^2 + 2*B*C + C^2))*(A^2*B - A^2*C + B*C + C^2 +/- 2*sqrt(A^2*B*C - A^2*B^2*C + A^2*B*C^2))
d/dx d/dx A(x) is always negative, so this could have a hill shape. it could be bigger in the middle, and lower at the edges. or it could be increasing everywhere, or decreasing everywhere.

conditions E1 and E2 give upper and lower limits on the range of possible prices that we can use.
since E3 is concave downwards, we know that the best value will be at one of the ends of this range.

So we only need to check the 2 limits of the range, and go with whichever price is better.
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

                    var A = C00 + A10;
                    var B = K1;
                    var C = K3;
                    var P_lower_limit = (1/(Math.pow(A, 4) + 2*A*A*C + C*C))*(A*A*B + A*A*C - B*C + C*C + 2*Math.sqrt(A*A*A*A*B*C - A*A*B*B*C + A*A*B*C*C));

                    A = B10 + C10;
                    B = K2;
                    C = K3;
                    var P_upper_limit = (1/(Math.pow(A, 4) + 2*A*A*C + C*C))*(Math.pow(A, 4) - A*A*B + A*A*C + B*C - 2*Math.sqrt(Math.pow(A, 4)*B*C - A*A*B*B*C + A*A*B*C*C));

                    if(P_lower_limit > (0.003 + P_upper_limit)) {
                        console.log(P_lower_limit);
                        console.log(P_upper_limit);
                        console.log("impossible error");
                        return(0);
                    };
                    var Pl = P_lower_limit;
                    var Pu = P_upper_limit;
                    console.log(JSON.stringify([Pl, Pu]));
                    var C1 = Math.sqrt(Pl*K1) + Math.sqrt((1-Pl)*K2);//A01 + B01
                    var C2 = Math.sqrt(Pu*K1) + Math.sqrt((1-Pu)*K2);
                    var A1 = Math.sqrt((1-Pl)*K3/Pl) + Math.sqrt(K1/Pl);//C01 + A11
                    var A2 = Math.sqrt((1-Pu)*K3/Pu) + Math.sqrt(K1/Pu);
                    var B1 = Math.sqrt(K2/(1-Pl)) + Math.sqrt(K3*Pl/(1-Pl));//B11 + C11
                    var B2 = Math.sqrt(K2/(1-Pu)) + Math.sqrt(K3*Pu/(1-Pu));
                    var P;
                    //console.log("how much the market's ownership in each share type changes, looking at either price.");
                    //console.log(JSON.stringify([
                    //    [A1 - (C00 + A10), A2 - (C00 + A10)],
                    //    [B1 - (C10 + B10), B2 - (C10 + B10)],
                    //    [C1 - (A00 + B00), C2 - (A00 + B00)],
                    //]));
                    //console.log(JSON.stringify([A00 + B00, C1, C2]));
                    if(C1 > C2) {
                        P = Pu;
                    } else {
                        P = Pl;
                    };

                    A01 = Math.sqrt(P*K1);
                    B01 = Math.sqrt((1-P)*K2);
                    C01 = Math.sqrt((1-P)*K3/P);
                    A11 = Math.sqrt(K1/P);
                    B11 = Math.sqrt(K2/(1-P));
                    C11 = Math.sqrt(K3*P/(1-P));

                    market1[4] = A01;
                    market1[7] = A11;
                    market2[4] = B01;
                    market2[7] = B11;
                    market3[4] = C01;
                    market3[7] = C11;
                    //console.log(JSON.stringify(
                    //    [[A01, A11],[B01, B11],[C01,C11]]));
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
                    if((A01 > A00)&&((A01 - A00)>1)){
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
                    } else if ((A01 < A00)&&((A00 - A01)>1)){
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
                    if((B01 > B00)&&((B01 - B00)>1)){
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
                    } else if ((B01 < B00)&&((B00 - B01)>1)){
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
                    if((C01 > C00)&&((C01 - C00)>1)){
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
                    } else if ((C01 < C00)&&((C00 - C01)>1)){
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
                    var spendmax = 0;
                    txs2.map(function(tx){
                        spendmax = Math.max(spendmax, tx[5]);
                        spendmax = Math.max(spendmax, tx[6]);
                    });
                    txs2 = txs2.concat([
                        ["contract_use_tx",0,0,0,
                         CID, spendmax*2, 2, SourceCID, SourceType]
                    ]);
                    
                    return(lookup_price3(swap_txs, txs2, Amount, (A01/A11), mid1, mid2, mid3, CID, SourceCID, SourceType, market1, market2, market3, SpentCurrency, db));
                });
            });
        });
    };
    function lookup_price3(swap_txs, arb_txs, amount, price, mid1, mid2, mid3, cid, source_cid, source_type, market1, market2, market3, SpentCurrency, db) {
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
        var B = amount / 2 / price;
        var V = amount - B;
        var A1 = V*price;

//in the market between 2 subcurrencies, invest B and A2.
        //in the market between source and the more valuable currency, invest (T-B) source, and A1 of the more valuable kind.
        var B0 = Math.ceil(B);
        var B1 = Math.floor(B);//*trading_fee);
        //var A1 = Math.floor(A1*trading_fee);
        var liquidity_txs = [
            ["contract_use_tx", 0,0,0,
             cid, B0, 2, source_cid, source_type],
            ["market_liquidity_tx",0,0,0,
             mid3,Math.floor((B1/(starta))*market3[8]),cid,1,cid,2],
            ["market_liquidity_tx",0,0,0,
             mida,Math.floor((V/(marketa[4]))*marketa[8]),source_cid,
             source_type,cid,typea]
        ];
        var full_txs = swap_txs
            .concat(arb_txs)
            .concat(liquidity_txs);
        multi_tx.make(full_txs, function(tx){
            console.log(JSON.stringify(tx));
            //calculate loss/gain info, and display it.
            //var markets = db;
            var markets = [market1, market2, market3];
            var loss = tabs.tabs.swap.tab.calculate_loss(SpentCurrency, full_txs, markets) - tabs.tabs.swap.tab.calculate_gain(SpentCurrency, full_txs, markets);
            var loss1 = tabs.tabs.swap.tab.calculate_loss([cid, 1], full_txs, markets) - tabs.tabs.swap.tab.calculate_gain([cid, 1], full_txs, markets);
            var loss2 = tabs.tabs.swap.tab.calculate_loss([cid, 2], full_txs, markets) - tabs.tabs.swap.tab.calculate_gain([cid, 2], full_txs, markets);

            var gain1 = tabs.tabs.swap.tab.calculate_gain([mid1, 0], full_txs, markets);
            var gain2 = tabs.tabs.swap.tab.calculate_gain([mid2, 0], full_txs, markets);
            var gain3 = tabs.tabs.swap.tab.calculate_gain([mid3, 0], full_txs, markets);
            console.log(JSON.stringify([loss, loss1, loss2//,
                                        //gain1, gain2, gain3
                                       ]));
            var source_worth = 0;
            var sub1_worth = 0;
            var sub2_worth = 0;

            source_worth += gain1*market1[4]/market1[8];
            sub1_worth += gain1*market1[7]/market1[8];
            source_worth += gain2*market2[4]/market2[8];
            sub2_worth += gain2*market2[7]/market2[8];
            sub1_worth += gain3*market3[4]/market3[8];
            sub2_worth += gain3*market3[7]/market3[8];

            var sk = sub_accounts.key(keys.pub(), cid, 1);
            sk = btoa(array_to_string(sk));
            console.log(cid);
            console.log(sk);
            console.log(JSON.stringify(Object.keys(tabs.balances_db)));
            console.log(JSON.stringify(tabs.balances_db[sk]));
            var type1string = ""
                .concat((sub1_worth / token_units()).toString())
                .concat(" of subcurrency type 1. <br>");
            
            if((tabs.balances_db[sk] &&
                tabs.balances_db[sk].ticker_symbol))
            {
                var limit = tabs.balances_db[sk].limit;
                type1string = ""
                    .concat((limit * sub1_worth / token_units()).toString())
                    .concat(" of ")
                    .concat(tabs.balances_db[sk].ticker_symbol)
                    .concat(" <br>");
            };
            
            display.innerHTML = "you can sell "
                .concat((loss / token_units()).toString())
                .concat(" of the source currency to gain liquidity shares that are currently worth: <br>")
                .concat((source_worth / token_units()).toString())
                .concat(" of source currency. <br>")
                .concat(type1string)
                //.concat((sub1_worth / token_units()).toString())
                //.concat(" of subcurrency type 1. <br>")
                .concat((sub2_worth / token_units()).toString())
                .concat(" of subcurrency type 2. <br>")
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
            //console.log(JSON.stringify(contracts));
            var s = "<h4>existing contracts</h4>";
            return(display_contracts2(div, contracts.slice(1), s));
        }, get_ip(), 8091);//8091 is explorer
    };
    function display_contracts2(div, contracts, s) {
        //console.log(JSON.stringify(contracts));
        if(contracts.length < 1) {
            //console.log(s);
            //div.innerHTML = s;
            return(0);
        }
        //var cid = contracts[0][1];
        //var cid = tabs.swap.contract_to_cid(contracts[0]);
        var cid = tabs.tabs.swap.tab.contract_to_cid(contracts[0]);
        var source = contracts[0][8];
        var source_type = contracts[0][9];
        rpc.post(["read", 3, cid], function(oracle_text) {
            //tabs.swap.price_estimate_read(cid, source, source_type, function(p_est){
            //tabs.tabs.swap.tab.price_estimate_read(cid, source, source_type, function(p_est){
            price_estimate_read(cid, source, source_type, function(p_est){
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
                    text = tabs.decode_ticker(text, p_est, "stablecoin");
                } else {
                    //text = atob(oracle_text[1]);
                }


                if((!(hide_non_standard)) || TickerBool){
                    var mid = new_market.mid(cid, cid, 1, 2);
                    var option = document.createElement("option");
                    option.value = cid;
                    contract_to_buy.appendChild(option);
                    option.innerHTML = ""
                        .concat("\"")
                        .concat(text)
                        .concat("\"~ ")
                        .concat("; volume: ")
                        .concat((contracts[0][11] / token_units()).toString());
                    s = s
                        .concat("\"")
                        .concat(text)
                        .concat("\"~ ")
                        .concat("; volume: ")
                        .concat((contracts[0][11] / token_units()).toString())
                        //.concat("<button onclick=\"tabs.pool.cid('")
                        .concat("<button onclick=\"tabs.tabs.pool.tab.cid('")
                        .concat(cid)
                        .concat("');\"> pool</button>")
                        .concat("<br>")
                        .concat("");
                };
            }
                display_contracts2(div, contracts.slice(1), s);
            });
        }, get_ip(), 8090);
    };
    
    return({
        //cid: function(x){ contract_id.value = x}
    });
};

