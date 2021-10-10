(async function(){
    var ZERO = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    var div = document.getElementById("contract_div");
    var lower_limit;
    var max_range = 1;
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = default_ip();
    };
    const urlParams = new URLSearchParams(window.location.search);
    var cid = urlParams.get('cid');
    cid = cid.replace(/\ /g, "+");

    if(cid === ZERO){
        var veo_div = document.createElement("div");
        div.appendChild(veo_div);
        veo_div.innerHTML = "This is the base currency for Amoveo. it is called 'VEO'.";
        return(0);
    }

    var cid_text = document.createElement("div");
    var text_div = document.createElement("div");
    cid_text.innerHTML = "about contract with cid: "
        .concat(cid);
    div.appendChild(cid_text);
    div.appendChild(text_div);
    var open_interest_div = document.createElement("div");
    var main_contract = await rpc.apost(["contracts", cid]);
    var closed = main_contract[6];
    console.log(JSON.stringify(main_contract));
    var x = main_contract[11]/100000000;
    open_interest_div.innerHTML =
        "open interest: "
        .concat(x.toFixed(8));
    var contract = await rpc.apost(["read", 3, cid], get_ip(), 8090); 
    if(contract[0] === "contract"){
        //buy veo contract
        var s = ""
            .concat(cid)
            .concat(": ")
            .concat(atob(contract[7]))
            .concat(" of ")
            .concat(atob(contract[8]))
            .concat(" in blockchain ")
            .concat(atob(contract[6]))
            .concat(". by date: ")
            .concat(atob(contract[9]));
        text_div.innerHTML = (s);
    } else {
        //scalar veo contract
        console.log(JSON.stringify(contract));
        var text = atob(contract[1]);
        max_range = contract[3];
        
        lower_limit = text.match(/minus -?\d+/g);
        if(lower_limit){
            lower_limit = lower_limit
                .reverse()[0];
            lower_limit = lower_limit.match(/-?\d+/g);
            lower_limit = parseInt(lower_limit, 10);
        } else {
            lower_limit = 0;
        };
        
        text_div.innerHTML = "oracle text: "
            .concat(text)
            .concat("<br> in the range from ")
            .concat(lower_limit)
            .concat(" to ")
            .concat(max_range + lower_limit);
    }
    var e_market_mirror;
    var contract = await rpc.apost(["contract", cid], get_ip(), 8091);//8091 is explorer

    //from the explorer
    contract = contract[1];
    console.log(JSON.stringify(contract));
    var source = contract[2];
    var source_type = contract[6];
    
    setTimeout(async function(){
        [price, liquidity] = await price_estimate_read(
            cid, source, source_type);
        if(closed === 0){
            price_div.innerHTML = "current price: "
                .concat(price.toFixed(3).toString())
                .concat("<br> estimated result of: ")
                .concat(((price * max_range) + lower_limit).toFixed(2).toString())
                        .concat("<br> liquidity: ")
                .concat((liquidity/100000000).toFixed(8).toString());
        } else {
            price_div.innerHTML = "contract has finalized. There is still "
                .concat((liquidity/100000000).toFixed(8).toString())
                .concat(" of veo left in the contract </br>")
            ;
        };
    }, 0);
    
    var source_div = document.createElement("div");
    div.appendChild(source_div);
    div.appendChild(open_interest_div);
    var price_div = document.createElement("div");
    div.appendChild(price_div);
    if(source === ZERO) {
        source_text = "collateral currency: veo";
        source_div.innerHTML = source_text;
    } else {
        var link = document.createElement("a");
        link.href = "?cid=".concat(source);
        link.innerHTML = "source contract";
        link.innerHTML = "collateral: "
            .concat(source)
            .concat(" type: ")
            .concat(source_type);
        source_div.appendChild(link);
    };
    var many_types = contract[3];
    var markets = contract[4];
    console.log(JSON.stringify(markets));
    var markets_title = document.createElement("h4");
    markets_title.innerHTML = "Markets that involve this contract";
    div.appendChild(markets_title);
    var liquidity_lists =
        await make_market_links(
            markets.slice(1),
            []);
    make_bet_links(div, cid);
    var canvas = document.getElementById("theCanvas");
    var ctx = canvas.getContext("2d");
    console.log(JSON.stringify(liquidity_lists));
    var liquidities =
        combine_liquidities(
            liquidity_lists.map(function(x){
                return(x.reverse())
            })
        );
    liquidities = liquidities.reverse();
    market_explorer.draw(e_market_mirror, liquidities, canvas.width, canvas.height, function(
        temp_canvas){
        ctx.drawImage(
            temp_canvas, 0, 0,
            canvas.width, canvas.height
        );
    });
    async function make_market_links(markets, LLs){
        if(markets.length === 0){
            return(LLs);
        };
        var market = await rpc.apost(["markets", markets[0]]);
            //-record(market, {id, cid1, type1, amount1, cid2, type2, amount2, shares}).
        var mid = market[1];
        var cid1 = market[2];
        var type1 = market[3];
        var amount1 = market[4];
        var cid2 = market[5];
        var type2 = market[6];
        var amount2 = market[7];
        var volume = (Math.sqrt(amount1*amount2) / 100000000).toFixed(8).toString();
        var e_market = await rpc.apost(["market", mid], get_ip(), 8091);
        e_market = e_market[1];
        var liquidities = e_market[11].slice(1);
        if(cid1===cid2){
            console.log("cid match");
            e_market_mirror = e_market;
        };
            //-record(market, {mid, height, volume = 0, txs = [], cid1, type1, cid2, type2, amount1, amount2}).
        if(cid1 === cid){
            cid1 = "type";
        };
        if(cid1 === ZERO){
            cid1 = "veo";
            type1 = "";
        };
        if(cid2 === cid){
            cid2 = "type";
        };
        if(cid2 === ZERO){
            cid2 = "veo";
            type2 = "";
        }
        
        var link = document.createElement("a");
        link.href = "market_explorer.html?mid="
            .concat(mid);
        link.innerHTML = ""
            .concat(mid.slice(0, 5))
            .concat("... ")
        //.concat(" cid1: ")
            .concat(cid1)
            .concat(" ")
        //.concat(" type1: ")
            .concat(type1)
            .concat(", ")
        //.concat(" cid2: ")
            .concat(cid2)
            .concat(" ")
        //.concat(" type2: ")
            .concat(type2)
            .concat(", liquidity: ")
            .concat(volume)
            .concat("");
        div.appendChild(link);
        div.appendChild(br());
        return(make_market_links(
            markets.slice(1),
            LLs.concat([liquidities])));
    };
    function make_bet_links(div){

        var bet_links_title = document.createElement("h4");
        bet_links_title.innerHTML = "Bet on this contract";
        div.appendChild(bet_links_title);
        //div.appendChild(br());

        var true_link = document.createElement("a");
        true_link.href = "../wallet/wallet.html?cid_to_buy="
            .concat(cid)
            .concat("&type_to_buy=1");
        true_link.innerHTML = "bet true";
        true_link.target = "_blank";
        div.appendChild(true_link);
        div.appendChild(br());
        var false_link = document.createElement("a");
        false_link.href = "../wallet/wallet.html?cid_to_buy="
            .concat(cid)
            .concat("&type_to_buy=2");

        false_link.innerHTML = "bet false";
        false_link.target = "_blank";
        div.appendChild(false_link);
        div.appendChild(br());
        div.appendChild(br());

    };
    function combine_liquidity_end(
        l, p, total, r
    ){
        if(l.length === 0){
            return(r);
        };
        total += (l[0][2] - p);
        p = l[0][2];
        r = r.concat([[-7, l[0][1], total]]);
        l = l.slice(1);
        return(combine_liquidity_end(
            l, p, total, r));
    };
    function combine_liquidity_pair(
        as, bs, pa, pb, total, r
    ){
        if(as.length === 0){
            return(combine_liquidity_end(
                bs, pb, total, r));
        };
        if(bs.length === 0){
            return(combine_liquidity_end(
                as, pa, total, r))
        };
        if(as[0][1] < bs[0][1]){
            total += (as[0][2] - pa);
            pa = as[0][2];
            r = r.concat([[-7, as[0][1], total]]);
            as = as.slice(1);
        } else {//if (bs[0][1] < as[0][1]) {
            total += (bs[0][2] - pb);
            pb = bs[0][2];
            r = r.concat([[-7, bs[0][1], total]]);
            bs = bs.slice(1);
        };
        return(combine_liquidity_pair(
            as, bs, pa, pb, total, r));
    };
    function combine_liquidities(LLs){
        //needs to be rewritten.
        console.log(JSON.stringify(LLs));
        if(LLs.length === 1){
            return(LLs[0]);
        };
        var next_head = combine_liquidity_pair(
            LLs[0], LLs[1], 0, 0, 0, []
        );
        return(combine_liquidities(
            [next_head].concat(LLs.slice(2))
        ));
    };
})();
