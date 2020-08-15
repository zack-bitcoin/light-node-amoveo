var scalar_derivative = (function(){
    var contract_bytes = atob("bpYZNRc5AzAyj4cUGIYWjDpGFBRHFHBxSG8AAAAAAXgAAAAAAngWAAAAAAN4gxSDFhSDFhSDFKyHAAAAAAF5jBWGhgAAAAACeQAAAAADeYw6RhQUAgAAAAEwRxSQjIcWFBYCAAAAIGRuan/EdSKkhbAp0OEF6cQDv9x9li1vx5O6vqNMm3KlcUiGKIYoO0ZHDUiNhxYUAgAAAAEBO0ZHDUiEAAAAAAN5FoIA/////wAAAAADeTMWgoiMBAPo");
    function contract_maker(thing_to_measure, max_price, oracle_start) {
        var oracle_text_part = ("MaxPrice = ")
            .concat(max_price)
            .concat("; MaxVal = 4294967295; B = ")
            .concat(thing_to_measure)
            .concat(" from $0 to $MaxPrice; max(0, min(MaxVal, (B * MaxVal / MaxPrice)) is ");
        var L = oracle_text_part.length;
        var settings = [2]//binary
            .concat(integer_to_array(L, 4))
            .concat(string_to_array(oracle_text_part))
            .concat([0]) //int
            .concat(integer_to_array(oracle_start, 4));
        var full_contract = btoa(array_to_string(settings)
                                 .concat(contract_bytes));
        return(full_contract);
    };
    function contract_hash(c){
        return(btoa(array_to_string(hash(string_to_array(atob(c))))));
    };

    return({
        hash: contract_hash,
        maker: contract_maker
    });
})();
