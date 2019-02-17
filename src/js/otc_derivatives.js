(function otc_function() {
    //var delay = 1000;//a little over a week
    var fee = 152050;
    var div = document.createElement("div");
    document.body.appendChild(div);

    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    var their_address = text_input("their_address: ", div);
    their_address.value = "BOzTnfxKrkDkVl88BsLMl1E7gAbKK+83pHCt0ZzNEvyZQPKlL/n8lYLCXgrL4Mmi/6m2bzj+fejX8D52w4U9LkI=";
    div.appendChild(br());
    var oracle = text_input("oracle: ", div);
    div.appendChild(br());
    //oracle.value = "Yv1P3aApVXpTLhgOVD84YcpI/fLyZyFTBbNB293u5v0=";
    oracle.value = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABs=";
    //oracle.value = "17zed/N0Ux50SljWJU+ZYZr64F6+6muGDnCRIceCPuc=";
    var our_amount = text_input("our bet amount: ", div);
    our_amount.value = "1";
    div.appendChild(br());
    var their_amount = text_input("their bet amount: ", div);
    their_amount.value = "1";
    div.appendChild(br());
    var bet_direction = text_input("you win if outcome is: ", div);
    bet_direction.value = "true";
    div.appendChild(br());
    var delay = text_input("how long should the delay be to close the channel without your partner's help?", div);
    delay.value = (1000).toString();
    div.appendChild(br());
    var oracle_type = text_input("scalar or binary oracle?: ", div);
    oracle_type.value = "scalar";
    div.appendChild(br());
    //var bits = text_input("if it is scalar, how many bits does it have?", div);
    var bits = document.createElement("p");
    bits.value = "10";
    //div.appendChild(br());
    var upper_limit = text_input("if it is scalar, what is the upper limit?", div);
    upper_limit.value = "1023";
    div.appendChild(br());
    var lower_limit = text_input("if it is scalar, what is the upper limit?", div);
    lower_limit.value = "0";
    div.appendChild(br());
    var startButton = button_maker2("offer to make this trade", start);
    div.appendChild(startButton);
    function start() {
        console.log("start");
        var db = {};
        db.their_address_val = parse_address(their_address.value);
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
        if (bet_direction.value.trim() == "true") {
            db.bet_direction_val = 1;
        } else if (bet_direction.value.trim() == "false") {
            db.bet_direction_val = 0;
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
            return start2(db);
        });
    }
    function start2(db) {
        console.log("start2");
        return variable_public_get(["account", keys.pub()], function(my_acc) {
            if (my_acc == "empty") {
                status.innerHTML = "status: <font color=\"red\">Error: load a private key with sufficient funds.</font>";
                return 0;
            } else if (my_acc[1] < (db.our_amount_val + 1000000)) {
                status.innerHTML = "status: <font color=\"red\">Error: you don't have enough funds to make a bet that big.</font>";
                return 0;
            }
            db.my_acc = my_acc;
            return variable_public_get(["account", db.their_address_val], function(their_acc) {
                if (their_acc == "empty") {
                    status.innerHTML = "status: <font color=\"red\">Error: your partner needs to have veo in their account to make a channel.</font>";
                    return 0;
                } else if (their_acc[1] < (db.their_amount_val + 1000000)) {
                    status.innerHTML = "status: <font color=\"red\">Error: you partner doesn't have enough veo to make a bet that big.</font>";
                    return 0;
                }
                db.their_acc = their_acc;
                return start3(db);
            });
        });
    }
    function credits_check(pub, minAmount, callback) {
        F = function() { return buy_credits(Math.floor(minAmount * 1.2), callback); };
        return messenger(["account", keys.pub()], function(a) {
            if (a == 0) { //10 milibits
                //account does not exist
                status.innerHTML = "status: <font color=\"green\">Buying credits.</font>";
                return F();
            } else if (a[1] < minAmount) {
                status.innerHTML = "status: <font color=\"green\">Buying credits.</font>";
                //account has insufficient balance
                return F();
            }
            return callback();
        });
    }
    function start3(db) {
        console.log("start3");
        return credits_check(keys.pub(), 1000000, function(){return start4(db)} );
    }
    
    function random_cid(n) {
        if (n == 0) { return ""; }
        else {
            var rn = Math.floor(Math.random() * 256);
            var rl = String.fromCharCode(rn);
            return rl.concat(random_cid(n-1))}
        //btoa(String.fromCharCode(0,255,10));
    };
    function start4(db) {
        return messenger(["account", keys.pub()], function(a) {
            console.log("account is (start4)");
            console.log(a);

            if ((a == 0) || (a[1] < 1000000)) { //10 milibits
                //wait enough confirmations until you have the credits.
                //return headers_object.on_height_change(function() { return start4(db); });
                return setTimeout(function() {return start4(db);}, 20000);
            }
            console.log("your account ");
            console.log(a);
            status.innerHTML = "status: <font color=\"blue\">sending trade request. Tell your partner to check their messages from the same server you are using. </font>";
            var maxprice = Math.floor((10000 * (db.our_amount_val)) / (db.their_amount_val + db.our_amount_val)); //calculation of maxprice is probably wrong.
            var period = 10000000;//only one period because there is only one bet.
            var amount = db.our_amount_val + db.their_amount_val;
            var oid = db.oracle_val;
            var height = headers_object.top()[1];
            console.log(db.oracle);
            console.log(db.oracle[10]);
            var bet_expires = 3000 + db.oracle[10]; // bet expires should be at least 3000 after the oracle can expire.
            var sc;
            if (db.oracle_type_val == 1) {//scalar
                
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
            var spk = ["spk", keys.pub(), db.their_address_val, [-6], 0, 0, cid, 0, 0, db.delay];
            //console.log(JSON.stringify(spk));
            var cd = channels_object.new_cd(spk, [], [], [], bet_expires, cid);
            //console.log(sc);
            var spk2 = market_trade(cd, amount, maxprice, sc, oid);
            //console.log(JSON.stringify(spk2));
            var sspk2 = keys.sign(spk2);
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
                imsg = [-6, db.bet_direction_val, bet_expires, maxprice, keys.pub(), db.their_address_val, period, db.our_amount_val, db.their_amount_val, oid, height, db.delay, contract_sig, signedPD, spk_nonce, db.oracle_type_val, db.cid];
            } else {
                console.log(db.upper_limit);
                imsg = [-6, db.bet_direction_val, bet_expires, maxprice, keys.pub(), db.their_address_val, period, db.our_amount_val, db.their_amount_val, oid, height, db.delay, contract_sig, signedPD, spk_nonce, db.oracle_type_val, db.cid, db.bits_val, db.upper_limit, db.lower_limit];
            }
            return send_encrypted_message(imsg, db.their_address_val, function() { return start5(db); });
        });
    };
    function start5(db) {
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
                return setTimeout(function() {return start5(db);}, 10000);
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
                if (!(tx[6] == db.their_amount_val)) {
                    console.log(db.their_amount_val);
                    console.log(tx[6]);
                    status.innerHTML = "status: <font color=\"red\"> new channel tx amount1 is wrong. </font>";
                    return 0;
                }
                if (!(tx[5] == db.our_amount_val)) {
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
                    
                    return start6(db);
                });
            });
        });
    };
    function cid_grab(cid, l) {
        if (JSON.stringify(l) == "[]") { return "error"; }
        console.log(JSON.stringify(l[0]));
        console.log(JSON.stringify(l[0][1]));
        console.log(JSON.stringify(l[0][1][1]));
        var cid2 = l[0][1][1][8];
        if (cid2 == cid) { return l[0].slice(1); }
        return cid_grab(cid, l.slice(1));
    }
    function start6(db) {
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("channel is ");
            console.log(c);
            if (c == "empty") {
                return headers_object.on_height_change(function() { return start6(db); });
                //return setTimeout(function(){return start6(db);},
                 //                 10000);
            }
            status.innerHTML = "status: <font color=\"green\">The channel has been formed, and the smart contract is active. If you have saved a copy of the signed smart contract, then it is now safe to close the browser.</font>";
        });
    };
})();


