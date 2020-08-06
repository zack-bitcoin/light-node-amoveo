

var pair_buy = (function(){
//binary derivative contract based on a single oracle. 
//    var static_binary_derivative = atob("AAAAAAF4gxSDFhSDFhSDFAAAAAAghwAAAAABeTpGRw1IFBQAAAAAAYcWFAIAAAADAAAAFoYAAAAAAzpGhACAAAAAFoIAf////xaCiAAAABOIAAAAAAFHFAAAAAABOkaEAP////8WggAAAAAAFoKIRxQAAAAAAjpGhAAAAAAAFoIA/////xaCiEcUFIQAgAAAABaCAH////8WgohISAAAAAAAAAAAA+hI");
    var static_binary_derivative = atob("AAAAAAF4gxSDFhSDFhSDFAAAAAAghwAAAAABeTpGRw1IFBQAAAAAAYcWFAIAAAADAAAAFoYAAAAAAzpGhAAAAAAAFoIAAAAAABaCAP////8WgogAAAAAAAAAAAPoRxQAAAAAATpGhAD/////FoIAAAAAABaCAAAAAAAWgogAAAAAAAAAAAPoRxQAAAAAAjpGhAAAAAAAFoIA/////xaCAAAAAAAWgogAAAAAAAAAAAPoRxQUhACAAAAAFoIAf////xaCAAAAAAAWgogAAAATiAAAAAAKSEhI");

//    static_binary_derivative = array_to_string(
//        [1,255,255,255,255,3,0,132,130,130,3,0,3,100]);
    //int 0, max, nil, cons, cons, 0, 100
/*
OID ! 
macro [ nil ; 
macro , swap cons ; 
macro ] swap cons reverse ; 
macro even_split [ int 2147483648 , int 2147483647 ] ; 
macro maximum int 4294967295 ; 
 car drop car swap drop car swap drop car drop 
int 32 split 
 OID @ 
 == if else fail then 
drop drop int 1 split swap drop binary 3 AAAA swap ++ 
int 3 == if 
even_split int 5000 int 1 
else drop 
  int 1 == if 
    [ maximum , int 0 ] 
    else drop 
    int 2 == if 
      [ int 0 , maximum ] 
      else drop drop 
      even_split 
      then 
    then 
  int 0 int 1000 
then 
*/
    function all_defined(C){
        var l =
            ["oracle_start_height",
             "oracle_text",
             "subs1",
             "subs2",
             "from",
             "nonce",
             "end_limit",
             "amount1",
             "amount2",
             "fee1",
             "fee2"];
        for(var i = 0; i < l.length; i++){
            if(!(C[l[i]])){
                console.log("error in all_defined. This is not defined: ");
                console.log(l[i]);
                return(false);
            };
        };
        return(true);
    };

    function pack_oracle_binary_bet_offer(C) {
        if(!(all_defined(C))){
            return(0);
        };
        if(!(C.source_id)){
            C.source_id = btoa(integer_to_array(0, 32));
            C.source_type = 0;
        };
        if(!(C.start_limit)){
            C.start_limit = Math.max(0, headers_object.top()[1] - 5);
        }
        //var code = static_binary_derivative;
        var contract_hash = contract_hash_maker(C.oracle_start_height, C.oracle_text);
        var many_types = 2;
/*        var to_hash = 
            string_to_array(atob(contract_hash))
            .concat(string_to_array(atob(C.source_id)))
            .concat(integer_to_array(many_types, 2))
            .concat(integer_to_array(C.source_type, 2));
*/
        var new_id = contract_id_maker(contract_hash, many_types);
        //calculate new_id from C.many_types and contract_hash
        var salt = random_cid(32);
        var serialized_offer = 
            ["pair_buy_offer", C.from,
             C.start_limit, C.end_limit,
             C.source_id, C.source_type,
             contract_hash, new_id,
             btoa(salt),
             C.amount1, C.fee1,
             C.amount2, C.fee2,
             C.subs1, C.subs2, C.nonce
            ];
        var signed_so = keys.sign(serialized_offer);
        return([signed_so, btoa(C.oracle_text), C.oracle_start_height, [-6, 1]]);//the 1 is the type. this is a binary derivative, so it is type 1. scalar is 2.
    };
    function id_maker2(oracle_id, many_types) {
        var ch = contract_hash_maker2(oracle_id);
        return(contract_id_maker(ch, many_types));
    };
    function contract_id_maker(
        contract_hash, many_types,
        source_id, source_type)
    {
        if(!(source_id)){
            source_id = btoa(array_to_string(integer_to_array(0, 32)));
            source_type = 0;
        };
        console.log(source_id);
        return(btoa(array_to_string(hash(
            string_to_array(atob(contract_hash))
                .concat(string_to_array(atob(source_id)))
                .concat(integer_to_array(many_types, 2))
                .concat(integer_to_array(source_type, 2))
        ))));

    }


    function unpack_oracle_binary_bet_offer(Offer0) {
        var SO = Offer0[0];
        var b = verify1(SO);
        if(!b) {
            console.log("bad signature on offer");
            return(0);
        };
        var offer = SO[1];
        var R = {};
        R.oracle_text = atob(Offer0[1]);
        R.oracle_start_height = Offer0[2];
        R.from = offer[1];
        R.start_limit = offer[2];
        R.end_limit = offer[3];
        R.source_id = offer[4];
        R.source_type = offer[5];
        R.contract_hash = offer[6];
        var contract_hash = contract_hash_maker(R.oracle_start_height, R.oracle_text);
        if(!(R.contract_hash == contract_hash)){
            console.log(R.contract_hash);
            console.log(contract_hash);
            console.log("bad contract hash");
            return(0);
        }
        R.new_id = offer[7];
        R.salt = offer[8];
        R.amount1 = offer[9];
        R.fee1 = offer[10];
        R.amount2 = offer[11];
        R.fee2 = offer[12];
        R.subs1 = offer[13];
        R.subs2 = offer[14];
        R.nonce = offer[15];
        return(R);
    };
    
    function make_tx(SO) {
        var offer = SO[1];
        var fee1 = offer[10];
        var fee2 = offer[12];
        var fee = fee1 + fee2;
        return(["pair_buy_tx", keys.pub(), SO, fee]);
    };
    
    function contract_maker(start_height, oracle_text) {
        var oracle_id = id_maker(start_height, 0, 0, oracle_text);//from format
        return(contract_maker2(oracle_id));
    }
    function contract_maker2(oracle_id) {
        var serialized_oracle_id = string_to_array(atob(oracle_id));
        var full_code = array_to_string(([2,0,0,0,32]).concat(serialized_oracle_id)).concat(static_binary_derivative);
        return(btoa(full_code));
        
    };
    function contract_hash_maker(start_height, oracle_text) {
        //var oracle_id = id_maker(start_height, 0, 0, oracle_text);//from format
        //return(contract_hash_maker2(oracle_id));
        var c = contract_maker(start_height, oracle_text);
        return(btoa(array_to_string(hash(string_to_array(atob(c))))));
    }
    function contract_hash_maker2(oracle_id){
        var c = contract_maker2(oracle_id);
        return(btoa(array_to_string(hash(string_to_array(atob(c))))));
        //var serialized_oracle_id = string_to_array(atob(oracle_id));
        //var full_code = array_to_string(([2,0,0,0,32]).concat(serialized_oracle_id)).concat(static_binary_derivative);
        //return(btoa(array_to_string(hash(string_to_array(full_code)))));
    }
    function test(){
        var full = btoa(array_to_string([255,255,255,255]));
        var empty = btoa(array_to_string([0,0,0,0]));
        rpc.post(["account", keys.pub()], function(my_acc){
            var Nonce = my_acc[2] + 1;
            if(!(Nonce)){
                console.log("You don't have an account with money");
                return(0);
            };
            var C = {
                from: keys.pub(),
                nonce: Nonce,
                start_limit: 0,
                end_limit:100,
                oracle_start_height:10,
                oracle_text: btoa("1=1"),
                amount1: 10000000,
                amount2: 10000000,
                fee1: 200000,
                fee2: 200000,
                subs1: [full, empty],
                subs2: [empty, full],
            };
            var X = pack_oracle_binary_bet_offer(C);
            var Y = unpack_oracle_binary_bet_offer(X);
            //console.log(JSON.stringify(X));
            console.log(JSON.stringify(C));
            console.log(JSON.stringify(Y));
        })};
    return({test: test, pack_binary: pack_oracle_binary_bet_offer, unpack_binary: unpack_oracle_binary_bet_offer, make_tx: make_tx, id_maker: contract_id_maker, id_maker2: id_maker2, contract2: contract_maker2})
})();
