function bet_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var IP = default_ip();
    var fee = 200000;
    var title = document.createElement("h3");
    title.innerHTML = "bet on anything";
    var display = document.createElement("div");
    div.appendChild(title);
    div.appendChild(br());
    div.appendChild(display);
    div.appendChild(br());
    //bet text. amount to bet. odds.
    var bet_e = text_input("you win if: ", div);
    div.appendChild(br());
    var amount_e = text_input("how much you bet: ", div);
    div.appendChild(br());
    var them_e = text_input("how much they bet: ", div);
    div.appendChild(br());
    var till_expires_e = text_input("how many hours until this bet expires?: ", div);
    div.appendChild(br());
    var doit_button = button_maker2("make bet", doit);
    div.appendChild(doit_button);

    var explore_swap_offers_div = document.createElement("div");
    explore_swap_offers_creator(explore_swap_offers_div, true);
    var swap_viewer_div = document.createElement("div");
    swap_viewer = swap_viewer_creator(swap_viewer_div);
    div.appendChild(explore_swap_offers_div);
    div.appendChild(swap_viewer_div);
    

    if(true){
        bet_e.value = "1=1";
        amount_e.value = "0.1";
        them_e.value = "0.1";
        till_expires_e.value = "10";
    };
    
    var active_bets = document.createElement("h3");
    active_bets.innerHTML = "active bets";
    //div.appendChild(active_bets);

    async function doit(){
        var bet = bet_e.value;
        var amount = Math.round(parseFloat(amount_e.value) * token_units());
        var them = Math.round(parseFloat(them_e.value) * token_units());
        var expires = Math.round(
            parseFloat(till_expires_e.value)*6);

        var MP = 1;//many possible prices.
        var Text = bet;
        var new_contract_tx =
            new_scalar_contract.make_tx(
                Text, MP);
        var CH = new_contract_tx[2];
        var cid = binary_derivative.id_maker(CH, 2);

        //make the binary bet contract CID.
        //make an offer where you give veo, and they pay in the side of the contract that you want.

        var swap = {};
        swap.type1 = 0;
        swap.type2 = 1;
        swap.cid1 = ZERO;
        swap.cid2 = cid;
        swap.amount1 = amount;
        swap.amount2 = them + amount;
        swap.partial_match = false;
        swap.acc1 = keys.pub();
        swap.end_limit = headers_object.top()[1] + expires;
        var offer99 = swaps.offer_99(swap);
        /*
        var offer99 = {};
        offer99.type1 = 1;
        offer99.type2 = 0;
        offer99.cid1 = cid;
        offer99.cid2 = ZERO;
        offer99.amount1 = (them + amount);
        offer99.amount2 = Math.round(((them + amount) * 0.998) - (fee * 5))
        offer99.partial_match = false;
        offer99.acc1 = keys.pub();
        offer99.end_limit = headers_object.top()[1] + expires + 1;
        */
        console.log(expires);
        console.log(JSON.stringify(swap));
        var signed_offer = swaps.pack(swap);
        var signed_99 = swaps.pack(offer99);

        var max_price = 1;//1 is for binary contracts.
        var response1 = await rpc.apost(["add", 3, btoa(Text), 0, max_price, ZERO, 0], IP, 8090);
        console.log(response1);

        var response = await rpc.apost(
            ["add", signed_offer, signed_99],
            IP, 8090);
        console.log(response);
        display.innerHTML = "successfully posted your bet offer. ";
        //link.href = "contracts.html";
        //link.innerHTML = "Your trade can be viewed on this page."
        //link.target = "_blank";
        //display.appendChild(link);
        
    };

    //TODO. copy things from the contracts.html page to here.
    // *available markets
    // *available trades in market
    // *order book swap viewer

    // *explore_swap_offers.js
        //<div id="explore_swap_offers" />
    // *swap_viewer.js
    //<div id="swap_viewer" />



    //TODO. we need some kind of way to see available bets, and a button to accept them with this function.
    //scan for available offers where:
    //they want to be paid in a contract that doesn't exist on-chain yet.

    //for each market check offers. 

    //for each contract, display the bet text, the amounts being bet, and the implied odds.


    //TODO. if it is your own bet offer., would be nice to have a button to cancel that bet offer.
    /*
    async function accept(text, swap_offer) {
        var new_contract_tx =
            new_scalar_contract.make_tx(
                Text, MP, Source, SourceType);
        var CH = new_contract_tx[2];
        var txs = [
            new_contract_tx,
            ["contract_use_tx", 0,0,0,
             cid, amount, 2,
             Zero, 0],
            swap_offer
        ];
        var tx = await multi_tx.amake(txs);
        var stx = keys.sign(tx);
        var response = await apost_txs([stx]);
        var offer99 = swaps.accept_99(swap_offer);
        var signed_99 = swaps.pack(offer99);
        var response2 = await rpc.apost(
            ["add", signed_99, 0],
            IP, 8090);
        display.innerHTML = "response "
            .concat(response)
            .concat(" </br> ")
            .concat(response2)
        ;
    };
    */
};
