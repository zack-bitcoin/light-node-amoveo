var multi_tx = (function(){
    function zero_accounts_nonces(L) {
        for(var i=0; i<L.length; i++){
            //WARNING, this version only works on contract_use_tx. the erlang version works on other types too.
            if(L[i][0] == "contract_use_tx"){
                L[i][1] = 0;
                L[i][2] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "contract_new_tx") {
                L[i][1] = 0;
                L[i][3] = 0;
            } else if (L[i][0] == "swap_tx") {
                L[i][1] = 0;
                L[i][3] = 0;
            } else {
                console.log("swaps unhandled case");
                console.log(L[i][0]);
            }
        };
        console.log(JSON.stringify(L));
        return(L);
    };
    function make(Txs, callback){
        if(Txs.length == 1){
            callback(Txs[0]);
            return(0);
        };
        var fee = 152050;
        Txs = zero_accounts_nonces(Txs);
        merkle.request_proof("accounts", keys.pub(), function(Acc){
            var Nonce = Acc[2] + 1;
            callback(["multi_tx", keys.pub(), Nonce, fee*(Txs.length), [-6].concat(Txs)]);
            return(0);
        });

    };
    return({make: make});
})();