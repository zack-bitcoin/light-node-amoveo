(function otc_function() {
    var fee = 152050;
    var div = document.createElement("div");
    document.body.appendChild(div);

    //glossary.messenger(div);
    
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    div.appendChild(br());
    var save_button_div = document.createElement("div");
    div.appendChild(save_button_div);
    //var their_address = text_input("their_address: ", div);
    var their_address = {value: ""};
    var oracle = text_input("oracle: ", div);
    glossary.link(div, "oracle_id");
    div.appendChild(br());
    var our_amount = text_input("how many veo you put in the contract: ", div);
    div.appendChild(br());
    var payment_field = text_input("How much you pay for this contract. Make this negative to receive payment: ", div);
    payment_field.value = "0";
    glossary.link(div, "derivatives_payment");
    div.appendChild(br());
    var buttons_div = document.createElement("div");
    div.appendChild(buttons_div);
    var binaryButton = button_maker2("binary", binary_view);
    buttons_div.appendChild(binaryButton);
    glossary.link(buttons_div, "binary_bet");
    buttons_div.appendChild(br());
    var scalarButton = button_maker2("scalar", scalar_view);
    buttons_div.appendChild(scalarButton);
    glossary.link(buttons_div, "scalar_bet");
    buttons_div.appendChild(br());
    var stablecoinButton = button_maker2("stablecoin", stablecoin_view);
    buttons_div.appendChild(stablecoinButton);
    glossary.link(buttons_div, "stablecoin_bet");
    buttons_div.appendChild(br());
    var their_amount, bet_direction, delay, oracle_type, bits, upper_limit, lower_limit;

    function scalar_view() {
        if (oracle.value == "") {
            status.innerHTML = "status: <font color=\"red\">First choose the Oracle ID for your bet before clicking that.</font>";
            return 0;
        }
        buttons_div.innerHTML = "";
        their_amount = text_input("their bet amount, in veo: ", div);
        div.appendChild(br());
        bet_direction = text_input("you bet in direction (long/short): ", div);
    //div.appendChild(br());
    //var delay = text_input("how long should the delay be to close the channel without your partner's help?", div);
        delay = document.createElement("p");
        delay.value = (1000).toString();
        div.appendChild(br());
        oracle_type = document.createElement("p");
        oracle_type.value = "scalar";
    //var bits = text_input("if it is scalar, how many bits does it have?", div);
        bits = document.createElement("p");
        bits.value = "10";
        if (false) { //defaults
            oracle.value = "ZVTeL9pNLdgSQiQoVh/VudzPetXvFBVAV8B7lE+sruk=";
            our_amount.value = "1";
            their_amount.value = "1";
            bet_direction.value = "long";
            oracle_type.value = "scalar";
            payment_field.value = "0.2";
        };
        upper_limit = text_input("what is the upper limit?", div);
        upper_limit.value = "1023";
        div.appendChild(br());
        lower_limit = text_input("what is the lower limit?", div);
        lower_limit.value = "0";
        div.appendChild(br());
        var startButton = button_maker2("offer to make this trade via encrypted message to one person", start);
        //div.appendChild(startButton);
        var printButton = button_maker2("print an offer that anyone can accept", print_offer);
        div.appendChild(printButton);
    }
    function binary_view() {
        if (oracle.value == "") {
            status.innerHTML = "status: <font color=\"red\">First choose the Oracle ID for your bet before clicking that.</font>";
            return 0;
        }
        buttons_div.innerHTML = "";
        their_amount = text_input("their bet amount: ", div);
        div.appendChild(br());
        bet_direction = text_input("you win if outcome is (true/false): ", div);
        delay = document.createElement("p");
        delay.value = (1000).toString();
        div.appendChild(br());
        oracle_type = document.createElement("p");
        oracle_type.value = "binary";
        if (false) { //defaults
            //their_address.value = "BOzTnfxKrkDkVl88BsLMl1E7gAbKK+83pHCt0ZzNEvyZQPKlL/n8lYLCXgrL4Mmi/6m2bzj+fejX8D52w4U9LkI=";
            oracle.value = "3qHmn0Lw3nnhztzi95CgU/yomO/CfIPYICtxPQN7PbY=";
            our_amount.value = "1";
            their_amount.value = "1";
            bet_direction.value = "true";
            oracle_type.value = "binary";
            payment_field.value = "0.2";
        };
        var startButton = button_maker2("offer to make this trade via encrypted message to one person", start);
        //div.appendChild(startButton);
        var printButton = button_maker2("print an offer that anyone can accept", print_offer);
        div.appendChild(printButton);
    }
    function stablecoin_view() {
        if (oracle.value == "") {
            status.innerHTML = "status: <font color=\"red\">First choose the Oracle ID for your bet before clicking that.</font>";
            return 0;
        }
        buttons_div.innerHTML = "";
        status.innerHTML = "status: <font color=\"blue\">warning, stablecoin interface only works if the oracle asks for the price of X in Veo. Does not work if the oracle asks the price of Veo in X.</font>";
        //var their_amount = text_input("their bet amount: ", div);
        //div.appendChild(br());
        var current_value = text_input("current price: ", div);
        glossary.link(div, "stablecoin_current_value");
        div.appendChild(br());
        var measured_upper = text_input("upper limit of range being measured by the oracle: ", div);
	//merkle.request_proof("oracles", oracle.value, function(x) {
	//var question_hash = x[3];

        if (false) { //defaults
            //their_address.value = "BOzTnfxKrkDkVl88BsLMl1E7gAbKK+83pHCt0ZzNEvyZQPKlL/n8lYLCXgrL4Mmi/6m2bzj+fejX8D52w4U9LkI=";
            //their_address.value = "BMJBIx+CHECWjOAxeiDvs0QVR/cXgklc69kIi8dSpuu6/l7OSUQISwapLLu62zE4Md9LxcPoQXCds/Esv72oQsE=";
            oracle.value = "Niqpz6ch1G7RjAy8BC9MnqsjypaQjjaNTECnbszYzy0=";
            payment_field.value = "0";

            our_amount.value = "0.1";
            current_value.value = "70";
            //measured_upper.value = "130";
        };
        console.log(oracle.value);
        oracle_limit(measured_upper, oracle.value);
        div.appendChild(br());
        //var lower_margin = text_input("lower margin: ", div); //defined by leverage
        //div.appendChild(br());
        var leverage = text_input("leverage: ", div);
        glossary.link(div, "stablecoin_leverage");
        leverage.value = "1";
        div.appendChild(br());
        bet_direction = document.createElement("p");
        bet_direction.value = "long";
        delay = document.createElement("p");
        delay.value = (1000).toString();
        div.appendChild(br());
        oracle_type = document.createElement("p");
        oracle_type.value = "scalar";
        bits = document.createElement("p");
        bits.value = "10";
        function scalar_view2(callback) {
            var cp = parseFloat(current_value.value);
            var a = read_veo(our_amount);
            var oracle_upper = parseFloat(measured_upper.value); 
            var l = parseFloat(leverage.value);
            if (l < 1) {
                status.innerHTML = "status: <font color=\"red\">Error: leverage cannot be less than 1.</font>";
                return 0;
            }
            var cp2 = Math.min(1023, Math.max(0, Math.floor(1024 * cp / oracle_upper)));
            console.log(JSON.stringify([cp, a, oracle_upper, cp2]));//[60,1000000,0.04,1023]
            var ll =  Math.min(1023, Math.max(0, Math.floor(cp2*(l-1)/l)));
            var ul =  Math.min(1023, Math.max(0, Math.floor((2*cp2)-ll)));
            console.log(JSON.stringify([cp, a, oracle_upper, l, cp2, ll, ul]));
            //[60,0,130,1,472,0,944]
            lower_limit = document.createElement("p");
            lower_limit.value = (ll).toString();
            upper_limit = document.createElement("p");
            upper_limit.value = (ul).toString();
            their_amount = document.createElement("p");
            var ta = (a * (ul - cp2 ) / (cp2 - ll));
            console.log(JSON.stringify([ta, (ul - cp2), (cp2 - ll)]));
            their_amount.value = (ta/100000000).toString();
            return callback();
        };
        var startButton = button_maker2("offer to make this trade via encrypted message to one person", function() {
            return scalar_view2(start);
        });
        //div.appendChild(startButton);
        var printButton = button_maker2("print an offer that anyone can accept", function(){ return scalar_view2(print_offer)});
        div.appendChild(printButton);
    }
    function print_offer() {
        return load_from_text_fields(function(db) {
            return check_account_balances(db, function(db2) {
                var cp = make_contract_proposal(db2);
                //var sig1 = keys.keys_internal().sign(cp.ch).toDER();
                //var sig = btoa(array_to_string(sig1));
                //var sig = spk_sig(cp.ch);
                var sig = spk_sig(cp.ch);
                console.log("sign db.sspk2[1]");
                console.log(JSON.stringify(db.sspk2[1]));
                var sig_temp = spk_sig(db.sspk2[1]);
                if (!(check_spk_sig(keys.pub(), cp.ch, sig))) {
                    console.log("bad signature");
                    return 0;
                }
                if (!(check_spk_sig(keys.pub(), cp.ch, sig_temp))) {
                    console.log("bad signature2");
                    return 0;
                }
                cp.msg[12] = [-7, 2, sig];
                cp.msg[5] = 0;
                var height = headers_object.top()[1];
                return merkle.request_proof("accounts", keys.pub(), function (acc) {
                    var nonce = acc[2]+1;
                    var nc_offer = ["nc_offer", keys.pub(), nonce, height + 100, db.our_amount_val, db.their_amount_val, 1000, db.delay, db.cid, cp.ch];
                    var ncs = keys.sign(nc_offer);
                    status.innerHTML = "status: <font color=\"blue\">put this data in a public place: </font> ".concat(JSON.stringify([-6, cp.msg, ncs]));
                    
                    var channel_offer_name = text_input("channel_offer_name: ", save_button_div);
                    var today = new Date();
                    channel_offer_name.value = 'channel_offer'+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+','+today.getHours()+':'+today.getMinutes();
                    var saveOfferButton = button_maker2("save the channel offer to a file", function() {
                        download(JSON.stringify([-6, cp.msg, ncs]), channel_offer_name.value, "text/plain");
                    });
                    save_button_div.appendChild(saveOfferButton);
                    save_button_div.appendChild(br());
                });
            });
        });
    }
    function start() {
        return load_from_text_fields(function(db) {
            db.their_address_val = 1;
            return check_account_balances(db, function(db2) {
                return propose_contract(db2, function(db3) {
                    return create_channel(db3, function(db4) {
                        return confirm_channel_is_live(db4);
                    });
                });
            });
        });
    }
    function load_from_text_fields(callback) {
        console.log("start");
        var db = {};
        db.payment = read_veo(payment_field);
        //db.their_address_val = parse_address(their_address.value);
        db.their_address_val = "";
        db.oracle_val = oracle.value.trim().replace(/\./g,'');
        if (!(db.oracle_val.length == 44)) {
            status.innerHTML = "status: <font color=\"red\">Error: oracle ID is badly formatted or missing</font>";
            return 0;
        }
        db.our_amount_val = read_veo(our_amount);
        db.their_amount_val = read_veo(their_amount);
        db.delay = parseInt(delay.value, 10);
        //db.expires = parse_int(expires.value, 10);
        if (oracle_type.value.trim() == "scalar") {
            db.oracle_type_val = 1;
            db.bits_val = 10;
            db.upper_limit = parseInt(upper_limit.value, 10);
            db.lower_limit = parseInt(lower_limit.value, 10);
        } else if (oracle_type.value.trim() == "binary") {
            db.oracle_type_val = 0;
        } else {
            status.innerHTML = "status: <font color=\"red\">Error: oracle_type must be 'scalar' or 'binary'</font>";
            return 0;
        }
        //var bet_direction_val;
        var bdvt = bet_direction.value.trim();
        if ((bdvt == "true") || (bdvt == "long")) {
            db.bet_direction_val = 1;
        } else if ((bdvt == "false") || (bdvt == "short")) {
            db.bet_direction_val = 2;
        } else {
            status.innerHTML = "status: <font color=\"red\">Error:`you win if outcome is` must be 'true' or 'false'</font>";
            return 0;
        }
    //our private key needs to be loaded.
        //check all values are valid for making the contract.
        //check that the oracle exists, and if scalar that enough bits exist.
        return merkle.request_proof("oracles", db.oracle_val, function(x) {
            var result = x[2];
            if (!(result == 0)) {
                status.innerHTML = "status: <font color=\"red\">Error: That oracle does not exist.</font>";
                return 0;
            }
            db.oracle = x;
            if (db.oracle_type_val == 1) { //scalar
                status.innerHTML = "status: <font color=\"green\">Checking if the oracle exists.</font>";
                return verify_exists(db.oracle_val, 10, function() {return callback(db);});
            }
            return callback(db);
        });
    };
    function check_account_balances(db, callback) {
        console.log("start2");
        return variable_public_get(["account", keys.pub()], function(my_acc) {
            if (my_acc == "empty") {
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
            return variable_public_get(["account", db.their_address_val], function(their_acc) {
                if (their_acc == "empty") {
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
    function propose_contract(db, callback) {
        console.log("propose contract");
        status.innerHTML = "status: <font color=\"green\">checking if you have enough credits, possibly puchasing more.</font>";
        glossary.link(status, "messenger_credits");
        return messenger_object.min_bal(1000000, function(){
            return propose_contract2(db, callback)});
    }
    function make_contract_proposal(db) {

        var maxprice = Math.floor((10000 * (db.our_amount_val)) / (db.their_amount_val + db.our_amount_val)); 
        var period = 10000000;//only one period because there is only one bet.
        var amount = db.our_amount_val + db.their_amount_val;
        var oid = db.oracle_val;
        var height = headers_object.top()[1];
        console.log(db.oracle);
        console.log(db.oracle[10]);
        var bet_expires = 3000 + db.oracle[10]; // bet expires should be at least 3000 after the oracle can expire.
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
        var cid = btoa(random_cid(32));//generate a random 32 byte cid for the new channel.
        db.cid = cid;
        //var spk = ["spk", keys.pub(), db.their_address_val, [-6], 0, 0, cid, 0, 0, db.delay];
        var spk = ["spk", keys.pub(), 0, [-6], 0, 0, cid, 0, 0, db.delay];
        //console.log(JSON.stringify(spk));
        var cd = channels_object.new_cd(spk, [], [], [], bet_expires, cid);
        //console.log(sc);
        var spk2 = market_trade(cd, amount, maxprice, sc, oid);
        //console.log(JSON.stringify(spk2));
        var sig = spk_sig(spk2); 
        var sspk2 = ["signed", spk2, [-7, 2, sig], [-6]];
        var pd = pd_maker(height, maxprice - 1, 9999, oid);
        var sig = keys.raw_sign(pd);
        //var sig = keys.sign(pd)[2];//crashes here
        var signedPD = btoa(pd.concat(sig));//<<PD/binary, Signature/binary>>.
        //console.log("signed pd is");
        //console.log(JSON.stringify(signedPD));184
        //console.log(signedPD.length);
        //console.log(JSON.stringify(btoa(pd)));56
        //console.log(pd.length);
        db.signedPD = signedPD;
        db.sspk2 = sspk2;
        var spk_nonce = spk2[8];
        var contract_sig = sspk2[2];
        var imsg;
        if (db.oracle_type_val == 0) {
            imsg = [-6, db.bet_direction_val, bet_expires, maxprice, keys.pub(), db.their_address_val, period, db.our_amount_val, db.their_amount_val, oid, height, db.delay, contract_sig, signedPD, spk_nonce, db.oracle_type_val, db.cid, 0, 0, 0, db.payment];
        } else {
            //console.log(db.upper_limit);
            imsg = [-6, db.bet_direction_val, bet_expires, maxprice, keys.pub(), db.their_address_val, period, db.our_amount_val, db.their_amount_val, oid, height, db.delay, contract_sig, signedPD, spk_nonce, db.oracle_type_val, db.cid, db.bits_val, db.upper_limit, db.lower_limit, db.payment];
        }
        //console.log("otc derivatives spk spk2 compare ");
        //console.log(JSON.stringify(spk));
        //console.log(JSON.stringify(spk2));
        var contract_hash = btoa(array_to_string(hash(serialize(spk2))));
        return {msg: imsg, ch: contract_hash};
    }

    function propose_contract2(db, callback) {
        status.innerHTML = "status: <font color=\"blue\">sending trade request. Tell your partner to check their messages from the same server you are using. </font>";
        var imsg = make_contract_proposal(db).msg;
        return send_encrypted_message(imsg, db.their_address_val, function() { return callback(db); });
    };
    function create_channel(db, callback) {
        return messenger(["read", 0, keys.pub()], function(a) {
            //check every 10 seconds if Carol has responded with a signature for the smart contract.
            console.log("start 5 received messages: ");
            //console.log(JSON.stringify(a));
            var z = a.slice(1).map(function(a){ return keys.decrypt(a); });
            console.log(JSON.stringify(z));
            //z is like [[-6, SignNewChannelTx, spk_sig], ...] repeating pairs.
            //we should ignore any new_channel_tx that is for a channel that alredy exists. we should find the spk_sig that is valid for the db.sspk2 we are storing.
            var x = cid_grab(db.cid, z);
            if (x=="error") {
                return setTimeout(function() {return create_channel(db, callback);}, 10000);
            }
            var their_sig = x[1];
            var sspk = db.sspk2;
            sspk[3] = their_sig;
            var bool = verify_both(sspk);

            if (!(bool == true)) {
                console.log("bad signature on spk");
                status.innerHTML = "status: <font color=\"red\"> bad signature on spk. </font>";
                return 0;
            }
            var stx = x[0];
            var tx = stx[1];
            //var channel_tx = ["nc", db.acc1, db.acc2, fee, 0, db.amount1, db.amount2, db.delay, db.cid];
            if (!(tx[0] == "nc")) {
                status.innerHTML = "status: <font color=\"red\"> new channel tx incorrectly formatted. </font>";
                return 0;
            }
            if (!(tx.length = 9)) {
                status.innerHTML = "status: <font color=\"red\"> new channel tx wrong length. </font>";
                return 0;
            }
            if (!(tx[1] == keys.pub())) {
                status.innerHTML = "status: <font color=\"red\"> new channel tx wrong acc1. </font>";
                return 0;
            }
            if (!(tx[2] == db.their_address_val)) {
                status.innerHTML = "status: <font color=\"red\"> new channel tx wrong acc2. </font>";
                return 0;
            }
            if (!(tx[3] == fee)) {
                status.innerHTML = "status: <font color=\"red\"> new channel tx wrong fee. </font>";
                return 0;
            }
            merkle.request_proof("accounts", keys.pub(), function (acc) {
                var nonce = acc[2]+1;
            
                if (!(tx[4] == nonce)) {
                    status.innerHTML = "status: <font color=\"red\"> new channel tx nonce is wrong. </font>";
                    return 0;
                }
                var tav2, oav2;
                if (db.payment > 0) {
                    oav2 = db.payment;
                    tav2 = 0;
                } else {
                    oav2 = 0;
                    tav2 = -(db.payment)
                }
                if (!(tx[6] == (tav2 + db.their_amount_val))) {
                    console.log(db.their_amount_val);
                    console.log(tx[6]);
                    status.innerHTML = "status: <font color=\"red\"> new channel tx amount1 is wrong. </font>";
                    return 0;
                }
                if (!(tx[5] == (oav2 + db.our_amount_val))) {
                    console.log(db.our_amount_val);
                    console.log(tx[5]);
                    status.innerHTML = "status: <font color=\"red\"> new channel tx amount2 is wrong. </font>";
                    return 0;
                }
                if (!(tx[7] == db.delay)) {
                    status.innerHTML = "status: <font color=\"red\"> new channel tx amount2 is wrong. </font>";
                    return 0;
                }
                if (!(tx[8] == db.cid)) {
                    status.innerHTML = "status: <font color=\"red\"> new channel tx cid is wrong. </font>";
                    return 0;
                }
                var stx2 = keys.sign(stx);
                return variable_public_get(["txs", [-6, stx2]], function(x) {
                    //sign and publish the new channel tx.
                    console.log(x);
                    status.innerHTML = "status: <font color=\"green\">trade request was accepted, now making a channel. You need to save the channel data.</font>";
                    var meta = 0;
                    var ss = channels_object.new_ss([0,0,0,0,4], [-6, ["oracles", db.oracle_val]], meta);
                    var expiration = 10000000;
                    var cd = channels_object.new_cd(sspk[1], sspk, [ss], [ss], expiration, db.cid);
                    channels_object.write(db.their_address_val, cd);
                    
                    return callback(db);
                });
            });
        });
    };
    function cid_grab(cid, l) {
        if (JSON.stringify(l) == "[]") { return "error"; }
        console.log(JSON.stringify(l[0]));
        console.log(JSON.stringify(l[0][1]));
        console.log(JSON.stringify(l[0][1][1]));
        if (!(l[0][1][1] == undefined)){
            var cid2 = l[0][1][1][8];
            if (cid2 == cid) { return l[0].slice(1); }
        }
        return cid_grab(cid, l.slice(1));
    }
    function confirm_channel_is_live(db) {
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("channel is ");
            console.log(c);
            if (c == "empty") {
                return headers_object.on_height_change(function() { return confirm_channel_is_live(db); });
            }
            status.innerHTML = "status: <font color=\"green\">The channel has been formed, and the smart contract is active. If you have saved a copy of the signed smart contract, then it is now safe to close the browser.</font>";
        });
    };
})();


