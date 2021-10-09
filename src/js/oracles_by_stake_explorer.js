(async function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        //server_ip.value = "159.89.87.58";
        server_ip.value = default_ip();
        //server_ip.value = "0.0.0.0";
    };

    div.appendChild(br());

    //rpc.post(["oracles", 4], function(oracles){
    var oracles = await rpc.apost(["oracles", 4], get_ip(), 8091);
    oracles = oracles.slice(1);
    console.log(JSON.stringify(oracles));
    loop(oracles);
    //}, get_ip(), 8091);

    function loop(oracles) {
        if(oracles.length === 0){
            return(0);
        };
        oracle = oracles[0];
        var height = oracle[2];
        var question = atob(oracle[4]);
        var stake = oracle[5];
        var closed = oracle[7];
        console.log(JSON.stringify(oracle));
        console.log(question);
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
