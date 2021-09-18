var sell_veo_contract = (function(){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var IP = default_ip();

    async function oid(blockchain, address, amount, ticker, date, source, source_type){
        if(!(source_type)){
            source_type = 0;
        };
        if(!(source)){
            source = ZERO;
        }
        var oracle_text = "the "
            .concat(blockchain)
            .concat(" address ")
            .concat(address)
            .concat(" has received less than ")
            .concat(amount)
            .concat(" ")
            .concat(ticker)
            .concat(" before ")
            .concat(date);
        var sell_cid = await rpc.apost(
            ["add", 3, btoa(oracle_text), 0, 1,
             source, source_type], IP, 8090);
        return([sell_cid, oracle_text])
    };

    return({
        oid: oid
    });
})();
