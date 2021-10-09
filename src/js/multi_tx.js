var multi_tx = (function(){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    function zero_accounts_nonces(L) {
        for(var i=0; i<L.length; i++){
            //WARNING, this version only works on contract_use_tx. the erlang version works on other types too.
            if(L[i][0] == "contract_use_tx"){
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if(L[i][0] == "market_swap_tx"){
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if(L[i][0] == "market_liquidity_tx"){
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if(L[i][0] == "market_new_tx"){
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "contract_new_tx") {
                L[i][1] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "swap_tx") {
                L[i][1] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "swap_tx2") {
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "spend") {
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "create_acc_tx") {
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "unmatched") {
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "oracle_winnings") {
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "contract_winnings_tx") {
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "contract_timeout_tx2") {
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "contract_simplify_tx") {
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else {
                console.log("multi-tx unhandled case");
                console.log(L[i][0]);
            }
        };
        //console.log(JSON.stringify(L));
        return(L);
    };
    function vol_estimate(Txs){
        var vol = 0;
        for(var i = 0; i < Txs.length; i++){
            var tx = Txs[i];
            if(tx[0] === "spend"){
                vol += tx[5];
            } else if(tx[0] === "create_acc_tx"){
                vol += tx[5];
            //} else if(tx[0] === "oracle_new"){
            } else if(tx[0] === "oracle_bet"){
                vol += tx[6];
            //} else if(tx[0] === "unmatched"){
            //} else if(tx[0] === "oracle_winnings"){
            //} else if(tx[0] === "oracle_close"){
            } else if(tx[0] === "sub_spend_tx"){
                vol += tx[5];
            //} else if(tx[0] === "contract_timeout_tx2"){
            //} else if(tx[0] === "contract_simplify_tx"){
            //} else if(tx[0] === "contract_winnings_tx"){
            } else if(tx[0] === "contract_use_tx"){
                vol += Math.max(0, tx[5]);
            } else if(tx[0] === "market_new_tx"){
                vol += (tx[8] + tx[9]);
            } else if(tx[0] === "market_liquidity_tx"){
                vol += Math.abs(tx[5]);
            } else if(tx[0] === "market_swap_tx"){
                vol += Math.abs(tx[5]);
            } else if(tx[0] === "swap_tx2"){
                var offer = tx[4][1];
                var volx = Math.round(Math.abs((offer[6] + offer[9])/2));
                if(offer[4] === ZERO){
                    volx = offer[6];
                } else if(offer[7] === ZERO){
                    volx = offer[9];
                };
                vol += Math.abs(volx);
                //Math.round(Math.abs((tx[4][1][6] + tx[4][1][9])/2));
            }
        };
        return(vol);
    };
    /*
    async function pay_dev_tx(Txs, callback) {
        var vol = vol_estimate(Txs);
        console.log(vol);
        var dev = "BL0SzhkFGFW1kTTdnO8sGnwPEzUvx2U2nyECwWmUJPRhLxbPPK+ep8eYMxlTxVO/wnQS5WmsGIKcrPP7/Fw1WVc=";
        var amount = Math.floor(vol / 200);
        if(amount > 10000){
            //spend_tx.make_tx(dev, keys.pub(), amount, function(tx){ return(callback([tx]))});
            var tx = await spend_tx.amake_tx(dev, keys.pub(), amount);
            callback([tx]);
            //function(tx){ return(callback([tx]))});
        } else {
            return(callback([]));
        };
    };
    */
    async function apay_dev_tx(Txs) {
        var vol = vol_estimate(Txs);
        console.log(vol);
        var dev = "BL0SzhkFGFW1kTTdnO8sGnwPEzUvx2U2nyECwWmUJPRhLxbPPK+ep8eYMxlTxVO/wnQS5WmsGIKcrPP7/Fw1WVc=";
        var amount = Math.floor(vol / 400);
        if(amount > 10000){
            //spend_tx.make_tx(dev, keys.pub(), amount, function(tx){ return(callback([tx]))});
            var tx = await spend_tx.amake_tx(dev, keys.pub(), amount)
            return([tx]);
        } else {
            return([]);
        };
    };
    /*
    async function make(Txs, callback){
        var fee = 152050;
        //merkle.request_proof("accounts", keys.pub(), function(Acc){
        //rpc.post(["account", keys.pub()], function(Acc){
        var Acc = await rpc.apost(["account", keys.pub()]);
            //console.log(Acc);
        var Nonce = Acc[2] + 1;
        pay_dev_tx(Txs, function(txlist){
            Txs = Txs.concat(txlist);//comment out this line to not pay the dev fee.
            Txs = zero_accounts_nonces(Txs);
                //console.log(JSON.stringify(Txs));
                //return(0);
            return(callback(["multi_tx", keys.pub(), Nonce, Math.round(1.1*fee*(Txs.length)), [-6].concat(Txs)]));
        });
    };
    */
    async function amake(Txs){
        var fee = 152050;
        //merkle.request_proof("accounts", keys.pub(), function(Acc){
        //rpc.post(["account", keys.pub()], function(Acc){
        var Acc = await rpc.apost(["account", keys.pub()]);
            //console.log(Acc);
        var Nonce = Acc[2] + 1;
        var txlist = await apay_dev_tx(Txs);
        Txs = Txs.concat(txlist);//comment out this line to not pay the dev fee.
        Txs = zero_accounts_nonces(Txs);
                //console.log(JSON.stringify(Txs));
                //return(0);
        return(["multi_tx", keys.pub(), Nonce, Math.round(1.1*fee*(Txs.length)), [-6].concat(Txs)]);
    };
    return({//make: make,
            amake: amake});
})();
