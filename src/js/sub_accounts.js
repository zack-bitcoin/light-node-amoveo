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
    var merklized_sub_accounts = {};
    async function memoized_merkle_rpc(id){
        var x = memoized_sub_accounts[id];
        if(x){
            return(x);
        } else {
            //todo, maybe this should be checking merkle proofs.
            var sa;
            var dip = default_ip();
            if(dip === "0.0.0.0"){
                sa = await rpc.apost(["sub_accounts", id]);
            } else {
                sa = await merkle.arequest_proof("sub_accounts", id);
            };
            if((sa === "c3RvcCBzcGFtbWluZyB0aGUgc2VydmVy")){
                console.log("spam filter triggered.");
                return(sa);
            } else {
                memoized_sub_accounts[id] = sa;
                return(sa);
            };
        };
    };
    var memoized_sub_accounts = {};
    async function amemoized_rpc(id){
        var x = memoized_sub_accounts[id];
        if(x){
            return(x);
        } else {
            //todo, maybe this should be checking merkle proofs.
            let sa = await rpc.apost(["sub_accounts", id]);
            if((sa === "c3RvcCBzcGFtbWluZyB0aGUgc2VydmVy")){
                console.log("spam filter triggered.");
                return(sa);
            } else {
                memoized_sub_accounts[id] = sa;
                return(sa);
            };
        };
    };
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
            amrpc: memoized_merkle_rpc,
            arpc: amemoized_rpc,
            rpc: memoized_rpc});
})();
