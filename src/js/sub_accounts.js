sub_accounts = (function(){
    function key(pub, cid, type) {
        return(hash(
            (string_to_array(atob(pub)))
                .concat(string_to_array(atob(cid)))
                .concat(integer_to_array(type, 32))));
    };
    return({key: key});
})();
