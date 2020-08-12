
var new_contract = (function(){
//binary derivative contract based on a single oracle. 
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
    //-record(contract_new_tx, {from, nonce, fee, contract_hash, many_types, source, source_type}).

    var div = document.getElementById("new_contract");
    var display = document.createElement("p");
    div.appendChild(display);
    var full = btoa(array_to_string([255,255,255,255]));
    var empty = btoa(array_to_string([0,0,0,0]));

    var oracle_start_height = text_input("when it becomes possible to report on the outcome of the oracle question. a block height: ", div);
    div.appendChild(br());
    var oracle_text = text_input("the question we ask the oracle", div);
    div.appendChild(br());
    var button = button_maker2("make contract", make_contract);
    div.appendChild(button);
/*    function id_maker2(oracle_id, many_types) {
        var ch = contract_hash_maker2(oracle_id);
        return(id_maker(ch, many_types));
    };
    function id_maker(
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
    };
*/
//    function contract_maker(start_height, oracle_text) {
//        var oracle_id = id_maker(start_height, 0, 0, oracle_text);//from format
//        return(contract_maker2(oracle_id));
    //    };
    /*
    function contract_maker2(oracle_id) {
        var serialized_oracle_id = string_to_array(atob(oracle_id));
        var full_code = array_to_string(([2,0,0,0,32]).concat(serialized_oracle_id)).concat(static_binary_derivative);
        return(btoa(full_code));
    };
*/
//    function contract_hash_maker(start_height, oracle_text) {
        //var oracle_id = id_maker(start_height, 0, 0, oracle_text);//from format
        //return(contract_hash_maker2(oracle_id));
//        var c = contract_maker(start_height, oracle_text);
//        return(btoa(array_to_string(hash(string_to_array(atob(c))))));
//    }
/*    function contract_hash_maker2(oracle_id){
        var c = binary_derivative.contract2(oracle_id);
        return(btoa(array_to_string(hash(string_to_array(atob(c))))));
    };
*/
    function make_tx(Start, Text) {
        var oracle_id = id_maker(Start, 0, 0, Text);//from format
        //var CH = contract_hash_maker2(oracle_id);
        var CH = binary_derivative.hash(oracle_id);
        //var CH = contract_hash_maker(Start, Text);
        var Fee = 152050;
        var MT = 3;
        var Source = btoa(array_to_string(integer_to_array(0, 32)));
        var SourceType = 0;
        var tx = ["contract_new_tx", keys.pub(), CH, Fee, MT, Source, SourceType];
        return(tx);
        
    }
    function make_contract(){
        var Start = parseInt(oracle_start_height.value);
        var Text = oracle_text.value;

        var tx = make_tx(Start, Text);
        console.log(tx);
        var stx = keys.sign(tx);
        rpc.post(["txs", [-6, stx]],
                 function(x) {
                     if(x == "ZXJyb3I="){
                         display.innerHTML = "server rejected the tx";
                     }else{
                         display.innerHTML = "accepted trade offer and published tx. the tx id is ".concat(x);
                     }
                 });
    };
    return({
        start_height: function(x){oracle_start_height.value = x},
        oracle_text: function(x){oracle_text.value = x},
        make_tx: make_tx,
        make_publish_tx: make_contract,
        //binary_derivative
//        id_maker: id_maker, *
//        id_maker2: id_maker2, *
//        contract2: contract_maker2 *
        
    });
})(); 


