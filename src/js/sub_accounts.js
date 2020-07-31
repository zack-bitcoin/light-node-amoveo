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
    return({key: key, normal_key: normal_key});
})();
