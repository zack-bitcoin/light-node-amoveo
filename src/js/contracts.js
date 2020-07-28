

var contracts = (function(){
//binary derivative contract based on a single oracle. 
    var static_binary_derivative = atob("AAAAAAF4gxSDFhSDFhSDFAAAAAAghwAAAAABeTpGRw1IFBQAAAAAAYcWFAIAAAADAAAAFoYAAAAAAzpGhACAAAAAFoIAf////xaCiAAAABOIAAAAAAFHFAAAAAABOkaEAP////8WggAAAAAAFoKIRxQAAAAAAjpGhAAAAAAAFoIA/////xaCiEcUFIQAgAAAABaCAH////8WgohISAAAAAAAAAAAA+hI");
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

    function pack_oracle_binary_bet_offer(C) {
        if(!(C.source_id)){
            C.source_id = btoa(array_to_string([0,0,0,0]));
            C.source_type = 0;
        };
        var code = static_binary_derivative;
        var contract_hash = contract_hash_maker(C.oracle_start_height, C.oracle_text);
        var many_types = C.subs1.length;
        var new_id = hash(contract_hash.concat(
            integer_to_array(many_types, 4)).concat(
                string_to_array(atob(C.source_id))).concat(
                    integer_to_array(C.source_type, 4)));
        //calculate new_id from C.many_types and contract_hash
        var serialized_offer = 
            ["pair_buy_offer", C.from, C.nonce,
             C.start_limit, C.end_limit,
             C.source_id, C.source_type,
             contract_hash, new_id,
             C.amount1, C.fee1,
             C.amount2, C.fee2,
             C.subs1, C.subs2
            ];
        console.log("serialized offer ");
        console.log(serialized_offer);
        var signed_so = keys.sign(serialized_offer);
        return([signed_so, btoa(C.oracle_text), C.oracle_start_height, [1]]);//the 1 is the type. this is a binary derivative, so it is type 1. scalar is 2.
    };


    function unpack_oracle_binary_bet_offer(Offer0) {
        var SO = Offer0[0];
        var b = verify1(SO);
        if(!b) {
            console.log("bad signature on offer");
            return(0);
        };
        var offer = SO[1];
        var R = {};
        R.oracle_text = Offer0[1];
        R.oracle_start_height = Offer0[2];
        R.from = offer[1];
        R.nonce = offer[2];
        R.start_limit = offer[3];
        R.source_type = offer[4];
        R.contract_hash = offer[5];
        var contract_hash = contract_hash_maker(C.oracle_start_height, C.oracle_text);
        if(!(R.contract_hash == contract_hash)){
            console.log("bad contract hash");
            return(0);
        }
        R.new_id = offer[6];
        R.amount1 = offer[7];
        R.fee1 = offer[8];
        R.amount2 = offer[9];
        R.fee2 = offer[10];
        R.subs1 = offer[11];
        R.subs2 = offer[12];
        return(R);
    };
    
    function make_tx(SO) {
        var offer = SO[1];
        var fee1 = offer[10];
        var fee2 = offer[12];
        var fee = fee1 + fee2;
        return(["pair_buy_tx", keys.pub(), SO, fee]);
    };
    
    function contract_hash_maker(start_height, oracle_text) {
        var oracle_id = id_maker(start_height, 0, 0, oracle_text);
        var serialized_oracle_id = string_to_array(atob(oracle_id))
        var full_code = array_to_string(([2,0,0,0,32]).concat(serialized_oracle_id)).concat(static_binary_derivative);
        return(hash(string_to_array(full_code)));
    }
    function test(){
        var full = btoa(array_to_string([255,255,255,255]));
        var empty = btoa(array_to_string([0,0,0,0]));
        rpc.post(["account", keys.pub()], function(my_acc){
            var Nonce = my_acc[2] + 1;
            var C = {
                from: keys.pub(),
                nonce: Nonce,
                start_limit: 0,
                end_limit:100,
                oracle_start_height:10,
                oracle_text: btoa(""),
                amount1: 10000000,
                amount2: 10000000,
                fee1: 200000,
                fee2: 200000,
                subs1: [full, empty],
                subs2: [empty, full],
            };
            var X = pack_oracle_binary_bet_offer(C);
            console.log(JSON.stringify(X));
        })};
    return({test: test, pack_binary: pack_oracle_bet_offer, unpack_binary: unpack_oracle_binary_bet_offer})
})();
