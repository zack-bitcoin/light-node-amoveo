(function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        //server_ip.value = "159.89.87.58";
        server_ip.value = default_ip();
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
    var info = document.createElement("div");
    div.appendChild(info);
    var closable = document.createElement("div");
    div.appendChild(closable);
    var tx_links = document.createElement("div");
    div.appendChild(tx_links);
    tx_links.innerHTML = "Txs related to this oracle<br>";

    //blocks until closable
    rpc.post(["oracles", oid], function(oracle){
        rpc.post(["height"], function(height){

            var closable_text = "";

            var type;
            if(oracle[5] === 1){
                type = "true";
            } else if (oracle[5] === 2){
                type = "false";
            } else if (oracle[5] === 3){
                type = "bad question";
            }
            closable_text = "<br>current type: "
                .concat(type)
                .concat("<br>");
            

            if(oracle[2] === 0){
                closable_text = closable_text
                    //closable.innerHTML =
                        .concat("<br>closable in: ")
                .concat((oracle[9]-height).toString())
                    .concat(" blocks<br><br>");
            } else {
                var result;
                if(oracle[2] === 1){
                    result = "true";
                } else if (oracle[2] === 2){
                    result = "false";
                } else if (oracle[2] === 3){
                    result = "bad question";
                };
                closable_text = closable_text
                //closable.innerHTML =
                    .concat("<br> result was: ")
                    .concat(result)
                    .concat("<br><br>");
            }
            closable.innerHTML = closable_text;
        });
    });
    
    rpc.post(["oracles", oid], function(oracle){
        console.log(oracle);
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
        info.innerHTML = "oracle asks: "
            .concat(question)
            //.concat("<br><br>type: ")
            //.concat(type)
            .concat("<br><br>stake: ")
            .concat((stake / 100000000).toFixed(8))
            .concat("<br><br>last referenced in block height: ")
            .concat(height.toString());
            //.concat("<br><br>Txs related to this oracle");
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
        tx_links.appendChild(link);
        tx_links.appendChild(br());
        return(make_tx_links(txs.slice(1)));
    };

})();
