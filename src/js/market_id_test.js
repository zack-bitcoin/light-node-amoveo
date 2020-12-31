var market_id_test = function(){

    function test(){
        var cid = "/RXSnfzNwbWPIfVKrfaHvW+rxc+4FucrL52+X9DlAgM=";
        rpc.post(
            ["contracts", cid],
            function(contract){
                var SourceCID = contract[8];
                var SourceType = contract[9];
                console.log(JSON.stringify([SourceCID, SourceType]));
                var mid1 = new_market.mid(SourceCID, cid, SourceType, 1);
                var mid2 = new_market.mid(SourceCID, cid, SourceType, 2);
                var mid3 = new_market.mid(cid, cid, 1, 2);
                console.log(JSON.stringify([mid1, mid2, mid3]));
            });
    };

    return({
        test:test
    });
}();
