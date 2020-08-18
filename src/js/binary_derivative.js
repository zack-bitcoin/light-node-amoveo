var binary_derivative = (function(){
//binary derivative contract based on a single oracle. 
    var static_binary_derivative = atob("AAAAAAF4gxSDFhSDFhSDFKyHAAAAAAF5OkZHDUgUFI2HFhQCAAAAAwAAABaGjzpGhIwWgowWggD/////FoKIjAQD6EcUjTpGhAD/////FoKMFoKMFoKIjAQD6EcUjjpGhIwWggD/////FoKMFoKIjAQD6EcUFIQAgAAAABaCAH////8WgowWgogEE4iWSEhI");
//    static_binary_derivative = array_to_string(
//        [1,255,255,255,255,3,0,132,130,130,3,0,3,100]);
    //int 0, max, nil, cons, cons, 0, 100
    function contract_maker2(oracle_id) {
        var serialized_oracle_id = string_to_array(atob(oracle_id));
        var full_code = array_to_string(([2,0,0,0,32]).concat(serialized_oracle_id)).concat(static_binary_derivative);
        return(btoa(full_code));
    };
    function contract_hash_maker2(oracle_id){
        var c = contract_maker2(oracle_id);
        return(btoa(array_to_string(hash(string_to_array(atob(c))))));
    };
    function id_maker2(oracle_id, many_types) {
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
        return(btoa(array_to_string(hash(
            string_to_array(atob(contract_hash))
                .concat(string_to_array(atob(source_id)))
                .concat(integer_to_array(many_types, 2))
                .concat(integer_to_array(source_type, 2))
        ))));
    };
    function contract_hash_maker2(oracle_id){
        var c = contract_maker2(oracle_id);
        return(btoa(array_to_string(hash(string_to_array(atob(c))))));
    };
    

    return({
        id_maker: id_maker,
        id_maker2: id_maker2,
        contract2: contract_maker2,
        hash: contract_hash_maker2,
    });
})();
