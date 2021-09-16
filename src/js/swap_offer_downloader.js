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
        //[[contract, [[tid, signed_offer]...]]...]
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
        if(!(contract)){
            return(rest());
        };
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

    async function subaccounts(
        contract_type, filter, contract_api, other_sids
    ){
        //returns [[cid, sa, contract]...]
        var account = await rpc.apost(
            ["account", keys.pub()],
            IP, 8091);
        //console.log(JSON.stringify(account));
        if(account === "error"){
            return([]);
        };
        account = account[1];
        var subs = account[3];
        //console.log("subs 1");
        //console.log(subs);
        if(IP === "0.0.0.0"){
            var txs = await rpc.apost(["txs"]);
            txs = txs.slice(1);
            //console.log(JSON.stringify(txs));

            //for the sell veo tool.
            var subs2 = txs
                .filter(function(stx){
                    return((stx[1][0] === "multi_tx") &&
                            //(stx[1][1] === keys.pub()) &&
                           (stx[1][4][3]) &&
                           (stx[1][4][3][0] === "contract_use_tx"));
                })
                .map(function(stx){
                    return(stx[1][4][3][4]);
                           //(stx[1][0] === "contract_timeout_tx2")
                });

                    
            //console.log("subs 2");
            //console.log(JSON.stringify(subs2));
            subs = subs
                .concat(subs2);
        };
        if(other_sids){
            subs = subs.concat(other_sids);
        };
        var r = await subaccounts2(
            subs.slice(1).reverse(),
            contract_type,
            filter,
            contract_api, 
            []);
        return(r);
    
    };
    function is_in(x, l){
        if(l.length === 0){
            return(false);
        };
        if(x === l[0]){
            return(true);
        };
        return(is_in(x, l.slice(1)));
    };
    function remove_duplicates(l){
        if(l.length === 0){
            return([]);
        };
        var h = l[0];
        var t = l.slice(1);
        var b = is_in(h, t);
        var r = remove_duplicates(t);
        if(b){
            return(r);
        } else {
            return([h].concat(r));
        };
    };
    async function subaccounts2(
        subs, contract_type, filter, contract_api, r)
    {
        if(subs.length === 0){
            return(r);
        };
        subs = remove_duplicates(subs);
        var callback = async function(){
            return(subaccounts2(
                subs.slice(1),
                contract_type,
                filter,
                contract_api,
                r))};
        var cid = subs[0];
        var id = sub_accounts.normal_key(
            keys.pub(), cid, contract_type);
        var sa = await sub_accounts.arpc(id);
        if(sa === 0){
            return(callback());
        };
        var balance = sa[1];
        if(balance < 100000){
            return(callback());
        };
        var contract = await contract_api(cid);
        //var contract = await rpc.apost(
        //    ["read", 3, cid], IP, 8090);
        //let contract = await buy_veo_contract.verified_p2p_contract(cid); //todo
        if(contract === 0){
            return(callback());
        };
    //}
        var bool = await filter(contract);
        if(!(bool)) {
            return(callback());
        };
        return(subaccounts2(
            subs.slice(1), contract_type,
            filter, contract_api, [[cid, sa, contract, bool]].concat(r)));
    };

    return({doit: doit,
            subaccounts: subaccounts});
})();
