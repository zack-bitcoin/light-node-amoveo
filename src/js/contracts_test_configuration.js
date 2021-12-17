(function(){
    //var cid = "Q9z6Ijo4+n6jtXqM13pfebsCSWQvoNDGsbEXvkUiFQQ=";
    //var cid = "vWSumtEl1WBhxaeVzu/MdBQtdmnuWTXMtupnKTDJ+vI=";
    var cid = "LhPyzJqttN/xkgzK0DeXzFhke7j572a9LPY+VR4gyVY=";
    var scalar_question = "btc price in USD - 10000";
    var binary_question = "1=1";
    var start_height = "5";
    var max_price = "5000";
    var match_price = "3000";
    
    subcurrency_spender.type(1);
    subcurrency_spender.to("BNEz2wgeaARdPQT049sQOY8Ceox6NjdchBi02F2n4cRGLZg8qbz5lN9d20XpWOWk5pe358+40cmqWSHl9wLna/g=");
    subcurrency_spender.amount(1);
    subcurrency_spender.contract_id(cid)
    subcurrency_balance.value(cid);
//    new_contract.oracle_text(binary_question);
    //new_contract.start_height(start_height);
    subcurrency_combiner.contract_id(cid);

    swap_offer.timelimit("10");
    swap_offer.amount1("1010000");
    swap_offer.amount2("1010000");
    //swap_offer.cid2(cid);
    swap_offer.cid2("dD76riHgEABZxODlZHgy74/3V8In7gk+xoPjUieUB2M=");
    swap_offer.type2("1");
    /*
    */ 
//    resolve_binary_contract.oracle_height(start_height);
//    resolve_binary_contract.oracle_text(binary_question);

//    binary_contract_winnings.contract_id(cid);

//    teach_binary_contract.oracle_text(binary_question);


//    new_scalar_contract.height(start_height);
//    new_scalar_contract.text(scalar_question);
//    new_scalar_contract.max(max_price);

//    scalar_oracle_creation.height(start_height);
//    scalar_oracle_creation.text(scalar_question);
//    scalar_oracle_creation.max(max_price);
//    scalar_oracle_creation.price(match_price);

    /*
    resolve_scalar_contract.height(start_height);
    resolve_scalar_contract.oracle(scalar_question);
    resolve_scalar_contract.price(max_price);
    resolve_scalar_contract.final_price(match_price);
    */

    teach_scalar_contract.oracle_text(scalar_question);
    //teach_scalar_contract.oracle_height(start_height);
    teach_scalar_contract.max_val(max_price);

    scalar_contract_winnings.contract_id("de01XJM9elbsxRgvHp5ELLTqgWHEHguvibeq5zXFTNs=");
    scalar_contract_winnings.oracle_id("d4TQD0dcYWTz9i9JTmKngpR+ypt8DGPRBl3flx+WVX4=");

    subcurrency_set_buy.contract_id(cid);
    subcurrency_set_buy.amount("100000000");

//    binary_id.start(start_height);
//    binary_id.text(binary_question);

    //scalar_id.height(start_height);
    scalar_id.text(scalar_question);
    scalar_id.max(max_price);

    new_market.cid1(cid);
    new_market.type1("2");
    new_market.amount1("1000000");
    new_market.amount2("1000000");

    var mid = "7VcDtMRdZ0vTy9kzDoiMCiqveix/bs0t5qBla4fIWYE=";

    //market_viewer.mid(mid);
    
    market_liquidity_balance.mid(mid);

    market_swap.mid(mid);
    market_swap.give(10000);
    market_swap.take(10);
    market_swap.direction(1);

    market_liquidity.mid(mid);
    market_liquidity.amount(100000);

    /*
    create_futarchy_tab_builder.oracle_text("Amoveo's block reward is above 0.2 VEO on January 1st 2021.");
    create_futarchy_tab_builder.probability_text("0.1");
    create_futarchy_tab_builder.amount_text("1");
    create_futarchy_tab_builder.scalar_amounts_text("1");
    create_futarchy_tab_builder.scalar_oracle_text("The price of VEO in USD");
    create_futarchy_tab_builder.true_guess_text("20");
    create_futarchy_tab_builder.false_guess_text("30");
    create_futarchy_tab_builder.min_text("10");
    create_futarchy_tab_builder.max_text("50");
    */
})();
