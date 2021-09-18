var dex_tools = (function(){
    function lowest_price_order(orders) {
        var r = orders.sort(function(a, b){
            return(a[1] - b[1]);
        });
        return(r[0]);
    };
    function find_market(markets, cid2, type2, cid1, type1){
        if(markets.length === 0){
            return(0);
        };
        var market = markets[0];
        var mcid1 = market[3];
        var mtype1 = market[4];
        var mcid2 = market[5];
        var mtype2 = market[6];
        if((cid2 === mcid2) &&
           (type2 === mtype2) &&
           (cid1 === mcid1) &&
           (type1 === mtype1)){
            return(market);
        }
        return(find_market(markets.slice(1), cid2, type2, cid1, type1));
    };
    async function lowest2(Source, SourceType, cid, IP){
        let markets = await rpc.apost(
            ["markets"], IP, 8090);
        markets = markets.slice(1);
        var market = dex_tools.find_market(
            markets, Source, SourceType, cid, 2);
        if(market === 0){
            //they didn't post their offer to sell for 99% of the value. I guess they want to use an oracle.
            return(cleanup());
        };
        var mid = market[2];
        let market_data = await rpc.apost(
            ["read", mid], IP, 8090);
        market_data = market_data[1];
        var orders = market_data[7].slice(1);
        var order = lowest_price_order(
            orders);
        var tid = order[3];
        let trade = await rpc.apost(
            ["read", 2, tid], IP, 8090);
        return(trade);
    };
    function buy_veo_contract_decoder(contract){
        if(!(contract[0] === "contract")){
            console.log("invalid contract");
            console.log(JSON.stringify(contract));
            return(0);
        };
        return({
            raw: contract,
            cid: contract[1],
            source: contract[2],
            source_type: contract[3],
            choose_address_timeout: contract[4],
            oracle_start_height: contract[5],
            blockchain: atob(contract[6]),
            amount: atob(contract[7]),
            ticker: atob(contract[8]),
            date: atob(contract[9]),
            trade_id: contract[10],
            now: contract[11]
        });
    };
    function sell_veo_contract_decoder(contract){
        var contract_text = atob(contract[1]);
        if(!(contract_text
             .match(/has received less than/))){
            console.log("this is not a sell veo contract");
            return(0);
        };
        var source = contract[5];
        var source_type = contract[6];
        var address = contract_text.match(/address \w*/)[0];
        var receive = contract_text.match(/\d[\.\d]* \w* before/)[0].slice(0,-6);
        var date = contract_text.slice(-21);
        console.log(contract_text);
        console.log(date);
        return({
            text: contract_text,
            source: source,
            source_type: source_type,
            address: address,
            receive: receive,
            date: date
        });
    };
    return({
        find_market: find_market,
        lowest_price_order: lowest_price_order,
        lowest2: lowest2,
        buy_veo_contract_decoder: buy_veo_contract_decoder,
        sell_veo_contract_decoder: sell_veo_contract_decoder
    });
})();
