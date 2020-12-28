(function(){
    var ZERO = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    var div = document.createElement("div");
    document.body.appendChild(div);
    var contracts_div = document.createElement("div");
    document.body.appendChild(contracts_div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = "159.89.87.58";
    };
    //const urlParams = new URLSearchParams(window.location.search);
    console.log(get_ip());
    rpc.post(["contracts", 100], function(contracts){
        //console.log(JSON.stringify(contracts));
        contracts_div.innerHTML = "";
        return(display_contracts(contracts.slice(1)));
    //}, get_ip(), 8091);//8091 is explorer
    }, "0.0.0.0", 8091);//8091 is explorer
    function display_contracts(contracts){
        if(contracts.length < 1){
            return(0);
        };
        var contract = contracts[0];
        var source = contract[8];
        var source_type = contract[9];
        var cid = contract_to_cid(contract);
        console.log("here");
        rpc.post(["read", 3, cid], function(oracle_text) {
            console.log([cid, source, source_type]);
            price_estimate_read(cid, source, source_type, function(p_est, liquidity){
                var oracle_text_2;
                console.log(oracle_text);
                if(oracle_text === 0){
                    s = s
                    oracle_text_2 = "unknown oracle text";
                } else {
                    oracle_text_2 = atob(oracle_text[1]);
                };
                var oracle_text_3;
                var ticker_bool =
                    tabs.is_ticker_format(text);
                var p = document.createElement("span");
                var s = "oracle: "
                if(ticker_bool){
                    s = s
                        .concat(tabs.decode_ticker(oracle_text_2, p_est, "stablecoin"));
                    p.innerHTML = s;
                    contracts_div.appendChild(p);
                        //long_text = tabs.decode_ticker(text, p_est, "long-veo");

                } else {
                    oracle_text_3 = oracle_text_2;
                    s = s
                        .concat(oracle_text_3);
                    p.innerHTML = s;
                    contracts_div.appendChild(p);
                    contracts_div.appendChild(br());
                    var price_info = document.createElement("span");
                    price_info.innerHTML = "price = "
                        .concat((p_est).toFixed(8));
                    contracts_div.appendChild(price_info);
                    contracts_div.appendChild(br());
                };
                var s = "oracle: "
                    .concat(oracle_text_3);
                var cid_link = document.createElement("a");
                cid_link.href = "contract_explorer.html?cid="
                    .concat(cid);
                cid_link.innerHTML = "more details";//" shares ";
                cid_link.target = "_blank";
                //p.innerHTML = s;
                //contracts_div.appendChild(p);
                contracts_div.appendChild(cid_link);
                contracts_div.appendChild(br());
                contracts_div.appendChild(br());
                
                setTimeout(function(){
                    display_contracts(contracts.slice(1));
                }, 100);
            });
            //});
        }, "0.0.0.0", 8090);//8091 is p2p_derivatives
            //                   });
    };

})();
