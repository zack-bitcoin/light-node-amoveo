sub_accounts = (function(){
    function key(pub, cid, type) {
        return(hash(
            (string_to_array(atob(pub)))
                .concat(string_to_array(atob(cid)))
                .concat(integer_to_array(type, 32))));
    };
    function normal_key(p, c, t){
        return(btoa(array_to_string(key(p, c, t))))
    };
    var memoized_sub_accounts = {};
    function memoized_rpc(id, callback){
        var x = memoized_sub_accounts[id];
        //console.log(x);
        if(x){
            return(callback(x));
        } else {
            rpc.post(["sub_accounts", id], function(sa){
                if((sa === "c3RvcCBzcGFtbWluZyB0aGUgc2VydmVy")){
                    console.log("spam filter triggered.");
                    //setTimeout(function(){
                    //    return(memoized_rpc(id, callback));
                    //}, 300);
                    return(callback(sa));
                } else {
                    memoized_sub_accounts[id] = sa;
                    return(callback(sa));
                };
            });
        };
    };

    return({key: key,
            normal_key: normal_key,
            rpc: memoized_rpc});
})();
