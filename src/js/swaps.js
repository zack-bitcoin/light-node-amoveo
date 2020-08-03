var swaps = (function(){
/*
-record(swap_offer, {
          acc1, nonce, start_limit, end_limit, 
          amount1, cid1, type1, %this is what acc1 gives.
          amount2, cid2, type2, %this is what acc2 gives.
          fee1, %what acc1 pays in fees
          fee2}).
*/
    function all_defined(C){
        var l = [
            "acc1", "end_limit",
            "amount1", "amount2",
            "fee1", "fee2"
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
             C.fee2
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
//        R.nonce = offer[2];
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
        R.fee2 = offer[12];
        return(R);
    };
    function make_tx(SO) {
        var offer = SO[1];
        var fee1 = offer[11];
        var fee2 = offer[12];
        var fee = fee1 + fee2;
        console.log([fee1, fee2, fee]);
        return(["swap_tx", keys.pub(), SO, fee]);
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
            fee1: 200000,
            fee2: 200000
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
