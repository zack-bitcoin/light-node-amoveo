(function(){
    var ZERO = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = "159.89.87.58";
    };
    const urlParams = new URLSearchParams(window.location.search);
    var mid = urlParams.get('mid');
    mid = mid.replace(/\ /g, "+");
    rpc.post(["markets", mid], function(market){
        console.log(JSON.stringify(market));
        //-record(market, {id, cid1, type1, amount1, cid2, type2, amount2, shares}).
        var cid1 = market[2];
        var type1 = market[3];
        var amount1 = market[4];
        var cid2 = market[5];
        var type2 = market[6];
        var amount2 = market[7];
        var volume = (Math.sqrt(amount1*amount2) / 100000000).toFixed(8).toString();
        var id_div = document.createElement("div");
        id_div.innerHTML = "market "
            .concat(mid)
            .concat(" liquidity: ")
            .concat(volume);
        div.appendChild(id_div);
        var cid1_link = document.createElement("a");
        cid1_link.href = "contract_explorer.html?cid="
            .concat(cid1);
        cid1_link.innerHTML = "contract 1: "
            .concat(cid1.slice(0, 5))
            .concat("... ")
            .concat(" type: ")
            .concat(type1)
            .concat(" amount: ")
            .concat(amount1)
        div.appendChild(cid1_link);
        div.appendChild(br());
        var cid2_link = document.createElement("a");
        cid2_link.href = "contract_explorer.html?cid="
            .concat(cid2);
        cid2_link.innerHTML = "contract 2: "
            .concat(cid2.slice(0, 5))
            .concat("... ")
            .concat(" type: ")
            .concat(type2)
            .concat(" amount: ")
            .concat(amount2)
        div.appendChild(cid2_link);
        div.appendChild(br());
    });
    /*
      to get the market from the explorer
    rpc.post(["market", mid], function(market){
        market = market[1];
        console.log(JSON.stringify(market));
    }, get_ip(), 8091);
*/
})();
