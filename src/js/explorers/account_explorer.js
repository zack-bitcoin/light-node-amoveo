(async function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = default_ip();
    };
    const urlParams = new URLSearchParams(window.location.search);
    var pubkey = urlParams.get('pubkey');
    pubkey = pubkey.replace(/\ /g, "+");

    div.appendChild(br());

    var pubkey_text = document.createElement("div");
    pubkey_text.innerHTML = "pubkey: "
        .concat(pubkey);
    div.appendChild(pubkey_text);

    var balance_text = document.createElement("div");
    balance_text.innerHTML = "balance: ?";
    div.appendChild(balance_text);

    var account = await rpc.apost(
        ["account", pubkey]);
    var balance = account[1];
        
    balance_text.innerHTML = "balance: "
        .concat((balance/100000000).toFixed(8));

    var account = await rpc.apost(
        ["account", pubkey], get_ip(), 8091);
    var acc = account[1];
    console.log(acc);
    var txs = acc[2];
    var sub_accs = acc[3];
    var liquidity_shares = acc[4];
    var worker_for = acc[5].slice(1);
    var boss_of = acc[6].slice(1);

    function link(ref, text){
        var link = document.createElement("a");
        link.href = ref;
        link.innerHTML = text;
        link.target = "_blank";
        return(link);
    };
    
    if (worker_for.length > 0){
        //make links for all the workers.
        div.appendChild(title("has jobs"));
        worker_for.map(function(id){
            var s = "";
            s = s.concat(id);
            s = s.concat(" <br> ");
            var l = link("../jobs_explorer.html?id=".concat(id), s);
            div.appendChild(l);
        });
        div.appendChild(br());
    };
    if (boss_of.length > 0) {
        //make links for all the bosses.
        div.appendChild(title("has employees"));
        boss_of.map(function(id){
            var s = "";
            s = s.concat(id);
            s = s.concat(" <br> ");
            var l = link("../jobs_explorer.html?id=".concat(id), s);
            div.appendChild(l);
        });
        div.appendChild(br());
    };
    div.appendChild(title("transactions starting with the most recent"));
    make_tx_links(txs.slice(1));

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
