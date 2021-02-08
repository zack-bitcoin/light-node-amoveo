(function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = "159.89.87.58";
        //server_ip.value = "0.0.0.0";
    };
    const urlParams = new URLSearchParams(window.location.search);
    var oid = urlParams.get('oid');
    oid = oid.replace(/\ /g, "+");

    div.appendChild(br());

    var oid_text = document.createElement("div");
    oid_text.innerHTML = "oracle id: "
        .concat(oid);
    div.appendChild(oid_text);
    div.appendChild(br());

    
    rpc.post(["oracles", oid], function(oracle){
        oracle = oracle[1];
        var height = oracle[2];
        var txs = oracle[3];
        var question = atob(oracle[4]);
        var stake = oracle[5];
        var type = oracle[6];
        if(type === 1){
            type = "true";
        } else if (type === 2){
            type = "false";
        } else if (type === 3){
            type = "bad question";
        };
        var closed = oracle[7];
        console.log(JSON.stringify(oracle));
        console.log(question);
        var info = document.createElement("div");
        info.innerHTML = "oracle asks: "
            .concat(question)
            .concat("<br><br>type: ")
            .concat(type)
            .concat("<br><br>stake: ")
            .concat((stake / 100000000).toFixed(8))
            .concat("<br><br>last referenced in block height: ")
            .concat(height.toString())
            .concat("<br><br>Txs related to this oracle");
        div.appendChild(info);
        make_tx_links(txs.slice(1));
    }, get_ip(), 8091);
    function make_tx_links(txs){
        if(txs.length === 0){
            return(0);
        };
        var txid = txs[0];
        var link = document.createElement("a");
        link.href = "tx_explorer.html?txid="
            .concat(txid);
        link.innerHTML = txid;
        link.target = "_blank";
        div.appendChild(link);
        div.appendChild(br());
        return(make_tx_links(txs.slice(1)));
    };

})();
