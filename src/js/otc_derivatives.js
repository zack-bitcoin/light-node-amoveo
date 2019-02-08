(function otc_function() {
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
    oracle.value = "0fbZfpka2gqBaHVf+d2AtBnLZRHD64J+VTyfOW/C/f4=";
    var our_amount = text_input("our bet amount: ", div);
    our_amount.value = "1";
    div.appendChild(br());
    var their_amount = text_input("their bet amount: ", div);
    their_amount.value = "1";
    div.appendChild(br());
    var bet_direction = text_input("you win if outcome is: ", div);
    bet_direction.value = "true";
    div.appendChild(br());
    var oracle_type = text_input("scalar or binary oracle?: ", div);
    oracle_type.value = "binary";
    div.appendChild(br());
    var bits = text_input("if it is scalar, how many bits does it have?", div);
    div.appendChild(br());
    //var expires = text_input("when does the bet expire?", div);
    //div.appendChild(br());
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
        db.bits_val = parseInt(bits.value, 10);
        //db.expires = parse_int(expires.value, 10);
        if (oracle_type.value.trim() == "scalar") {
            db.oracle_type_val = 1;
            db.bits_val = parseInt(bits, 10);
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
                return F();
            } else if (a[1] < minAmount) {
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
    function unused() {

        return messenger(["account", keys.pub()], function(a) {
            console.log("account is ");
            console.log(a);
            //["acc", 104450000, 0, 0]
            if (a == 0) { //10 milibits
                //account does not exist
                buy_credits(1200000, function() { return start4(db); });
            } else if (a[1] < 1000000) {
                //account has insufficient balance
                buy_credits(1200000, function() { return start4(db); });
            }
            return start4(db);
        });
    };
    function buy_credits(Amount, callback) {
        status.innerHTML = "status: <font color=\"green\">you don't have enough credits, now puchasing more.</font>";
        return variable_public_get(["pubkey"], function(server_pubkey) {
            console.log("server pubkey ");
            console.log(server_pubkey);
            return fee_checker(
                keys.pub(),
                function(x) {
                    var s = "fail. the server's account should already exist.";
                    console.log(s);
                    return s;
                }, function (Fee) {
		    return variable_public_get(["spend_tx", 1200000, Fee, keys.pub(), server_pubkey], function(tx) {
                        //this tx purchases more credits.
                        var stx = keys.sign(tx);
                        variable_public_get(["txs", [-6, stx]], function() {
                            return callback;
                        });
                    });
                });
        });
    }
    
    function random_cid(n) {
        if (n == 0) { return ""; }
        else {
            var rn = Math.floor(Math.random() * 256);
            var rl = String.fromCharCode(rn);
            return rl.concat(random_cid(n-1))}
        //btoa(String.fromCharCode(0,255,10));
    };
    function make_bytes(bytes, b) {
        if (bytes == 0) {
            return "";
        } else {
            var r = b % 256;
            var d = Math.floor(b / 256);
            var l = String.fromCharCode(r);
            var t = make_bytes(bytes - 1, d);
            return t.concat(l);
        }
    };
    function pd_maker(height, price, portion, oid) {
            //PD = <<Height:32, Price:16, PortionMatched:16, MarketID/binary>>,
        var a = make_bytes(4, height);
        var b = make_bytes(2, price);
        var c = make_bytes(2, portion);
        var d = atob(oid);
        return a.concat(b).concat(c).concat(d);
    }
    function start4(db) {
        return messenger(["account", keys.pub()], function(a) {
            console.log("account is (start4)");
            console.log(a);
            if (a[1] < 1000000) { //10 milibits
                //wait enough confirmations until you have the credits.
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
            var bet_expires = 3000 + db.oracle[10]; // bet expires should be at least 3000 after the oracle can expire.
            var sc = market_contract(db.bet_direction_val, bet_expires, maxprice, keys.pub(), period, amount, oid, height);//height
            var delay = 1000;//a little over a week
            var cid = btoa(random_cid(32));//generate a random 32 byte cid for the new channel.
            db.cid = cid;
            var spk = ["spk", keys.pub(), db.their_address_val, [-6], 0, 0, cid, 0, 0, delay];
            var cd = channels_object.new_cd(spk, [], [], [], bet_expires, cid);
            var spk2 = market_trade(cd, amount, maxprice, sc, oid);
            var sspk2 = keys.sign(spk2);
            var pd = pd_maker(height, maxprice - 1, 9999, oid);
            var sig = keys.raw_sign(pd);
            //var sig = keys.sign(pd)[2];//crashes here
            var signedPD = btoa(pd.concat(sig));//<<PD/binary, Signature/binary>>.
            db.signedPD = signedPD;
            db.sspk2 = sspk2;
            var spk_nonce = spk2[8];
            var contract_sig = sspk2[2];
            var imsg = [-6, db.bet_direction_val, bet_expires, maxprice, keys.pub(), db.their_address_val, period, db.our_amount_val, db.their_amount_val, oid, height, delay, contract_sig, signedPD, spk_nonce, db.oracle_type_val, db.cid];
            var emsg = keys.encrypt(imsg, db.their_address_val);
            messenger(["account", keys.pub()], function(account) {
                console.log("account is ");
                console.log(JSON.stringify(account));
                var nonce = account[3] + 1;
                //nonce = 0;//look up nonce from account, add 1 to it.
                //var r = [53412, keys.pub(), nonce, emsg];
                var r = [-7, 53412, keys.pub(),nonce,emsg];
                console.log(JSON.stringify(r));
                var sr = keys.sign(r);
                //console.log("check signature");
                //console.log(verify1(sr));
                return messenger(["send", 0, db.their_address_val, sr], function(x) {
                    return start5(db);
                });
            });
        });
    };
    function start5(db) {
        return messenger(["read", 0, keys.pub()], function(a) {
            //check every 10 seconds if Carol has responded with a signature for the smart contract.
            console.log("start 5 received messages: ");
            console.log(JSON.stringify(a));
            if (1==1) {
                return setTimeout(function() {return start5(db);}, 10000);
            }
            //verify that Carol signed the same contract as us.


        //The light node makes a big warning, telling Bob that he needs to save the signed smart contract to a file. once he saves, the message disappears.
            status.innerHTML = "status: <font color=\"green\">trade request was accepted, now making a channel.</font>";
            //The light node signs a tx to make the channel, send it as an encrypted message to Carol.
            return start6(db);
        });
    };
    function start6(db) {
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("channel is ");
            console.log(c);
        //The light node checks every 10 seconds until it sees that the new tx has been included in a block.
        //keep checking until the channel is existing on-chain.
            status.innerHTML = "status: <font color=\"green\">The channel has been formed, and the smart contract is active. If you have saved a copy of the signed smart contract, then it is now safe to close the browser.</font>";
            //after you save, the message about needing to save changes to "it is now safe to turn off the light node, make sure to keep a copy of the channel state that you have already saved to a file."
        });
    };
})();


