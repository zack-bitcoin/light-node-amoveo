function crosschain_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var display = document.createElement("div");
    var title = document.createElement("h3");
    title.innerHTML = "Crosschain Decentralized Exchange ";
    div.appendChild(title);
    //div.appendChild(br());
    var details = document.createElement("p");
    details.innerHTML = "Sell VEO to get coins on another blockchain and manage these kinds of trades.";
    div.appendChild(details);
    //div.appendChild(br());
    div.appendChild(display);
    //div.appendChild(br());
    var IP = "159.89.87.58";

    //Make trade offer
    //============
    var trade_offer_title = document.createElement("h3");
    trade_offer_title.innerHTML = "Make Trade Offer";
    div.appendChild(trade_offer_title);
    var other_blockchain_input = text_input("Name of the other blockchain where you want to receive value. (i.e. Ethereum)", div);
    div.appendChild(br());
    var ticker_input = text_input("Name of the currency that you want to be paid in. (i.e. Eth)", div);
    div.appendChild(br());
    var other_address_input = text_input("Your address on the other blockchain. Needs to be a fresh address that has never received currency before", div);
    div.appendChild(br());
    var receive_amount_input = text_input("Amount of currency you want to receive. (i.e. 1.205)", div);
    div.appendChild(br());
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "currency you are spending: ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());
    var spend_amount_input = text_input("Amount of currency you want to send. (i.e. 0.15)", div);
    div.appendChild(br());
    var security_amount_input = text_input("How much currency should your counterparty need to lock into the contract as a security deposit to enforce that they actually deliver? (they need to lock up the same currency type as you are spending) (i.e. 0.015)", div);
    div.appendChild(br());
    var hours_input = text_input("How many hours do they have until the money needs to arrive in your account on the other blockchain? Giving more time can allow for them to pay a lower fee, and you to trade at a better price. (i.e. 48)", div);
    div.appendChild(br());
    //look at create_tab_builder to see about dates.
    var many_blocks_to_match_input = text_input("How many Amoveo blocks until your trade offer should expire as invalid? (Amoveo has about 130 blocks per day)(i.e. 130)", div);
    div.appendChild(br());

    //test values
    /*
    other_blockchain_input.value = "Dogecoin";
    ticker_input.value = "DOGE";
    other_address_input.value = "DCsXQW4HarTfDJ6PvP7e4Wbjd42Yhig5Tu";
    receive_amount_input.value = "100000";
    spend_amount_input.value = "1";
    security_amount_input.value = "0.3";
    hours_input.value = "48";
    many_blocks_to_match_input.value = "30";
    */

    var button = button_maker2("make crosschain trade offer", crosschain_offer);
    div.appendChild(button);

    function crosschain_offer(){
        var d = new Date();
        d.setTime(d.getTime() + (parseFloat(hours_input.value, 10) * 60 * 60 * 1000)); 
        var date = d.toUTCString();
        var date = date.slice(5, 22).concat(" GMT");
        var oracle_text = "the "
            .concat(other_blockchain_input.value)
            .concat(" address ")
            .concat(other_address_input.value)
            .concat(" has received less than ")
            .concat(receive_amount_input.value)
            .concat(" ")
            .concat(ticker_input.value)
            .concat(" before ")
            .concat(date);

        var Source, SourceType;
        if(selector.value == "veo"){
            Source = ZERO;
            SourceType = 0;
        } else {
            var V = JSON.parse(selector.value);
            Source = V[0];
            SourceType = V[1];
        };
        
        rpc.post(["add", 3, btoa(oracle_text), 0, 1, Source, SourceType], function(cid){
            rpc.post(["account", keys.pub()], function(my_acc){
                var spend_amount = Math.round(parseFloat(spend_amount_input.value, 10)*100000000);
                var amount2 = spend_amount + Math.round(parseFloat(security_amount_input.value, 10)*100000000);
                var offer = {};
                offer.nonce = my_acc[2] + 1;
                var block_height = headers_object.top()[1];
                offer.start_limit = block_height - 1;
                offer.end_limit = block_height + parseInt(many_blocks_to_match_input.value, 10);
                offer.amount1 = spend_amount;
                offer.amount2 = amount2;
                offer.cid1 = Source;
                offer.cid2 = cid;
                offer.type1 = SourceType;
                offer.type2 = 1;
                offer.acc1 = keys.pub();
                offer.partial_match = false;
                
                var signed_offer = swaps.pack(offer);
                rpc.post(["add", signed_offer, 0], function(z){
                }, IP, 8090);//8090 is the p2p_derivatives server
            });
        }, IP, 8090);
    };

    //Cancel Trade Offers
    //=========

    //get your active trade offers from the p2p derivatives server.
    //for each one we need a button that can make a trade_cancel tx to cancel that offer.


    //Release the veo
    //=========

    //list of matched contracts for your account, each with a release the veo button.
    //to make this: get a list of subcurrencies for your account from the explorer.
    //filter for type 1s with non-zero balances
    //look up the contract info from the explorer to see which ones are for crosschain swaps. keep those.

    //look up contract info from the explorer to find the txid.
    //look up the tx info from the explorer to find who matched.
    //send them all the type 1 shares you have


    //Dispute your contract to get your veo
    //==========

    //if they refuse to release, you need a way to sell you winning shares for 99% of the value.
    //look up the subcurrencies you own. filter for type 2, non-zero balance, where it is a crosschain swap, and you don't have enough type 1 to combine back to veo.
    //the button should make and publish a swap offer to sell for 99% of the value in veo.


    //Get your VEO
    //===========

    //list of subcurrencies where you own both sides of the contract, and the contract only has 2 types.
    // a button for each to combine back to veo.

    };
