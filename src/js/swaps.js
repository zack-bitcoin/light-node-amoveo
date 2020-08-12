var swaps = (function(){
/*
-record(swap_offer, {
          acc1, nonce, start_limit, end_limit, 
          amount1, cid1, type1, %this is what acc1 gives.
          amount2, cid2, type2, %this is what acc2 gives.
          fee1, %what acc1 pays in fees
          }).
*/
    function all_defined(C){
        var l = [
            "acc1", "end_limit",
            "amount1", "amount2",
            "fee1"
        ];
        for(var i = 0; i < l.length; i++){
            if(!(C[l[i]])){
                console.log("error in all_defined. This is not defined: ");
                console.log(l[i]);
                return(false);
            };
        };
        return(true);
    };
    function pack(C) {
        if(!(all_defined(C))){
            return(0);
        };
        if((C.cid1 == C.cid2) &&
           (C.type1 == C.type2)){
            console.log("can't swap for the same thing");
            return(0);
        }
        if(!(C.cid1)){
            C.cid1 = btoa(array_to_string(integer_to_array(0, 32)));
            C.type1 = 0;
        };
        if(!(C.cid2)){
            C.cid2 = btoa(array_to_string(integer_to_array(0, 32)));
            C.type2 = 0;
        };
        if(!(C.start_limit)){
            C.start_limit = Math.max(0, headers_object.top()[1] - 5);
            if(!(C.start_limit)){
                C.start_limit = 0;
            };
        };
        var salt = btoa(random_cid(32));
        var serialized_offer =
            ["swap_offer", C.acc1,
             C.start_limit,
             C.end_limit, salt, C.amount1,
             C.cid1, C.type1, C.amount2,
             C.cid2, C.type2, C.fee1,
             C.nonce
            ];
        var signed_so = keys.sign(serialized_offer);
        return(signed_so);
    };
    function unpack(SO) {
        var b = verify1(SO);
        if(!b){
            console.log("bad signature on offer");
            return(0);
        };
        var offer = SO[1];
        var R = {};
        R.acc1 = offer[1];
        R.start_limit = offer[2];
        R.end_limit = offer[3];
        R.salt = offer[4];
        R.amount1 = offer[5];
        R.cid1 = offer[6];
        R.type1 = offer[7];
        R.amount2 = offer[8];
        R.cid2 = offer[9];
        R.type2 = offer[10];
        R.fee1 = offer[11];
        R.nonce = offer[12];
        return(R);
    };
    function make_tx(SO, callback) {
        var fee = 200000;
        var swap_tx = ["swap_tx", keys.pub(), SO, fee];
        //instead of immediately accepting the swap, we should check what currencies this person owns.
        //sell as much as you can of your own, and buy more as needed to complete their trade. If you do not have the source currency to buy more, then fail and give an error message.
        var R = unpack(SO);
        var CID = R.cid2;
        var Type = R.type2;
        var Amount = R.amount2;
        console.log("make txs1");
        make_txs2(CID, Type, Amount, function(Txs){
            if(Txs == "error"){
                console.log("error");
                return(0);
            };
            if(Txs == []) {
                callback(swap_tx);
            } else {
                console.log(Txs);
                Txs = [swap_tx].concat(Txs);
                callback(Txs);
/*                
                Txs = zero_accounts_nonces(Txs);
                merkle.request_proof("accounts", keys.pub(), function(Acc){
                    var Nonce = Acc[2] + 1;
                    callback(["multi_tx", keys.pub(), Nonce, fee*2, [-6].concat(Txs)]);
                });
*/
            };
        });
    };
    function make_txs2(CID, Type, Amount, callback){
        console.log("make txs2");
        var fee = 200000;
        if(Type == 0){//they want veo
            merkle.request_proof("accounts", keys.pub(), function(Acc){
                if(Acc[1] > Amount){
                    callback([]);//we have enough of the veo they want.
                } else {
                    console.log("not enough veo error");
                    console.log(Acc);
                    console.log(Amount);
                    callback("error");
                }
            });
        } else {//they want a subcurrency
            console.log([keys.pub(), CID, Type]);
            var SKey = btoa(array_to_string(sub_accounts.key(keys.pub(), CID, Type)));
            console.log(SKey);
            merkle.request_proof("sub_accounts", SKey, function(SA){
                console.log(SA);
                var bal;
                if(SA == "empty"){
                    bal = 0
                } else {
                    bal = SA[1];
                }
                if(bal >= Amount){//we have enough of the subcurrency they want
                    callback([]);
                } else {//we don't have enough of what they want. maybe we can buy more?
                    merkle.request_proof("contracts", CID, function(Contract){
                        var Source, SourceType;
                        if(Contract == "empty"){
                            console.log("contract doesn't yet exist");
                            SourceType = 0;
                            Source = btoa(array_to_string(integer_to_array(0, 32)));
                        } else {
                            console.log(Contract);
                            Source = Contract[8];
                            SourceType = Contract[9];
                        }
                        var Tx = ["contract_use_tx", 0, 0, 0, CID, Amount - bal, 3, Source, SourceType];
                        //return([Tx].concat(make_txs2(Source, SourceType, Amount - bal)));
                        make_txs2(Source, SourceType, Amount - bal, function(L){return(callback([Tx].concat(L)))});
                    });
                };
            });
        };
    };

    function test(){
        var C = {
            acc1: keys.pub(),
//            nonce: 0,
            start_limit: 0,
            end_limit: 10,
            amount1: 1000,
            amount2: 1000,
            cid2: btoa(array_to_string(hash([1]))),
            type2: 1,
            fee1: 200000
        };
        console.log(C);
        var X = pack(C);
        console.log(X[1]);
        var Y = unpack(X);
        console.log(JSON.stringify(Y));
        return(0);
    };
    return({test: test, pack: pack, unpack: unpack, make_tx: make_tx});
})();
