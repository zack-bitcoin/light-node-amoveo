
//var db = {};
var oracle_text;
var knowable_height;
var dcba = (function otc_function2() {
    const urlParams = new URLSearchParams(window.location.search);
    var mode = urlParams.get('mode');
    var auto_fill_mode = urlParams.get('auto_fill');
    console.log(auto_fill_mode);
    var fee = 152050;
    var div = document.createElement("div");
    document.body.appendChild(div);
  //  var bet_direction;

    //var title0 = document.createElement("h3");
    //title0.innerHTML = "generate id of oracle that has not been created on-chain yet";
    //div.appendChild(title0);

    var title = document.createElement("h3");
    title.innerHTML = "Create a trade offer";
    div.appendChild(title);

    var createPresets = document.createElement("div");
    div.appendChild(createPresets);

    var coin_put = button_maker2("Crypto options", showCoinPutFields);
    div.appendChild(text("Instrument: "));
    div.appendChild(coin_put);
    div.appendChild(text(" "));

    var coin_put = button_maker2("Competition", showSportEventFields);
    div.appendChild(coin_put);
    div.appendChild(text(" "));
  //  div.appendChild(br());

    var underDiv = document.createElement("div");
    div.appendChild(underDiv);
 //   underDiv.appendChild(br());
   // underDiv.appendChild(text("asdfasf"));

    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";

  //  div.appendChild(br());
   
    var whichCoin = document.createElement("INPUT");
    var textCoin = text("Which coin: ");


    var coinPrice = document.createElement("INPUT");
    var textPrice = text("Strike price ($): " );

    var theirAmount = document.createElement("INPUT");
    var textTheirAmount = text("Their bet size (VEO): ");

    var myAmount = document.createElement("INPUT");
    var textMyAmount = text("My bet size (VEO): ");


    var maturityDate1 = document.createElement("INPUT");
    var textMaturity1 = text("Maturity (MM/DD/YYYY): ");

    //var aboveOrBelow = document.createElement("INPUT");
    var aboveOrBelow = text("You win if price ends ");
    var above = document.createElement("INPUT");
    above.type = 'checkbox';
    above.style="width:15px;height:15px;"
 //   above.vertical-align = 'bottom';
    var below = document.createElement("INPUT");
    below.type = 'checkbox';
    below.style="width:15px;height:15px;"

    
var createNumber;

function showCoinPutFields(){
        createNumber = 0;
    underDiv.innerHTML = "";
    aboveOrBelow.innerHTML = "";
    underDiv.appendChild(br());


    underDiv.appendChild(textCoin  );
    textCoin.appendChild(whichCoin);
    underDiv.appendChild(br());

    underDiv.appendChild(textPrice);
    textPrice.appendChild(coinPrice);
    underDiv.appendChild(br());

    underDiv.appendChild(textMaturity1);
    textMaturity1.appendChild(maturityDate1);
    underDiv.appendChild(br());


    underDiv.appendChild(textMyAmount);
    textMyAmount.appendChild(myAmount);
    underDiv.appendChild(br());

    underDiv.appendChild(textTheirAmount);
    textTheirAmount.appendChild(theirAmount);

    underDiv.appendChild(br());
    
    underDiv.appendChild(text("You win if price ends "));
    underDiv.appendChild(text("above: "));
    underDiv.appendChild(above);
    underDiv.appendChild(text(" or below: "));
    underDiv.appendChild(below);



}



function showSportEventFields(){
    underDiv.innerHTML = "";
        createNumber = 1;
   underDiv.appendChild(br());


    underDiv.appendChild(text("Team 1: "));
    //use this for Team A 
    underDiv.appendChild(whichCoin);
    underDiv.appendChild(br());
    //use this for Team B

    underDiv.appendChild(text("Team 2: "));
    underDiv.appendChild(coinPrice);
    underDiv.appendChild(br());

    underDiv.appendChild(text("Day of event in local time (MM/DD/YYYY): "));
    underDiv.appendChild(maturityDate1);
    underDiv.appendChild(br());


    underDiv.appendChild(textMyAmount);
    textMyAmount.appendChild(myAmount);
    underDiv.appendChild(br());

    underDiv.appendChild(textTheirAmount);
    textTheirAmount.appendChild(theirAmount);

    underDiv.appendChild(br());
    
    underDiv.appendChild(text("You win if "));
    underDiv.appendChild(text("Team 1 wins: "));
    underDiv.appendChild(above);
    underDiv.appendChild(text(" or Team 2 wins: "));
    underDiv.appendChild(below);


}

//    div.appendChild(br());

    var question = document.createElement("INPUT");
   // question.style.display = 'none';
  //  div.appendChild(br());
    var oracle_starts = document.createElement("INPUT");
    var generate_id_button = button_maker2("generate id", generate_id_function);

    function generate_id_function() {  
        console.log("inside generate id");
        var oid = id_maker(parseInt(oracle_starts.value), 0,0, question.value);
        oracle.value = oid;
        oracle_text = question.value;
        //db.knowable = oracle_starts.value;
        //knowable_height.value = oracle_starts.value;
        knowable_height = parseInt(oracle_starts.value);
        var rest = "start: ".concat((oracle_starts).value).concat("<br />question: ").concat(question.value);
       // status.innerHTML = "status: <font color=\"green\">successfully generated the id: ".concat(oid).concat("<br /> Save the red data, you need it when creating the oracle on-chain:</font><br /><font color=\"red\"> ").concat(rest).concat("</font>");
    };
    //div.appendChild(generate_id_button);

    

    //glossary.rpc.messenger(div);

    if (mode == "test") {
        binary_test_config = "?mode=test&auto_fill=binary&oracle=mc4rc/fQyUAnyNwGCJEfIu1zzQGRR5FuMIUADsspXhA=&our_amount=1&their_amount=1&bet_direction=true";
        stablecoin_test_config = "?mode=test&auto_fill=stablecoin&oracle=mc4rc/fQyUAnyNwGCJEfIu1zzQGRR5FuMIUADsspXhA=&our_amount=1&current_value=0.1&bet_direction=true";
        scalar_test_config = "?mode=test&auto_fill=scalar&oracle=mc4rc/fQyUAnyNwGCJEfIu1zzQGRR5FuMIUADsspXhA=&our_amount=1&their_amount=1&bet_direction=true&upper_limit=500&lower_limit=0";

        binary_test = document.createElement("div");
        binary_test.innerHTML = "<a href=".concat(binary_test_config).concat(">binary test</a>");
        div.appendChild(binary_test);
        stablecoin_test = document.createElement("div");
        stablecoin_test.innerHTML = "<a href=".concat(stablecoin_test_config).concat(">stablecoin test</a>");
        div.appendChild(stablecoin_test);
        scalar_test = document.createElement("div");
        scalar_test.innerHTML = "<a href=".concat(scalar_test_config).concat(">scalar test</a>");
        div.appendChild(scalar_test);
    }
    
    var save_button_div = document.createElement("div");
    div.appendChild(save_button_div);
    //var their_address = text_input("their_address: ", div);
    var their_address = {value: ""};
    //var oracle = text_input("oracle: ", div);
    //glossary.link(div, "oracle_id");
    //div.appendChild(br());
    var oracle = document.createElement("INPUT");
    oracle.type = "text";


    //var knowable_height = text_input("knowable_height: ", div);
    //div.appendChild(br());
    var our_amount = document.createElement("INPUT");

  //  div.appendChild(br());
    //var payment_field = text_input("How much you pay for this contract. Make this negative to receive payment: ", div);
    //payment_field.value = "0";
    //glossary.link(div, "derivatives_payment");
  //  div.appendChild(br());
    var buttons_div = document.createElement("div");
    div.appendChild(buttons_div);
    var binaryButton = button_maker2("binary", binary_view);
  //  buttons_div.appendChild(binaryButton);
//    glossary.link(buttons_div, "binary_bet");
  //  buttons_div.appendChild(br());
    var scalarButton = button_maker2("scalar", scalar_view);
  //  buttons_div.appendChild(scalarButton);
  //  glossary.link(buttons_div, "scalar_bet");
  //  buttons_div.appendChild(br());
    var stablecoinButton = button_maker2("stablecoin", stablecoin_view);
 //   buttons_div.appendChild(stablecoinButton);
//    glossary.link(buttons_div, "stablecoin_bet");
  //  buttons_div.appendChild(br());
    var their_amount, bet_direction, delay, oracle_type, bits, upper_limit, lower_limit, bet_expires0;

    if (auto_fill_mode == "binary") {
        oracle.value=" ";
        return binary_view();
    } else if (auto_fill_mode == "stablecoin") {
        oracle.value=" ";
        return stablecoin_view();
    } else if (auto_fill_mode == "scalar") {
        oracle.value=" ";
        return scalar_view();
    };

    function scalar_view() {
        generate_id_function();
        var db = {oracle_text: oracle_text};
        if (oracle.value == "") {
            status.innerHTML = "status: <font color=\"red\">First choose the Oracle ID for your bet before clicking that.</font>";
            return 0;
        }
        buttons_div.innerHTML = "";
        their_amount = text_input("their bet amount, in veo: ", div);
    //    div.appendChild(br());
        bet_expires0 = text_input("how many blocks until this bet offer becomes invalid: ", div);
        bet_expires0.value = (100).toString();
      //  div.appendChild(br());
        bet_direction = text_input("you bet in direction (long/short): ", div);
    //div.appendChild(br());
    //var delay = text_input("how long should the delay be to close the channel without your partner's help?", div);
        delay = document.createElement("p");
        delay.value = (1000).toString();
    //    div.appendChild(br());
        oracle_type = document.createElement("p");
        oracle_type.value = "scalar";
    //var bits = text_input("if it is scalar, how many bits does it have?", div);
        bits = document.createElement("p");
        bits.value = "10";
        upper_limit = text_input("what is the upper limit?", div);
        //upper_limit.value = "1023";
    //    div.appendChild(br());
        lower_limit = text_input("what is the lower limit?", div);
        //lower_limit.value = "0";
      //  div.appendChild(br());
        if (auto_fill_mode == "scalar") { //defaults
            var OV = urlParams.get("oracle");
            if (OV == null) { OV = ""; };
            oracle.value = OV;
            var OA = urlParams.get("our_amount");
            if (OA == null) { OA = ""; };
            our_amount.value = OA;
            var TA = urlParams.get("their_amount");
            if (TA == null) { TA = ""; };
            their_amount.value = TA;
            var BD = urlParams.get("bet_direction");
            if (BD == null) { BD = ""; };
            bet_direction.value = BD;
            var OH = urlParams.get("oracle_height");
            if (OH == null) { OH = ""; };
            //knowable_height.value = OH;
            knowable_height = parseInt(OH);
            var UL = urlParams.get("upper_limit");
            if (UL == null) { UL = "1023"; };
            upper_limit.value = UL;
            var LL = urlParams.get("lower_limit");
            if (LL == null) { LL = "0"; };
            lower_limit.value = LL;
            oracle_type.value = "scalar";
        };
        var startButton = button_maker2("offer to make this trade via encrypted message to one person", start);
        //div.appendChild(startButton);
        var printButton = button_maker2("asfdsfsdfsd", print_offer);
        div.appendChild(printButton);
    }
    function binary_view() {
        
        //we need to create the oracle language first

        div.appendChild(br());
        var printButton = button_maker2("Go", pre_print_offer);
        div.appendChild(printButton);
            div.appendChild(status);
    }

    function pre_print_offer(){
        console.log("createNumber is " + createNumber);

       if (createNumber == 0){

        question.value = "W = https://www.coinmarketcap.com historical data daily close price; X = $" + coinPrice.value + "; Y = " + whichCoin.value + "; Z (in MM/DD/YYYY) = " + maturityDate1.value + "; return (price of Y is more than X as of Z as reported by W)";


        }

        if (createNumber == 1){

        question.value = "W = " + whichCoin.value +"; X = " + coinPrice.value + "; Y = empty; Z (in MM/DD/YYYY) = " + maturityDate1.value + "; return (Team W defeated Team X in the game that started on date Z (in local time))";
        }
        console.log(question.value);

        bet_direction = document.createElement("INPUT");


        if ((above.checked == true) && (below.checked == true)){
            status.innerHTML = "dont check both boxes";
            console.log("dont check both boxes");
            return 0;
        }

        if (above.checked == true){
            console.log("above is checked");
            bet_direction.value = "true";
        }

        if (below.checked == true){
            console.log("above is checked");
            bet_direction.value = "false";
        }



        console.log("aboveCheck is" + above.checked);




        buttons_div.innerHTML = "";
        their_amount = document.createElement("INPUT");
    //    div.appendChild(br());
        bet_expires0 = document.createElement("INPUT");

        bet_expires0.value = (5).toString();
        their_amount.value = theirAmount.value;


        our_amount.value = myAmount.value;
//herexyz

//figure out how to do the direction


//figure out the maturity block
//convert their date input into something readable
        var event = new Date(maturityDate1.value);
            event.setUTCHours(24);
        var startVar;
        console.log("checking date stuff3 " + (event.getTime() / 1000));
        console.log("checking date stuff2 " + (new Date(maturityDate1.value).getTime() / 1000));
        console.log("checking date stuff1 " + (Date.now() / 1000));
        console.log(maturityDate1.value);
        //didive by block time
        event = (event.getTime() / 1000);

        startVar = Number(((event - Number(Date.now() / 1000))/600));
        //we want to be >99.9% confident that the oracle start time is after the event has happened in real life. so we add four standard deviations 
        startVar = startVar + 4*Math.sqrt(startVar);
        if (createNumber == 0){
        oracle_starts.value = headers_object.top()[1] + Math.round(startVar);

        }

        if (createNumber == 1){
        oracle_starts.value = headers_object.top()[1] + Math.round(startVar) + Number(144);

        }
  //      oracle_height.value = oracle_starts.value;

        console.log("starts value is: " + oracle_starts.value);

     //   div.appendChild(br());

        delay = document.createElement("p");
        delay.value = (1000).toString();
   //     div.appendChild(br());


           generate_id_function();
        oracle_type = document.createElement("p");
        oracle_type.value = "binary";
        if (oracle.value == "") {
            status.innerHTML = "status: <font color=\"red\">First choose the Oracle ID for your bet before clicking that.</font>";
            return 0;
        }
            console.log("auto fill mode is: "+ auto_fill_mode);
        if (auto_fill_mode == "binary") { //defaults
            var OV = urlParams.get("oracle");
            if (OV == null) { OV = ""; };
            oracle.value = OV;
            var OA = urlParams.get("our_amount");
            if (OA == null) { OA = ""; };
            our_amount.value = OA;
            var TA = urlParams.get("their_amount");
            if (TA == null) { TA = ""; };
            their_amount.value = TA;
            var BD = urlParams.get("bet_direction");
            if (BD == null) { BD = ""; };
            bet_direction.value = BD;
            var OH = urlParams.get("oracle_height");
            if (OH == null) { OH = ""; };
            //knowable_height.value = OH;
            console.log("OH is here" + OH);
            OH = oracle_starts.value;
            knowable_height = parseInt(OH);
            oracle_type.value = "binary";
        };
        //var startButton = button_maker2("offer to make this trade via encrypted message to one person", start);
        //div.appendChild(startButton);
        console.log("did we get here");

        print_offer();
    }
    function stablecoin_view() {
        generate_id_function();
        if (oracle.value == "") {
            status.innerHTML = "status: <font color=\"red\">First choose the Oracle ID for your bet before clicking that.</font>";
            return 0;
        }
        buttons_div.innerHTML = "";
        status.innerHTML = "status: <font color=\"blue\">warning, stablecoin interface only works if the oracle asks for the price of X in Veo. Does not work if the oracle asks the price of Veo in X.</font>";
        //var their_amount = text_input("their bet amount: ", div);
        //div.appendChild(br());
        var current_value = text_input("the price to trade at in VEO: ", div);
        glossary.link(div, "stablecoin_current_value");
  //      div.appendChild(br());
        bet_expires0 = text_input("how many blocks until this bet offer becomes invalid: ", div);
        bet_expires0.value = (100).toString();
   //     div.appendChild(br());
        var measured_upper = text_input("upper limit of range being measured by the oracle: ", div);
	//merkle.request_proof("oracles", oracle.value, function(x) {
	//var question_hash = x[3];

        //console.log(oracle.value);
        setTimeout(function(){
            oracle_limit(oracle.value, function(s) {
                measured_upper.value = s;
            })
        }, 100);
   //     div.appendChild(br());
        //var lower_margin = text_input("lower margin: ", div); //defined by leverage
        //div.appendChild(br());
        var leverage = text_input("leverage: ", div);
        glossary.link(div, "stablecoin_leverage");
        leverage.value = "1";
   //     div.appendChild(br());
        bet_direction = text_input("which side of the contract do you want (stablecoin/long-veo): ", div);
        delay = document.createElement("p");
        delay.value = (1000).toString();
  //      div.appendChild(br());
        if (auto_fill_mode == "stablecoin") { //defaults
            var OV = urlParams.get("oracle");
            if (OV == null) { OV = ""; };
            oracle.value = OV;
            var OA = urlParams.get("our_amount");
            if (OA == null) { OA = ""; };
            our_amount.value = OA;
            var CV = urlParams.get("current_value");
            if (CV == null) { CV = ""; };
            current_value.value = CV;
            var BD = urlParams.get("bet_direction");
            if (BD == null) { BD = ""; };
            bet_direction.value = BD;
            //measured_upper.value = "130";
            delay.value = "1";//This might be unused.
        };
        oracle_type = document.createElement("p");
        oracle_type.value = "scalar";
        bits = document.createElement("p");
        bits.value = "10";
        function scalar_view2(callback) {
            db = decode_direction(db, bet_direction);
            if (db == 0) {
                return 0;
            }
            var cp = parseFloat(current_value.value);
            var a = read_veo(our_amount);
            var oracle_upper = parseFloat(measured_upper.value);
            var l = parseFloat(leverage.value);
            if (l < 1) {
                status.innerHTML = "status: <font color=\"red\">Error: leverage cannot be less than 1.</font>";
                return 0;
            }
            var cp2e = Math.min(1023, Math.max(0, (1023 * cp / oracle_upper)));
            var cp2 = Math.floor(cp2e);
            //var cp2 = Math.min(1023, Math.max(0, Math.floor(1024 * cp / oracle_upper)));
            //console.log("oracle upper");
            //console.log(oracle_upper);//60
            //console.log("cp");
            //console.log(cp);//32
            //console.log("cp2e");
            //console.log(cp2e);//546
            //console.log("cp2");
            //console.log(cp2);//546
            var lle =  Math.min(1023, Math.max(0, ((2 * cp2e) - 1023)));
            var ll =  Math.floor(lle);
            //var ll =  Math.min(1023, Math.max(0, Math.floor(cp2*(l-1)/l)));
            var ule =  Math.min(1023, Math.max(0, ((2*cp2e)-lle)));
            var ul = Math.floor(ule);
            //var ul =  Math.min(1023, Math.max(0, Math.floor((2*cp2)-lle)));
            //[60,0,130,1,472,0,944]
            lower_limit = document.createElement("p");
            lower_limit.value = (ll).toString();
            upper_limit = document.createElement("p");
            upper_limit.value = (ul).toString();
            their_amount = document.createElement("p");
            var ta;
            if (db.bet_direction_val == 1) {
                ta = (a * (ule - cp2e) / (cp2e - lle));
            } else if (db.bet_direction_val == 2) {
                ta = (a * (cp2e - lle) / (ule - cp2e));
            }
            /*
            console.log("lle");
            console.log(lle);
            console.log("ule");
            console.log(ule);
            console.log("cp2e - lle");
            console.log(cp2e - lle);
            console.log("ule - cp2e");
            console.log(ule - cp2e);
            console.log("a");
            console.log(a);
            console.log("ta");
            console.log(ta);
            */
            their_amount.value = (ta/100000000).toString();
            return callback(db);
        };
        //var startButton = button_maker2("offer to make this trade via encrypted message to one person", function() {
        //    return scalar_view2(start);
        //});
        //div.appendChild(startButton);
        var printButton = button_maker2("print an offer that anyone can accept", function(){ return scalar_view2(print_offer)});
        div.appendChild(printButton);
    }
    function decode_direction(db, bet_direction) {
        console.log("bet direction value is: " + bet_direction.value);

        var bdvt = bet_direction.value.trim();
        if ((bdvt == "true") || (bdvt == "long") || (bdvt == "stablecoin")) {
            db.bet_direction_val = 1;
        } else if ((bdvt == "false") || (bdvt == "short") || (bdvt == "long-veo")) {
            db.bet_direction_val = 2;
        } else {
    //        status.innerHTML = "status: <font color=\"red\">Error: you have to choose whether you want to buy stablecoins or long-veo.</font>";
     //       return 0;
        };
        return db;
    }
    function print_offer() {

        console.log(db0);
        return load_from_text_fields(db0, function(db) {
            return check_account_balances(db, function(db2) {
                var cp = make_contract_proposal(db2);
                //var sig1 = keys.keys_internal().sign(cp.ch).toDER();
                //var sig = btoa(array_to_string(sig1));
                //var sig = spk_sig(cp.ch);
                console.log(JSON.stringify(cp.ch));
                var sig = spk_sig(cp.ch);
                console.log("sig2");
                var sig_temp = spk_sig(db.sspk2[1]);
                console.log("sig3");
                if (!(check_spk_sig(keys.pub(), cp.ch, sig))) {
                    console.log("bad signature");
                    return 0;
                }
                console.log("sig4");
                if (!(check_spk_sig(keys.pub(), cp.ch, sig_temp))) {
                    console.log("bad signature2");
                    return 0;
                }
                console.log("sig5");
                cp.msg[12] = [-7, 2, sig];
                cp.msg[5] = 0;
                var height = headers_object.top()[1];
                console.log("betexpires value: " + bet_expires0.value);
                console.log("betexpires value2 height " + height);
                return merkle.request_proof("accounts", keys.pub(), function (acc) {
                    var nonce = acc[2]+1;
                    //var nc_offer = ["nc_offer", keys.pub(), nonce, height + 100, db.our_amount_val, db.their_amount_val, 1000, db.delay, db.cid, cp.ch];
                    //var cid_copy = JSON.parse(JSON.stringify(db.cid));
                    var nc_offer = ["nc_offer", keys.pub(), nonce, height + parseInt(bet_expires0.value), db.our_amount_val, db.their_amount_val, 1000, db.delay, db.cid_for_tx, cp.ch];
                    var ncs = keys.sign(nc_offer);

                    if (JSON.stringify([-6, cp.msg, ncs]).search("null") > 0){
                        return 0;
                        console.log("some bad data entry");
                        status.innerHTML = "bad data entry";

                    }
                 //   status.innerHTML = "status: <font color=\"blue\">put this data in a public place, for example <a href=\"http://64.227.21.70:8090/main.html\">this website</a> : </font> ".concat(JSON.stringify([-6, cp.msg, ncs]));
                    
                    //var p2p_url = url(8090, "64.227.21.70");
                    var p2p_msg = ["add", [-6, cp.msg, ncs]];
                    rpc.default_explorer(p2p_msg, function(X){
                        //getter(p2p_msg, p2p_url, function(X){
                                console.log("sent message to p2p server.");
                                console.log(JSON.stringify(X))
                            });

                        status.innerHTML = "<font color=\"blue\">Trade offer has been broadcast.";


                                //next we need to put this into the positionData

            if (window.localStorage.getItem("positionData"+keys.pub()) != null){

                var arr2 = new Array();
               // var positionData

                arr2.push(window.localStorage.getItem("positionData"+keys.pub()));
                arr2.push(JSON.stringify([-6, cp.msg, ncs]));

                console.log("existing array is"+ arr2);
                window.localStorage.setItem("positionData"+keys.pub(), arr2);

                console.log("positionData is 1st" + window.localStorage.getItem("positionData"+keys.pub()));


            }else{
                var arr = new Array();

            //    console.log("stringified C1 part 2 is" + C[1]);
          //      console.log("stringified C1 is" + JSON.stringify(C[1]));
        //        console.log("stringified to string is  " + '"' + JSON.stringify(C[1])+'"' );
        //        console.log("stringified to string2 is  " + JSON.parse(JSON.stringify(C[1])) );
                arr.push(JSON.stringify([-6, cp.msg, ncs]));
         //       console.log("array is:" + arr);
                    window.localStorage.setItem("positionData"+keys.pub(), JSON.stringify([-6, cp.msg, ncs]));
            //    window.localStorage.setItem("positionData"+keys.pub(), '"' + JSON.stringify(C[1])+'"');
                console.log("positionData is  " + window.localStorage.getItem("positionData"+keys.pub()));

            }

                    var channel_offer_name = document.createElement("INPUT");
                    channel_offer_name.style.display = 'none';
                    var today = new Date();
                    channel_offer_name.value = 'channel_offer'+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+','+today.getHours()+':'+today.getMinutes();
                    var saveOfferButton = button_maker2("save the channel offer to a file", function() {
                    


                        download(JSON.stringify([-6, cp.msg, ncs]), channel_offer_name.value, "text/plain");
                    

                    });
                 //   save_button_div.appendChild(saveOfferButton);
                 //   save_button_div.appendChild(br());
                });
            });
        });
    }

    var db0;

    function start() {
        db0 = {oracle_text: oracle_text};
        return load_from_text_fields(db, function(db1) {
            db1.their_address_val = 1;
            return check_account_balances(db, function(db2) {
                return propose_contract(db2, function(db3) {
                    return create_channel(db3, function(db4) {
                        return confirm_channel_is_live(db4);
                    });
                });
            });
        });
    }
    function load_from_text_fields(db, callback) {
        var db = {};
        //db.payment = read_veo(payment_field);
        db.payment = 0;
        //db.their_address_val = parse_address(their_address.value);
        db.their_address_val = "";
        db.oracle_val = oracle.value.trim().replace(/\./g,'');
        console.log("db oracle val is: " + db.oracle_val);

        if (!(db.oracle_val.length == 44)) {
            status.innerHTML = "status: <font color=\"red\">Error: oracle ID is badly formatted or missing</font>";
          //  return 0;
        }
        db.our_amount_val = read_veo(our_amount);
        db.their_amount_val = read_veo(their_amount);
        db.delay = parseInt(delay.value, 10);
        //db.expires = parse_int(expires.value, 10);
        if (oracle_type.value.trim() == "scalar") {
            db.oracle_type_val = 2;
            db.bits_val = 10;
            db.upper_limit = parseInt(upper_limit.value, 10);
            db.lower_limit = parseInt(lower_limit.value, 10);
        } else if (oracle_type.value.trim() == "binary") {
            db.oracle_type_val = 1;
        } else {
            status.innerHTML = "status: <font color=\"red\">Error: oracle_type must be 'scalar' or 'binary'</font>";
            return 0;
        }
        //var bet_direction_val;
        db = decode_direction(db, bet_direction);
        if (db == 0) {
            return 0;
        }
    //our private key needs to be loaded.
        return merkle.request_proof("oracles", db.oracle_val, function(x) {
            return rpc.post(["oracle", db.oracle_val], function(oracle_data) {
                console.log(oracle_data);
                if(!(oracle_data == 0)){
                    //db.knowable = x[4];
                    knowable_height = x[4];
                    oracle_text = oracle_data[2];
                };
                return callback(db);
            });
        });
    };
    function check_account_balances(db, callback) {
        return rpc.post(["account", keys.pub()], function(my_acc) {
            if (my_acc == 0) {
                status.innerHTML = "status: <font color=\"red\">Error: load a private key with sufficient funds.</font>";
                return 0;
            } else if (my_acc[1] < (db.our_amount_val)) {
                status.innerHTML = "status: <font color=\"red\">Error: you don't have enough funds to make a bet that big.</font>";
                return 0;
            }
            db.my_acc = my_acc;
            if (db.their_address_val == "") {
                return callback(db);
            }
            /*
            return rpc.post(["account", db.their_address_val], function(their_acc) {
                if (their_acc == 0) {
                    status.innerHTML = "status: <font color=\"red\">Error: your partner needs to have veo in their account to make a channel.</font>";
                    return 0;
                } else if (their_acc[1] < (db.their_amount_val)) {
                    console.log(their_acc);
                    console.log(db.their_amount_val);
                    status.innerHTML = "status: <font color=\"red\">Error: your partner doesn't have enough veo to make a bet that big.</font>";
                    return 0;
                }
                db.their_acc = their_acc;
                return callback(db);
            });
            */
        });
    }
    function make_contract_proposal(db) {
        var period = default_period();//10000000;//only one period because there is only one bet.
        var maxprice = Math.floor((10000 * (db.our_amount_val)) / (db.their_amount_val + db.our_amount_val));
        var amount = db.our_amount_val + db.their_amount_val;
        var oid = db.oracle_val;
        var height = headers_object.top()[1];
        var oracle_wait;
        if (mode == "production") {
            oracle_wait = 3000;
        } else {
            oracle_wait = 3000;
        }
        //var bet_expires = oracle_wait + db.oracle[10]; // bet expires should be at least 3000 after the oracle can expire.
        //var bet_expires = oracle_wait + db.knowable + 2000; // bet expires should be at least 3000 after the oracle can expire.
        var bet_expires = oracle_wait + knowable_height + 2000; // bet expires should be at least 3000 after the oracle can expire.
        var cid = btoa(random_cid(32));//generate a random 32 byte cid for the new channel.
        db.cid_for_tx = cid;
        db.cid = encode_cid(cid, keys.pub());
        db.expires = bet_expires, 
        db.acc1 = keys.pub();
        db.oid = oid;
        db.height = height;
        db.bits = db.bits_val;
        db.direction_val = db.bet_direction_val;
        db.maxprice = maxprice;
        if (db.oracle_type_val == 2) {
            db.oracle_type = "scalar";
        } else if (db.oracle_type_val == 1) {
            db.oracle_type = "binary";
            //db.maxprice = 1;
        }
        var spk2 = spk_maker(db, 0, amount, period);
        var contract = spk2[3][1];
        /*
        var sc;
        if (db.oracle_type_val == 1) {//scalar
            console.log(JSON.stringify([db.bet_direction_val, bet_expires, maxprice, keys.pub(), period, amount, oid, height, db.upper_limit, db.lower_limit, db.bits_val]));
            sc = scalar_market_contract(db.bet_direction_val, bet_expires, maxprice, keys.pub(), period, amount, oid, height, db.upper_limit, db.lower_limit, db.bits_val);
            console.log(sc);
        } else if (db.oracle_type_val == 0) {//binary
            sc = market_contract(db.bet_direction_val, bet_expires, maxprice, keys.pub(), period, amount, oid, height);
        } else {
            console.log("bad oracle type error");
            return 0;
        }
        //var spk = ["spk", keys.pub(), db.their_address_val, [-6], 0, 0, cid, 0, 0, db.delay];
        var spk = ["spk", keys.pub(), 0, [-6], 0, 0, cid, 0, 0, db.delay];
        //console.log(JSON.stringify(spk));
        var cd = channels_object.new_cd(spk, [], [], [], bet_expires, cid);
        //console.log(sc);
        var spk2 = market_trade(cd, amount, maxprice, sc, oid);
        */

        //console.log(JSON.stringify(spk2));
        var sig = spk_sig(spk2); 
        var sspk2 = ["signed", spk2, [-7, 2, sig], [-6]];
        //console.log(db.maxprice - 1);
        var pd = pd_maker(height, db.maxprice - 1, 9999, oid);
        //var sig = keys.raw_sign(serialize(pd));//should be about 73 bytes
        var sig = array_to_string(sign(btoa(pd), keys.keys_internal()));
        //console.log(JSON.stringify(sig));
        //var sig = keys.sign(pd)[2];//crashes here
        var signedPD = btoa(pd.concat(sig));//<<PD/binary, Signature/binary>>.
        //console.log("signed pd is");
        //console.log(JSON.stringify(signedPD));//111
        //console.log(JSON.stringify(signedPD));184
        //console.log(atob(signedPD).length);//110 //26 less
        //console.log("pd is");
        //console.log(JSON.stringify(btoa(pd)));
        //console.log(pd.length);40
        db.signedPD = signedPD;
        db.sspk2 = sspk2;
        var spk_nonce = spk2[8];
        var contract_sig = sspk2[2];
        var imsg;
        //var encoded_cid = hash((db.cid).concat(keys.pub()));
        //var encoded_cid = hash(string_to_array(atob(db.cid)).concat(string_to_array(atob(keys.pub()))));
        encoded_cid = encode_cid(db.cid, keys.pub());
        if (db.oracle_type_val == 1) {
            //this is binary
            imsg = [-6, db.bet_direction_val, bet_expires, maxprice, keys.pub(), db.their_address_val, period, db.our_amount_val, db.their_amount_val, oid, height, db.delay, contract_sig, signedPD, spk_nonce, db.oracle_type_val, db.cid, 0, 0, 0, db.payment, contract, knowable_height, btoa(oracle_text)];
        } else {
            //this is scalar
            //console.log(db.upper_limit);
            imsg = [-6, db.bet_direction_val, bet_expires, maxprice, keys.pub(), db.their_address_val, period, db.our_amount_val, db.their_amount_val, oid, height, db.delay, contract_sig, signedPD, spk_nonce, db.oracle_type_val, db.cid, db.bits_val, db.upper_limit, db.lower_limit, db.payment, contract, knowable_height, btoa(oracle_text)];
        }
        //console.log(JSON.stringify(imsg));
        //console.log("otc derivatives spk spk2 compare ");
        //console.log(JSON.stringify(spk));
        //console.log(JSON.stringify(spk2));
        var contract_hash = btoa(array_to_string(hash(serialize(spk2))));
        return {msg: imsg, ch: contract_hash};
    }
    function cid_grab(cid, l) {
        if (JSON.stringify(l) == "[]") { return "error"; }
        //console.log(JSON.stringify(l[0]));
        if (!(l[0][1][1] == undefined)){
            var cid2 = l[0][1][1][8];
            if (cid2 == cid) { return l[0].slice(1); }
        }
        return cid_grab(cid, l.slice(1));
    };

return {print_offer: print_offer, above: above, below: below, div: div, binary_view: binary_view};

})();


dcba.binary_view();

function returnCheckBox(){
    console.log(dcba.above.checked);
    console.log(dcba.below.checked);
}

    
