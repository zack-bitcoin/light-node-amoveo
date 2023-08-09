function crosschain_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var fee = 200000;
    var display = document.createElement("div");
    display.innerHTML = "ready.";
    var title = document.createElement("h3");
    title.innerHTML = "Crosschain Decentralized Exchange ";
    div.appendChild(title);
    var details = document.createElement("p");
    details.innerHTML = "Sell a currency on the Amoveo blockchain to get coins on another blockchain. Manage these kinds of trades.";
    div.appendChild(details);
    div.appendChild(display);
    var IP = default_ip();

    //Make trade offer interface
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
    selector_label.innerHTML = "Currency you are spending: ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());
    var spend_amount_input = text_input("Amount of currency you want to send. (i.e. 0.15)", div);
    div.appendChild(br());
    var advanced_div = document.createElement("div");
    advanced_div.appendChild(br());
    var advanced_interface = document.createElement("div");
    var more_button = button_maker2("more options", function(){
        advanced_div.innerHTML = "";
        advanced_div.appendChild(advanced_interface);
    });
    var less_button = button_maker2("less options", function(){
        advanced_div.innerHTML = "<br>";
    });
    div.appendChild(more_button);
    div.appendChild(less_button);
    div.appendChild(br());
    div.appendChild(advanced_div);

    var security_amount_input = text_input("How much currency should your counterparty need to lock into the contract as a security deposit to enforce that they actually deliver. (they need to lock up the same currency type as you are selling, default is 10% the amount you are selling) (i.e. 0.015)", advanced_interface);
    advanced_interface.appendChild(br());
    var hours_input = text_input("How many hours do they have until the money needs to arrive in your account on the other blockchain. Giving more time can allow for them to pay a lower fee, and you to trade at a better price. Don't make it too big, we need to wait this long to run the oracle. (i.e. 48)", advanced_interface);
    hours_input.value = "48";
    advanced_interface.appendChild(br());
    //look at create_tab_builder to see about dates.
    var many_blocks_to_match_input = text_input("How many Amoveo blocks until your trade offer should expire as invalid. (Amoveo has about 130 blocks per day)(i.e. 130)", advanced_interface);
    many_blocks_to_match_input.value = "130";
    advanced_interface.appendChild(br());

    //test values
    other_blockchain_input.value = "Bitcoin";
    ticker_input.value = "BTC";
    other_address_input.value = "1FdyGS6MSaWsrKwN6BSzrss6K55fj9Dft1";
    receive_amount_input.value = "0.01";
    spend_amount_input.value = "1";
    /*
    //security_amount_input.value = "0.3";
    hours_input.value = "48";
    many_blocks_to_match_input.value = "30";
    */

    var button = button_maker3("make crosschain trade offer", crosschain_offer);
    div.appendChild(button);
    div.appendChild(br());

    async function crosschain_offer(button){
        var d = new Date();
        var hours = parseFloat(hours_input.value, 10);
        if(hours > (24*7)){
            display.innerHTML = "you cannot make a trade that needs to wait more than a week to run the oracle.";
            return(0);
        };
        d.setTime(d.getTime() +
                  (hours * 60 * 60 * 1000)); 
        var date = d.toUTCString();
        var date = date.slice(5, 22).concat(" GMT");
        var [cid, oracle_text] =
            await sell_veo_contract.oid(
                other_blockchain_input.value,
                other_address_input.value,
                receive_amount_input.value,
                ticker_input.value,
                date);
        var Source, SourceType;
        if(selector.value == "veo"){
            Source = ZERO;
            SourceType = 0;
        } else {
            var V = JSON.parse(selector.value);
            Source = V[0];
            SourceType = V[1];
        };

        var unused_cid = await rpc.apost(
           ["add", 3, btoa(oracle_text), 0, 1,
            Source, SourceType], IP, 8090);
        if(!(cid === unused_cid)){
            console.log("calculated bad cid");
            return(0);
        };
        var my_acc = await rpc.apost(
            ["account", keys.pub()]);
        if(my_acc === 0){
            display.innerHTML = "Load your private key first.";
            return(0);
        };
        function callback2() {
            return(crosschain_offer2(spend_amount, Source, SourceType, cid));
        };
        var spend_amount = Math.round(parseFloat(spend_amount_input.value, 10)*100000000);
        if(selector.value === "veo"){
            if (my_acc[1] < spend_amount) {
                display.innerHTML = "insufficient veo to make that swap offer";
                return(0);
            } else {
                return(callback2());
            }
        } else {
            var sub_id = sub_accounts.normal_key(keys.pub(), Source, SourceType);
            //sub_accounts.rpc(sub_id, function(sa){
            var sa = await sub_accounts.arpc(sub_id);
            if(sa[1] < spend_amount){
                display.innerHTML = "insufficient subcurrency to make that swap offer";
                return(0);
            } else {
                return(callback2());
            };
            //});
        };
    };
    function crosschain_offer2(spend_amount, Source, SourceType, cid){
        var amount2;
        if(security_amount_input.value === ""){
            amount2 = Math.round(spend_amount * 1.1);
        } else {
            amount2 = spend_amount + Math.round(parseFloat(security_amount_input.value, 10)*100000000);
        };
        var offer = {};
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

        var offer99 = swaps.offer_99(offer);
        apost_offer(display, IP, offer, offer99);
        spend_amount_input.value = "";
        refresh();
    };

    var refresh_button = button_maker2("refresh available actions", refresh);
    div.appendChild(br());
    div.appendChild(refresh_button);
    div.appendChild(br());
    div.appendChild(br());
    var lists_div = document.createElement("div");
    div.appendChild(lists_div);

    async function refresh(){
        var temp_div = document.createElement("div");
        await release_buttons(temp_div);
        await where_to_send(temp_div);
        await cancel_accept_buttons(temp_div);
        console.log("done making buttons");
        lists_div.innerHTML = "";
        lists_div.appendChild(temp_div);
    };
    function is_sell_veo_contract(contract){
        var contract_text = atob(contract[1]);
        return(contract_text
               .match(/has received less than/));
    };
    async function contract_api(cid){
        var r = await rpc.apost(
            ["read", 3, cid], IP, 8090);
        return(r);
    };
    async function release_buttons(temp_div){
        var l = await swap_offer_downloader.subaccounts(
            1, is_sell_veo_contract, contract_api);
        l.map(function(x){
            var cid = x[0];
            var sa = x[1];
            var contract = x[2];
            return(release_buttons2(
                cid, sa, contract, temp_div))});
    };
    function release_buttons2(
        cid, sa, contract, temp_div
    ){
        var balance = sa[1];
        var dc = dex_tools.sell_veo_contract_decoder(
            contract);
        var received_text = new_description_maker2(dc);
        var description = document.createElement("span");
        description.innerHTML = "you are buying "
            .concat(received_text);
        var release_button = button_maker3("you have already been paid", async function(button){
            //release button to sell for 0.2% + fee.
            function cleanup(){
                button.value = "done";
                button.onclick = function(){return(0)};
            };
            var swap = await dex_tools.lowest2(
                dc.source, dc.source_type, cid, IP);
        if(swap === 0) {
            console.log("they didn't post a 99% sell offer. looks like they want to use the oracle.");
            1+1n;
        };
            var combine_tx = [
                "contract_use_tx", 0,0,0, cid,
                -balance, 2, dc.source, dc.source_type];
            swaps.make_tx(swap, 1000000, async function(txs){
                var tx = await multi_tx.amake(
                    txs.concat([combine_tx]));
                var stx = keys.sign(tx);
                var msg = await apost_txs([stx]);
                display.innerHTML = msg;
                if(!(msg === "server rejected the tx")){
                    cleanup();
                };
            }); 
        });
        temp_div.appendChild(description);
        temp_div.appendChild(release_button);
        temp_div.appendChild(br());
        temp_div.appendChild(br());
    };
    async function where_to_send(temp_div){
        var l = await swap_offer_downloader.subaccounts(
            2, is_sell_veo_contract, contract_api);
        l.map(function(x){
            var cid = x[0];
            var sa = x[1];
            var contract = x[2];
            return(draw_where_to_send(
                temp_div, cid, sa, contract))});
    };
    function draw_where_to_send(
        temp_div, cid, sa, contract)
    {
        var dc = dex_tools.sell_veo_contract_decoder(
            contract);
        var received_text = new_description_maker2(dc)
            .concat(" using contract ")
            .concat(cid);
        var description = document.createElement("span");
        description.innerHTML = "you are selling "
            .concat(received_text);
        temp_div.appendChild(description);
        temp_div.appendChild(br());
        temp_div.appendChild(br());
    };
    function new_description_maker2(dc){
        var r = dc.receive
            .concat(" to ")
            .concat(dc.address);
        return(r);
    };
    function description_maker2(contract_text){
        var address = contract_text.match(/address \w*/)[0];
        var receive = contract_text.match(/\d[\.\d]* \w* before/)[0].slice(0,-6);
        var r = (receive)
            .concat(" to ")
            .concat(address);
        return(r);
    };
    function description_maker(
        cid1, type1, amount1, dc){
        var d2 = new_description_maker2(dc);
        var description = document.createElement("span");
        var spend_stuff;
        if(cid1 === ZERO){
            spend_stuff = "VEO";
        } else {
            spend_stuff = cid1
                .concat(" type ")
                .concat(type1);
        };
        description.innerHTML = "you offered to trade "
            .concat((amount1/100000000).toFixed(8))
            .concat(" ")
            .concat(spend_stuff)
            .concat(" in exchange for ")
            .concat(d2);
        return(description);
    };
    async function cancel_accept_buttons(temp_div){
        var l =
            await swap_offer_downloader.doit(
                1, "sell_veo");
        //l: [[contract, [[tid, offer]...]]...]
        l.map(async function(a){
            var contract = a[0];
            var offers = a[1];
            var dc = dex_tools
                .sell_veo_contract_decoder(
                    contract);
            offers.map(async function(offer_x){
                var tid = offer_x[0];
                var trade = offer_x[1];
                cancel_accept_buttons2(
                    trade, temp_div, dc, tid);
            });
        });
    };
    async function cancel_accept_buttons2(
        trade, temp_div, dc, tid){
        var offer = swaps.unpack(trade);
        var description = description_maker(
            offer.cid1, offer.type1,
            offer.amount1, dc);
        var block_height = headers_object.top()[1];
        if(offer.acc1 === keys.pub()){
            var cancel_button = button_maker2(
                "cancel trade", async function(){
                    var tx = ["trade_cancel_tx", keys.pub(), 2000000, fee, offer.salt];
                    var stx = keys.sign(tx);
                    var x = await apost_txs([stx]);
                    display.innerHTML = x;
                    refresh();
                    //});
                    return(0);
                });
            temp_div.appendChild(description);
            temp_div.appendChild(cancel_button);
            temp_div.appendChild(br());
            return(0);
        };
        description.innerHTML =
            description.innerHTML.replace(
                /you offered to trade/,
                "they offered to give")
            .concat(" ; The money must arrive before ")
            .concat(dc.date)
            .concat(" ; Offer expires in ")
            .concat(offer.end_limit - block_height)
            .concat(" blocks. collateralization: ")
            .concat((offer.amount2 / offer.amount1).toFixed(2))
            .concat(" ");
        temp_div.appendChild(description);
        var link = document.createElement("a");
        link.href = "explorers/offer_explorer.html?tid="
            .concat(tid);
        link.innerHTML = "contract offer in explorer ";
            link.target = "_blank";
        temp_div.appendChild(link);
        if((offer.amount2 / offer.amount1) > 2){
            console.log("offer with excess colateralization blocked");
            return(0);
        };
        var accept_button = button_maker2("accept the offer", function(){
            //var new_contract_tx = new_scalar_contract.make_tx(dc.text, 1);
                console.log("here");
            swaps.make_tx(trade, 1, async function(txs){
                console.log("here");
                //var tx = await multi_tx.amake([new_contract_tx].concat(txs));
                var tx = await multi_tx.amake(txs);
                console.log(tx);
                var stx = keys.sign(tx);
                var msg = await apost_txs([stx]);
                console.log("here");
                if(msg === "server rejected the tx"){
                console.log("here");
                    display.innerHTML = msg;
                } else {
                console.log("here");
                    display.innerHTML = "accepted trade offer and " .concat(msg);
                    var offer99 = swaps.accept_99(offer);
                    apost_offer(display, IP, offer99);
                console.log("here");
                    refresh();
                }
            });
        });
        temp_div.appendChild(accept_button);
        temp_div.appendChild(br());
        temp_div.appendChild(br());
        return(0);
    };
    return({});
};
