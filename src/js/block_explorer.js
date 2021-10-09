(async function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        //server_ip.value = "159.89.87.58";
        server_ip.value = default_ip();
    };
    const urlParams = new URLSearchParams(window.location.search);
    var hash = urlParams.get('hash');
    hash = hash.replace(/\ /g, "+");

    div.appendChild(br());

    var hash_text = document.createElement("div");
    hash_text.innerHTML = "block hash: "
        .concat(hash);
    div.appendChild(hash_text);

    var block = await rpc.apost(["block", hash], get_ip(), 8091);
    console.log(JSON.stringify(block));
    var block = block[1];
    var height = block[1];
    var height_div = document.createElement("div");
    height_div.innerHTML = "block height: "
        .concat(height);
    div.appendChild(br());
    div.appendChild(height_div);
    div.appendChild(br());
    var txs = block[3];
    make_tx_links(txs.slice(1));
    //}, get_ip(), 8091);

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
