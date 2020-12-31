(function(){
    var ZERO = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    var div = document.createElement("div");
    var lower_limit;
    var max_range = 1;
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = "159.89.87.58";
        //server_ip.value = "0.0.0.0";
    };
    const urlParams = new URLSearchParams(window.location.search);
    var cid = urlParams.get('cid');
    //console.log(cid);
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
    //var volume_div = document.createElement("div");
    /*
    rpc.post(["contracts", cid], function(contract){
        //from the full node
        contract[11];
        volume_div.innerHTML = "total money invested in this contract: "
            .concat((contract[11] / 100000000).toFixed(8).toString());
    console.log(contract);
    });
    */
    rpc.post(["contracts", cid], function(main_contract){
        console.log(main_contract[11]);
        var x = main_contract[11]/100000000;
        open_interest_div.innerHTML =
            "open interest: "
            .concat(x.toFixed(8));
    });
    rpc.post(["read", 3, cid], function(contract){
        //from p2p derivatives explorer
        //console.log(get_ip());
        //console.log(contract);
        var text = atob(contract[1]);
        max_range = contract[3];
        
        lower_limit = text.match(/minus -?\d+/g);
        //console.log(lower_limit);
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
    }, get_ip(), 8090); 


        //console.log(text);
        //console.log(max_price);

        rpc.post(["contract", cid], function(contract){
        //from the explorer
            contract = contract[1];
            //console.log(JSON.stringify(contract));
            var source = contract[2];
            var source_type = contract[6];
        //var swap_tab = swap_tab_builder();

            setTimeout(function(){
                price_estimate_read(
                    cid, source, source_type,
                    function(price, liquidity){
                        price_div.innerHTML = "current price: "
                            .concat(price.toFixed(3).toString())
                            .concat("<br> estimated result of: ")
                            .concat(((price * max_range) + lower_limit).toFixed(2).toString())
                            .concat("<br> liquidity: ")
                            .concat((liquidity/100000000).toFixed(8).toString());
                    });
            }, 0);
            
            var source_div = document.createElement("div");
            div.appendChild(source_div);
            div.appendChild(open_interest_div);
            //div.appendChild(volume_div);
            var price_div = document.createElement("div");
            div.appendChild(price_div);
            //console.log(source);
            
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
                //source_div.appendChild(source_text);
                //div.appendChild(link);
            };
            var many_types = contract[3];
            var markets = contract[4];
            var markets_title = document.createElement("h4");
            markets_title.innerHTML = "Markets that involve this contract";
            div.appendChild(markets_title);
            make_market_links(markets.slice(1));
            //var txids = contract[5].slice(1);
            //console.log(JSON.stringify(txids));
            //var txs = [];
            /*
            for(var i = 0; i<txids.length; i++){
                rpc.post(["txs", txids[i]], function(tx){
                    console.log(JSON.stringify(tx));
                }, get_ip(), 8091);
            };
            */
            //-record(contract, {cid, source = <<0:256>>, types, markets = [], txs = []}).
            //return(display_contracts2(div, contracts.slice(1), []));
        }, get_ip(), 8091);//8091 is explorer
    function make_market_links(markets){
        //console.log(markets);
        if(markets.length === 0){
            return(0);
        };
        //console.log(markets[0]);
        //rpc.post(["market", markets[0]], function(market){
        rpc.post(["markets", markets[0]], function(market){
            //market = market[1];

            //-record(market, {id, cid1, type1, amount1, cid2, type2, amount2, shares}).
            var mid = market[1];
            var cid1 = market[2];
            var type1 = market[3];
            var amount1 = market[4];
            var cid2 = market[5];
            var type2 = market[6];
            var amount2 = market[7];
            var volume = (Math.sqrt(amount1*amount2) / 100000000).toFixed(8).toString();
            
            //-record(market, {mid, height, volume = 0, txs = [], cid1, type1, cid2, type2, amount1, amount2}).
            /*
            var mid = market[1];
            var volume = market[3];
            var txs = market[4];
            var cid1 = market[5];
            var type1 = market[6];
            var cid2 = market[7];
            var type2 = market[8];
            */
            //console.log(market);

            if(cid1 === cid){
                cid1 = "this";
            };
            if(cid1 === ZERO){
                cid1 = "veo";
                type1 = "";
            };
            if(cid2 === cid){
                cid2 = "this";
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
                .concat(" ")
                //.concat(" cid2: ")
                .concat(cid2)
                .concat(" ")
                //.concat(" type2: ")
                .concat(type2)
                .concat(" liquidity: ")
                .concat(volume)
                .concat("");
            div.appendChild(link);
            div.appendChild(br());

            make_market_links(markets.slice(1));
        });//, get_ip(), 8091);
    };
})();
