(function(){
    var oracle_height_constant = "5";
    var cid = "7/ZnSP1bSxHBGwD9MWKhKodvrnElXEJz8ppsum+PQXQ=";
    
    subcurrency_spender.type(1);
    subcurrency_spender.to("BNEz2wgeaARdPQT049sQOY8Ceox6NjdchBi02F2n4cRGLZg8qbz5lN9d20XpWOWk5pe358+40cmqWSHl9wLna/g=");
    subcurrency_spender.amount(1);
    subcurrency_spender.contract_id(cid)
    subcurrency_balance.value(cid);
    binary_interface_offer.amount1("100");
    binary_interface_offer.amount2("100");
binary_interface_offer.timelimit("2");
    binary_interface_offer.oracle_start_height(oracle_height_constant);
    binary_interface_offer.oracle_text("1=1");
    binary_interface_offer.direction("true");
    subcurrency_combiner.contract_id(cid);
    
    swap_offer.timelimit("2");
    swap_offer.amount1("10");
    swap_offer.amount2("10");
    swap_offer.cid1(cid);
    swap_offer.type1("1");
    
    resolve_binary_contract.oracle_height(oracle_height_constant);
    resolve_binary_contract.oracle_text("1=1");

    binary_contract_winnings.contract_id(cid);
    
})();
