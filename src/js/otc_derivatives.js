function otc_function() {
    //Their pubkey
    var div = document.createElement("div");
    document.body.appendChild(div);

    var title = document.createElement("h3");
    title.innerHTML = "direct derivatives form";
    div.appendChild(title);

    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    var their_address = text_input("their_address: ", div);
    div.appendChild(br());
    //verify internally that our address matches the contract.
    var oracle = text_input("oracle: ", div);
    div.appendChild(br());
    var our_bet_amount = text_input("our bet amount: ", div);
    div.appendChild(br());
    var their_bet_amount = text_input("their bet amount: ", div);
    div.appendChild(br());
    var bet_direction = text_input("you win if outcome is: ", div);
    div.appendChild(br());
    var oracle_type = text_input("scalar or binary? (suggestion is usually right.)", div);
    div.appendChild(br());
    var bits = text_input("if it is scalar, how many bits does it have?", div);
    start_button = button_maker2("start", start);
    function start() {
    //our private key needs to be loaded.
        //check all values are valid for making the contract.
        //check that the oracle exists, and if scalar that enough bits exist.
        //check that we each have enough money to participate.
        //make a useful error if something is wrong.
    };
    return {}
}

var otc_object = otc_function();
