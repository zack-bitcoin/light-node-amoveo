var swaps = (function(){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var fee = 200000;
/*
-record(swap_offer, {
          acc1, start_limit, end_limit, salt,
          amount1, cid1, type1, %this is what acc1 gives.
          amount2, cid2, type2, %this is what acc2 gives.
          fee1, %what acc1 pays in fees
          nonce}).
-record(swap_offer2, {
          acc1, start_limit, end_limit,
          cid1, type1, amount1, 
          cid2, type2, amount2,
          salt, start_nonce, parts}).
*/
    function all_defined(C){
        var l = [
            "acc1", "end_limit",
            "amount1", "amount2"
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
        var salt;
        if(!(C.salt)){
            salt = btoa(random_cid(32));
        } else {
            salt = C.salt;
        };
        var pm = 1;
        if(C.partial_match){
            pm = 1000000;
        };
        var serialized_offer =
            ["swap_offer2", C.acc1,
             C.start_limit,
             C.end_limit,
             C.cid1, C.type1, C.amount1,
             C.cid2, C.type2, C.amount2,
             salt, 1, pm];
        /*
        var serialized_offer =
            ["swap_offer", C.acc1,
             C.start_limit,
             C.end_limit, salt, C.amount1,
             C.cid1, C.type1, C.amount2,
             C.cid2, C.type2, C.fee1,
             C.nonce
            ];
        */
        //console.log(JSON.stringify(serialized_offer));
        var signed_so = keys.sign(serialized_offer);
        return(signed_so);
    };
    function unpack(SO) {
//-record(swap_tx, {from, offer, fee}).
        //-record(swap_tx2, {from, nonce, fee, offer, match_parts}).
        var b = verify1(SO);
        if(!b){
            console.log("bad signature on offer");
            return(0);
        };
        var offer = SO[1];
        var swap_type = offer[0];
        if(swap_type === "swap_offer") {
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
            R.type = 1;
            return(R);
        } else if(swap_type === "swap_offer2") {
            var R = {};
            R.acc1 = offer[1];
            R.start_limit = offer[2];
            R.end_limit = offer[3];
            R.cid1 = offer[4];
            R.type1 = offer[5];
            R.amount1 = offer[6];
            R.cid2 = offer[7];
            R.type2 = offer[8];
            R.amount2 = offer[9];
            R.salt = offer[10];
            R.nonce = offer[11];
            R.parts = offer[12];
            R.type = 2;
            return(R);
        };
    };
    async function make_tx(SO, matched_parts, callback) {
        if(SO === 0) {
            console.log("swap offer is 0?");
            1+1n;
        };
        var fee = 200000;
//-record(swap_tx, {from, offer, fee}).
//-record(swap_tx2, {from, nonce, fee, offer, match_parts}).
        //var swap_tx = ["swap_tx", keys.pub(), SO, fee];
        var from_acc = await rpc.apost(["account", keys.pub()]);
        var Nonce = from_acc[2] + 1;
        var swap_tx = ["swap_tx2", keys.pub(), Nonce, fee, SO, matched_parts];
        //instead of immediately accepting the swap, we should check what currencies this person owns.
        //sell as much as you can of your own, and buy more as needed to complete their trade. If you do not have the source currency to buy more, then fail and give an error message.
        var R = unpack(SO);
        var CID = R.cid2;
        var Type = R.type2;
        var Amount = R.amount2;
        make_txs2(CID, Type, Amount, function(Txs){
            if(Txs == "error"){
                console.log("error");
                return(0);
            };
            if(Txs == []) {
                callback(swap_tx);
            } else {
                //console.log(JSON.stringify(Txs));
                Txs = [swap_tx].concat(Txs);
                //console.log(JSON.stringify(Txs));
                callback(Txs);
            };
        });
    };
    async function make_txs2(CID, Type, Amount, callback){
        if(!(CID)){
            console.log("what cid to use?");
            1+1n;
        };
        var fee = 200000;
        if(Type == 0){//they want veo
            var Acc = await merkle.arequest_proof("accounts", keys.pub());
            callback([]);
               // if(Acc[1] > Amount){
                //callback([]);//we have enough of the veo they want.
                /*} else {
                    console.log("not enough veo error");
                    console.log(Acc);
                    console.log(Amount);
                    callback("error");
                }
                */
        } else {//they want a subcurrency
            var SKey = btoa(array_to_string(sub_accounts.key(keys.pub(), CID, Type)));
            var SA = await merkle.arequest_proof("sub_accounts", SKey);
            var bal;
            if((SA == "empty")||(SA.length === 2)){
                bal = 0
            } else {
                bal = SA[1];
            }
            if(bal >= Amount){//we have enough of the subcurrency they want
                callback([]);
            } else {//we don't have enough of what they want. maybe we can buy more?
                var Contract = await merkle.arequest_proof("contracts", CID);
                var z = await rpc.apost(["read", 3, CID], get_ip(), 8090);
                var Source, SourceType, MT;
                var new_contract_tx = [];
                if((Contract == "empty")||(Contract.length < 3)){
                    if(!(z)){
                        console.log("need to teach the contract to the server first.")
                        return(0);
                    };
                    //console.log("contract doesn't yet exist");
                    if(z[0] == "scalar"){
                        MT = 2;
                        Source = z[5];
                        SourceType = z[6];
                    } else if (z[0] == "binary"){
                        MT = 3;
                        Source = z[4];
                        SourceType = z[5];
                    } else if (z[0] === "contract"){
                        //buy veo offer
                        MT = 2;
                        Source = z[2];
                        SourceType = z[3];
                    } else {
                        console.log("server gave us a contract format we don't understand.");
                        return(0);
                    };
                    //console.log(z);
                    //1+1n;
                    //z: ["scalar", "MT0x", 0,1, [], "AAAAAA...", 0]
//-record(scalar, {text, height, max_price, now, source = <<0:256>>, source_type = 0}).
                    //ch = hash:doit(compiler_chalang:doit(<<"macro...">>));
                    var CH = scalar_derivative.hash(
                        scalar_derivative.maker(atob(z[1]), z[3]));
                    new_contract_tx = [["contract_new_tx", 0,CH,0, MT, Source, SourceType]];
                } else {
                    Source = Contract[8];
                    SourceType = Contract[9];
                    MT = Contract[2];
                }
                if(!(Number.isInteger(bal))){
                    console.log("bal isn't a number");
                    console.log(bal);
                    1+1n;
                };
                var Tx = ["contract_use_tx", 0, 0, 0, CID, Amount - bal, MT, Source, SourceType];
                var txs = new_contract_tx.concat([Tx]);
                //make_txs2(Source, SourceType, Amount - bal, function(L){return(callback(L.concat([Tx])))});
                make_txs2(Source, SourceType, Amount - bal, function(L){return(callback(L.concat(txs)))});
            };
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
    function id_maker(acc, salt){
        var TID = btoa(array_to_string(hash(
            string_to_array(
                atob(acc))
                .concat(string_to_array(
                    atob(salt))))));
        return(TID);
    };
    function offer_99(offer){
        var offer99 = {};
        offer99.start_limit = offer.start_limit;
        offer99.end_limit = offer.end_limit + 12000;
        offer99.amount1 = offer.amount2;
        offer99.amount2 = Math.round((offer.amount2 * 0.995) - (fee*5));//new oracle, oracle report, oracle close, withdraw winnings, oracle winnings
        offer99.cid1 = offer.cid2;
        offer99.cid2 = ZERO;
        offer99.type2 = 0;
        offer99.acc1 = keys.pub();
        offer99.partial_match = true;
        offer99.type1 = offer.type2;
        return(offer99);
    };
    function accept_99(offer){
        /*
        var offer99 = {};
        offer99.start_limit = offer.start_limit;
        offer99.end_limit = offer.end_limit + 1;
        offer99.amount1 = offer.amount2;
        offer99.amount2 = Math.round((offer.amount2*0.995) - (fee*5));//new oracle, oracle report, oracle close, withdraw winnings, oracle winnings
        offer99.cid1 = offer.cid2;
        offer99.cid2 = ZERO;
        offer99.type2 = 0;
        offer99.acc1 = keys.pub();
        offer99.partial_match = true;
        */
        var offer99 = offer_99(offer);
        offer99.type1 = 3 - offer.type2;
        return(offer99);
    };
    return({test: test, pack: pack,
            offer_99: offer_99,
            accept_99: accept_99,
            unpack: unpack, make_tx: make_tx,
            id_maker: id_maker});
})();
