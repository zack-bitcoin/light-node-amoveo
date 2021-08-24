var swap_offer_downloader = (function(){
    var IP = default_ip();

    async function doit(
        market_type2, contract_type){
        var markets = await rpc.apost(["markets"], IP, 8090);
        
        markets = markets.slice(1);
        var orders = await orders_from_markets(
            markets, market_type2, contract_type,
            []);
        //orders [[contract, orders]..]
        return(orders_to_swap_offers(orders, []));
        //[[contract, [[tid, signed_offer]...]...]
    };
    async function orders_to_swap_offers(orders_list, acc){
        if (orders_list.length === 0){
            return(acc);
        };
        //console.log(JSON.stringify(orders_list));
        var hd_order = orders_list[0];
        var contract = hd_order[0];
        var orders = hd_order[1];
        var offers = await orders_to_swap_offers2(orders, []);
        return(orders_to_swap_offers(
            orders_list.slice(1),
            [[contract,offers]].concat(acc)));
    };
    async function orders_to_swap_offers2(
        orders, acc){
        if(orders.length === 0){
            return(acc);
        };
        var tid = orders[0][3];
        var trade =
            await rpc.apost(["read", 2, tid], IP, 8090);
        return(orders_to_swap_offers2(
            orders.slice(1),
            acc.concat([[tid, trade]])));
    };
    async function orders_from_markets(
        markets, market_type2, contract_type,
        acc){
        if(markets.length === 0) {
            return(acc);
        };
        function rest() {
            return(orders_from_markets(
                markets.slice(1),
                market_type2, contract_type, acc));
        };
        var market = markets[0];
        var mid = market[2];
        var cid2 = market[5];
        var type2 = market[6];
        if(type2 && (!(type2 === market_type2))){
            return(rest());
        };
        var contract =
            await rpc.apost(["read", 3, cid2],
                            IP, 8090);
        if(contract === 0){
            return(rest());
        };
        var this_contract_type =
            get_contract_type(contract);
        if(!(this_contract_type ===
             contract_type)){
            return(rest());
        };
        //contract should be a part of the returned data, because we possibly want to filter by whether it is scalar or buy_veo_contract.
        var market_data =
            await rpc.apost(["read", mid], IP, 8090);
        market_data = market_data[1];
        var orders = market_data[7].slice(1);
        return(orders_from_markets(
            markets.slice(1), market_type2,
            contract_type,
            acc.concat([[contract, orders]])));
    };

    function get_contract_type(contract){
        console.log(contract);
        if(contract[0] === "contract"){
            return("buy_veo");
        };
        if(contract[0] === "scalar"){
            var contract_text = atob(contract[1]);
            if(contract_text.match(/has received less than/)){
                return("sell_veo");
            };
            return("scalar");
        };
        return("unknown");
    };


    return({doit: doit});
})();
