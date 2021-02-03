(function(){
    var ZERO = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = "159.89.87.58";
    };
    const urlParams = new URLSearchParams(window.location.search);
    var txid = urlParams.get('txid');
    txid = txid.replace(/\ /g, "+");

    div.appendChild(br());
    var block_height_div = document.createElement("div");
    block_height_div.innerHTML = "this tx was included in block ???";
    div.appendChild(block_height_div);
    div.appendChild(br());

    rpc.post(["txs", txid], function(tx){
        var tx = tx[1];
        var block = tx[2];
        block_height_div.innerHTML = "this tx was included in block "
            .concat(block.toString());
        var raw = tx[3];
        console.log(JSON.stringify(raw[1]));
        display_txs([raw[1]]);
    }, get_ip(), 8091); 

    function display_txs(txs){
        if(txs.length === 0) {
            return(0);
        };
        var tx = txs[0];
        var type = tx[0];
        var tx_text = document.createElement("div");
        div.appendChild(tx_text);
        if(type === "oracle_close"){
            tx_text.innerHTML = "Closes oracle "
                .concat(tx[4])
                .concat("<br>");
        } else if (type === "multi_tx"){
            display_txs(tx[4].slice(1));
        } else if (type === "oracle_new"){
            var question = tx[4];
            var start = tx[5];
            var oid = tx[6];
            var gov = tx[8];
            var gov_amount = tx[9];
            tx_text.innerHTML = "New Oracle. <br>"
                .concat("asks: \"")
                .concat(atob(question))
                .concat("\", <br> starts: ")
                .concat(start.toString())
                .concat(", <br> oracle id: ")
                .concat(oid)
                .concat("<br><br>");
        } else if (type === "oracle_bet"){
            var oid = tx[4];
            var direction = tx[5];
            if(direction === 1){
                direction = "true";
            } else if (direction === 2){
                direction = "false";
            } else if (direction === 3){
                direction = "bad question";
            };
            var amount = tx[6];
            tx_text.innerHTML = "Oracle Report. <br>"
                .concat("oracle id: ")
                .concat(oid)
                .concat("<br> type: ")
                .concat(direction)
                .concat("<br> amount: ")
                .concat((amount/100000000).toFixed(8))
                .concat("<br><br>");
        } else if (type === "spend") {
            var to = tx[4];
            var amount = tx[5];
            var link = document.createElement("a");
            link.href = "account_explorer.html?pubkey="
                .concat(to);
            link.innerHTML = to;
            link.target = "_blank";
            tx_text.innerHTML = "Spend. <br>"
                .concat("to: ")
                //.concat(to)
            tx_text.appendChild(link);
            var span = document.createElement("span");
            span.innerHTML = ""
                .concat("<br> amount: ")
                .concat((amount/100000000).toFixed(8))
                .concat("<br><br>");
            tx_text.appendChild(span);
        } else if (type === "create_acc_tx"){
            var to = tx[4];
            var amount = tx[5];
            var link = document.createElement("a");
            link.href = "account_explorer.html?pubkey="
                .concat(to);
            link.innerHTML = to;
            link.target = "_blank";
            tx_text.innerHTML = "Create Account. <br>"
                .concat("to: ")
                //.concat(to)
            tx_text.appendChild(link);
            var span = document.createElement("span");
            span.innerHTML = ""
                .concat("<br> amount: ")
                .concat((amount/100000000).toFixed(8))
                .concat("<br><br>");
            tx_text.appendChild(span);

        } else if (type === "unmatched"){
            var oid = tx[4];
            tx_text.innerHTML = "Oracle Unmatched. <br>"
                .concat("oracle id: ")
                .concat(oid)
                .concat("<br><br>");
        } else if (type === "oracle_winnings"){
            var oid = tx[4];
            tx_text.innerHTML = "Oracle Winnings. <br>"
                .concat("oracle id: ")
                .concat(oid)
                .concat("<br><br>");

        } else if (type === "contract_use_tx"){
            var cid = tx[4];
            var amount = tx[5];
            var link = make_contract_link(cid);
            tx_text.innerHTML =
                "Use a Contract. <br>"
                .concat("amount: ")
                .concat((amount/100000000).toFixed(8))
                .concat("</br> cid: ");
            tx_text.appendChild(link);
            tx_text.appendChild(br());
            tx_text.appendChild(br());
        } else if (type === "contract_new_tx"){
            var contract_hash = tx[2];
            var many_types = tx[4];
            var source = tx[5];
            var source_type = tx[6];
            var cid = binary_derivative.id_maker(
                contract_hash, many_types,
                source, source_type);
            tx_text.innerHTML = "New Contract. <br> cid: ";
            var link = document.createElement("a");
            link.href = "contract_explorer.html?cid="
                .concat(cid);
            link.innerHTML = (cid);
            link.target = "_blank";
            tx_text.appendChild(link);
            tx_text.appendChild(br());
            tx_text.appendChild(br());
        } else if (type === "sub_spend_tx"){
            var to = tx[4];
            var amount = tx[5];
            var cid = tx[6];
            var kind = tx[7];
            var link = document.createElement("a");
            link.href = "contract_explorer.html?cid="
                .concat(cid);
            link.innerHTML = (cid);
            link.target = "_blank";
            tx_text.innerHTML =
                "Spend Subcurrency. <br>"
                .concat("amount: ")
                .concat((amount / 100000000).toFixed(8))
                .concat("<br> kind: ")
                .concat(kind.toString())
                .concat("<br> cid: ");
            tx_text.appendChild(link);
            tx_text.appendChild(br());
            tx_text.appendChild(br());
        } else if (type === "contract_evidence_tx"){
            var contract = tx[4];
            var cid = tx[5];
            var evidence = tx[6];
            var prove = tx[7];
            console.log(JSON.stringify([
                cid, contract, evidence, prove
            ]));
            var link = make_contract_link(cid);
            tx_text.innerHTML =
                "Contract Evidence. <br>"
                .concat("cid: ");
            tx_text.appendChild(link);
            tx_text.appendChild(br());
            tx_text.appendChild(br());
        } else if (type === "contract_timeout_tx"){
            var cid = tx[4];
            var proof = tx[5];
            var contract_hash = tx[6];
            var row = tx[7];
            console.log(JSON.stringify([
                cid, proof, contract_hash, row
            ]));
            var link = make_contract_link(cid);
            tx_text.innerHTML =
                "Contract Timeout. <br>"
                .concat("cid: ");
            tx_text.appendChild(link);
            tx_text.appendChild(br());
            tx_text.appendChild(br());
        } else if (type === "contract_winnings_tx"){
            var cid = tx[4];
            var amount = tx[5];
            var sub_account = tx[6];
            var winner = tx[7];
            var proof = tx[8];
            var row = tx[9];
            var link = make_contract_link(cid);
            tx_text.innerHTML =
                "Contract Winnings. <br>"
                .concat("cid: ");
            tx_text.appendChild(link);
            tx_text.appendChild(br());
            tx_text.appendChild(br());
        } else if (type === "contract_simplify_tx"){
            var cid1 = tx[4];
            var cid2 = tx[5];
            var cid3 = tx[6];
            var m1 = tx[7];
            var m2 = tx[8];
            tx_text.innerHTML =
                "Contract Simplify. <br><br>";
        } else if (type === "swap_tx2"){
            var match_parts = tx[5];
            var offer = tx[4][1];
            var acc1 = offer[1];
            var cid1 = offer[4];
            var type1 = offer[5];
            var amount1 = offer[6];
            var cid2 = offer[7];
            var type2 = offer[8];
            var amount2 = offer[9];
            var parts = offer[12];
            var portion = match_parts / parts;
            var link1 = make_contract_link(cid1);
            var link2 = make_contract_link(cid2);
            tx_text.innerHTML =
                "Limit Order Swap. <br>"
                .concat("cid1: ");
            tx_text.appendChild(link1);
            var more1 = document.createElement("span");
            more1.innerHTML = "<br> type1: "
                .concat(type1)
                .concat("<br> amount1: ")
                .concat((amount1*portion/100000000).toFixed(8))
                .concat("<br> cid2: ");
            tx_text.appendChild(more1);
            tx_text.appendChild(link2);
            var more2 = document.createElement("span");
            more2.innerHTML = "<br> type2: "
                .concat(type2)
                .concat("<br> amount2: ")
                .concat((amount2*portion/100000000).toFixed(8));
            tx_text.appendChild(more2);
            tx_text.appendChild(br());
            tx_text.appendChild(br());

        } else if (type === "market_new_tx"){
            var cid1 = tx[4];
            var cid2 = tx[5];
            var type1 = tx[6];
            var type2 = tx[7];
            var amount1 = tx[8];
            var amount2 = tx[9];
            var link1 = make_contract_link(cid1);
            var link2 = make_contract_link(cid2);
            tx_text.innerHTML =
                "New Market. <br>"
                .concat("cid1: ");
            tx_text.appendChild(link1);
            var more1 = document.createElement("span");
            more1.innerHTML = "<br> type1: "
                .concat(type1)
                .concat("<br> amount1: ")
                .concat((amount1/100000000).toFixed(8))
                .concat("<br> cid2: ");
            tx_text.appendChild(more1);
            
            tx_text.appendChild(link2);
            var more2 = document.createElement("span");
            more2.innerHTML = "<br> type2: "
                .concat(type2)
                .concat("<br> amount2: ")
                .concat((amount2/100000000).toFixed(8));
            tx_text.appendChild(more2);
            tx_text.appendChild(br());
            tx_text.appendChild(br());
        } else if (type === "market_swap_tx"){
            var mid = tx[4];
            var give = tx[5];
            var take = tx[6];
            var direction = tx[7];
            link = document.createElement("a");
            link.href = "market_explorer.html?mid="
                .concat(mid);
            link.innerHTML = mid;
            link.target = "_blank";
            tx_text.innerHTML = "Market Swap. <br>"
                .concat("give: ")
                .concat((give/100000000).toFixed(8))
                .concat("<br> take: ")
                .concat((take/100000000).toFixed(8))
                .concat("<br> direction: ")
                .concat(direction)
                .concat("<br> market: ");
            tx_text.appendChild(link);
            tx_text.appendChild(br());
            tx_text.appendChild(br());
        } else if (type === "market_liquidity_tx"){
            var mid = tx[4];
            var amount = tx[5];
            link = document.createElement("a");
            link.href = "market_explorer.html?mid="
                .concat(mid);
            link.innerHTML = mid;
            link.target = "_blank";
            tx_text.innerHTML = "Market Liquidity. <br>"
                .concat("amount: ")
                .concat((amount/100000000).toFixed(8))
                .concat("<br> market: ");
            tx_text.appendChild(link);
            tx_text.appendChild(br());
            tx_text.appendChild(br());
        } else if (type === "trade_cancel_tx"){
            var salt = tx[4];
            tx_text.innerHTML = "Trade Cancel. <br><br>";
        };

        return(display_txs(txs.slice(1)));

    };

    function make_contract_link(cid1){
        var link1;
        if(cid1 === ZERO){
            link1 = document.createElement("span");
            link1.innerHTML = "veo";
        } else {
            link1 = document.createElement("a");
            link1.href = "contract_explorer.html?cid="
                .concat(cid1);
            link1.innerHTML = cid1;
            link1.target = "_blank";
        }
        return(link1);
    };

})();
