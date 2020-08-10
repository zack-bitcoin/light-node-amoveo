(function(){
    var oracle_height_constant = "5";
//    var cid = "7/ZnSP1bSxHBGwD9MWKhKodvrnElXEJz8ppsum+PQXQ=";

    var cid = "Q9z6Ijo4+n6jtXqM13pfebsCSWQvoNDGsbEXvkUiFQQ=";
    
    subcurrency_spender.type(1);
    subcurrency_spender.to("BNEz2wgeaARdPQT049sQOY8Ceox6NjdchBi02F2n4cRGLZg8qbz5lN9d20XpWOWk5pe358+40cmqWSHl9wLna/g=");
    subcurrency_spender.amount(1);
    subcurrency_spender.contract_id(cid)
    subcurrency_balance.value(cid);
    new_contract.oracle_text("1=1");
    new_contract.start_height("5");
/*    binary_interface_offer.amount1("1000000");
    binary_interface_offer.amount2("1000000");
binary_interface_offer.timelimit("2");
    binary_interface_offer.oracle_start_height(oracle_height_constant);
    binary_interface_offer.oracle_text("1=1");
    binary_interface_offer.direction("true");
*/
    subcurrency_combiner.contract_id(cid);
    
    swap_offer.timelimit("2");
    swap_offer.amount1("1000000");
    swap_offer.amount2("1000000");
    swap_offer.cid2(cid);
    swap_offer.type2("2");
    
    resolve_binary_contract.oracle_height(oracle_height_constant);
    resolve_binary_contract.oracle_text("1=1");

    binary_contract_winnings.contract_id(cid);

    teach_binary_contract.oracle_text("1=1");
    teach_binary_contract.oracle_height(5);

    check_binary_contract.cid(cid);

})();
