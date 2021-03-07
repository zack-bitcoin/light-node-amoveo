var scalar_derivative = (function(){
    //var contract_bytes = atob("bpYZNRc5AzAyj4cUGIYWjDpGFBRHFHBxSG8AAAAAAXgAAAAAAngWAAAAAAN4gxSDFhSDFhSDFKyHAAAAAAF5jBWGhgAAAAACeQAAAAADeYw6RhQUAgAAAAEwRxSQjIcWFBYCAAAAIGRuan/EdSKkhbAp0OEF6cQDv9x9li1vx5O6vqNMm3KlcUiGKIYoO0ZHDUiNhxYUAgAAAAEBO0ZHDUiEAAAAAAN5FoIA/////wAAAAADeTMWgoiMBAPo");
    var contract_bytes = atob(
        "bpYZNRc5AzAyj4cUGIYWjDpGFBRHFHBxSG8AAAAAAXgAAAAAAngWAAAAAAN4gxSDFhSDFhSDFKyHAAAAAAJ5jBWGhgAAAAABeQAAAAADeYw6RhQUAgAAAAEwRxSQjIcWFBYCAAAAIGRuan/EdSKkhbAp0OEF6cQDv9x9li1vx5O6vqNMm3KlcUiGKIYoO0ZHDUiNhxYUAgAAAAEBO0ZHDUiEAAAAAAN5FoIA/////wAAAAADeTMWgoiMBAPo");
//        "bpYZNRc5AzAyj4cUGIYWjDpGFBRHFHBxSG8AAAAAAXgAAAAAAngWAAAAAAN4gxSDFhSDFhSDFKyHAAAAAAF5jBWGhgAAAAACeQAAAAADeYw6RhQUAgAAAAEwRxSQjIcWFBYCAAAAIGRuan/EdSKkhbAp0OEF6cQDv9x9li1vx5O6vqNMm3KlcUiGKIYoO0ZHDUiNhxYUAgAAAAEBO0ZHDUiEAAAAAAN5FoIA/////wAAAAADeTMWgoiMBAPo");
    function oracle_text(max_price, thing_to_measure){
        var oracle_text_part = ("MaxPrice = ")
            .concat(max_price)
            .concat("; MaxVal = 4294967295; B = ")
            .concat(thing_to_measure)
            .concat(" from $0 to $MaxPrice; max(0, min(MaxVal, (B * MaxVal / MaxPrice)) is ");
        return(oracle_text_part);
    };
    function contract_maker(thing_to_measure, max_price) {
        var oracle_text_part =
            oracle_text(max_price,
                        thing_to_measure);
        //console.log(oracle_text_part); 
        var L = oracle_text_part.length;
        var settings =
            ([22]) //swap
//            ([0]) //int
//            .concat(integer_to_array(oracle_start, 4))
            .concat([2])//binary
            .concat(integer_to_array(L, 4))
            .concat(string_to_array(oracle_text_part));
        var full_contract = btoa(array_to_string(settings)
                                 .concat(contract_bytes));
        //console.log(full_contract);
        return(full_contract);
    };
    function contract_hash(c){
        //console.log(c);
        return(btoa(array_to_string(
            hash(string_to_array(atob(c))))));
    };

    return({
        hash: contract_hash,
        maker: contract_maker,
        oracle_text: oracle_text
    });
})();
