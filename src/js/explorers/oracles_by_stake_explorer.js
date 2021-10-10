(async function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = default_ip();
    };
    div.appendChild(br());
    var oracles = await rpc.apost(["oracles", 4], get_ip(), 8091);
    oracles = oracles.slice(1);
    loop(oracles);

    function loop(oracles) {
        if(oracles.length === 0){
            return(0);
        };
        oracle = oracles[0];
        var height = oracle[2];
        var question = atob(oracle[4]);
        var stake = oracle[5];
        var closed = oracle[7];
        var info = document.createElement("div");
        info.innerHTML = "oracle asks: "
            .concat(question)
            .concat("<br>stake: ")
            .concat((stake/100000000).toFixed(8))
            .concat("<br>last referenced in block height: ")
            .concat(height.toString());
        div.appendChild(info);

        link = document.createElement("a");
        link.href = "oracle_explorer.html?oid="
            .concat(oracle[1]);
        link.innerHTML = "view details";
        link.target = "_blank";
        div.appendChild(link);
        div.appendChild(br());
        div.appendChild(br());
        loop(oracles.slice(1));
    };

})();
