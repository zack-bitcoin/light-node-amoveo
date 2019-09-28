(function otc_finisher() {
    var early_close_code = 5927;
    var div = document.createElement("div");
    document.body.appendChild(div);
    var title = document.createElement("h3");
    title.innerHTML = "p2p derivatives contract finisher.";
    div.appendChild(title);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    //var their_address = text_input("their_address: ", div);
    //div.appendChild(br());
    var workspace = document.createElement("div");
    div.appendChild(workspace);
    


    var start_button = button_maker2("load your keys and channel data, then click this", start1);
    workspace.appendChild(start_button);
    workspace.appendChild(br());

    var channel_proposal = text_input("if you proposed the channel, then you might not have channel data. Use this interface instead. channel proposal: ", workspace);
    var proposers_button = button_maker2("load keys and channel proposal, then click this.", proposer_start);
    workspace.appendChild(proposers_button);
    workspace.appendChild(br());
    div.appendChild(br());
    //we need a tool for solo-closing the channel, for if your partner refuses to help you. (maybe for now asking for help on a forum is good enough?)
    function proposer_start() {
        var x = JSON.parse(channel_proposal.value);
        var db = derivatives_load_db(x[1]);
        var period = default_period();
        var spk = spk_maker(db, 0, db.amount1 + db.amount2, period);
        spk[3][1] = x[1][21];//load the contract from the saved copy. don't trust ourselves to re-compute it the same way.
        //console.log("proposer start, contract 2");
        //        console.log(JSON.stringify(spk));
        //var sspk1 = keys.sign(spk);
        var sig = spk_sig(spk);
        //console.log(JSON.stringify(sspk1));
        merkle.request_proof("channels", db.cid, function(c) {
            var acc2 = c[3];
            console.log("proposer start");
            console.log(acc2);
            return variable_public_get(["channel_sig", db.cid], function(sig2) {
                //var sspk1;
                //if (keys.pub() == acc2) {
                //    sspk1 = ["signed", spk, [-6], [-7, 2, sig]];
                //} else {
                var sspk1 = ["signed", spk, [-7, 2, sig], [-7, 2, sig2]];
                //};
                //sspk1[3] = [-7, 2, sig2];
                return(record_channel_state(sspk1, db, acc2, start1));
                //return start1();
            });
        });
    };
    function start1() {
        //console.log(JSON.stringify(channels_object.channel_manager));
        var db = {};
        db.fee = 152050;
        //var cd = channels_object.read(their_address.value);
        var their_address_val = Object.keys(channels_object.channel_manager())[0];
        db.cd = channels_object.read(their_address_val);
        //console.log(JSON.stringify(db.cd));
        //var spk = cd.me;
        db.spk = db.cd.me;
        console.log(JSON.stringify(db.spk));
        console.log(JSON.stringify(db.cd));
        db.address1 = db.spk[1];
        if (db.address1 == keys.pub()) {
            db.address2 = their_address_val;
        } else {
            db.address2 = keys.pub();
        }
        //if (!(db.spk[2] == 0)) {
        //} else {
        //    db.address2 = db.spk[2];
        //}
        db.cid = db.spk[6];
        db.amount = db.spk[7];
        console.log("lookup channel ");
        console.log(db.cid);
        workspace.innerHTML = "";
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("channel is ");
            console.log(c);
            if ((c == 0) || (c == "empty")) {
                status.innerHTML = "status: <font color=\"red\">that channel does not exist. Maybe you haven't synced with the network, or maybe it is already closed, or maybe it never existed.</font>";
                return 0;
            };
            status.innerHTML = "status: <font color=\"green\"> valid channel being loaded </font>";
            console.log(JSON.stringify(c));
            if (!(c[7] == 1)) {
                //channel is being closed, maybe we need to offer them the ability to do a channel_slash tx. channel-slash
                var slash_button_div = document.createElement("div");
                slash_button_div.innerHTML = "click the 'slash' button to attempt to make a channel-slash tx. Do this if your partner is trying to close the channel at the wrong final state.";
                div.appendChild(slash_button_div);
                var slash_button = button_maker2("slash", function() { return slash_func(db); });
                div.appendChild(slash_button);

                var timeout_button_div = document.createElement("div");
                timeout_button_div.innerHTML = "click the 'timeout' button to attempt to make a channel-timeout tx. Do this if you already did a channel_slash tx, and then waited the delay.";
                var timeout_button = button_maker2("timeout", function() { return timeout_func(db); });
                div.appendChild(timeout_button);
                //return 0;
            }
            db.channel_balance1 = c[4];
            db.channel_balance2 = c[5];
            //db.channel_amount = c[6];
            var bet = db.spk[3][1];
            //console.log(JSON.stringify(bet));
            //["bet",code,300000000,["market",1,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",3000,"BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=",10000000,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk="],[-7,1,5000]]
            var key = bet[3];
            var meta = bet[4];
            db.direction = meta[1];//1 is a bet on true, 2 is false.
            //console.log(JSON.stringify(key));
            //["market",1,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",3000,"BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=",10000000,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk="]
            db.oid = key[2];
            //db.type = key[1];
            console.log("otc finisher key is ");
            console.log(JSON.stringify(key));
            db.oracle_type_val = key[1];
            if (db.oracle_type_val == 2) {
                db.lower_limit = key[7];
                db.upper_limit = key[8];
            }
            console.log("otc finisher");
            merkle.request_proof("oracles", db.oid, function(Or) {
                console.log(JSON.stringify(Or));
                //["oracle","wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",0,"yAKJm0Zl9jpFBkbolYXdqOKe90nndgCHskmkw8DhSiE=",1000,3,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","BIVZhs16gtoQ/uUMujl5aSutpImC4va8MewgCveh6MEuDjoDvtQqYZ5FeYcUhY/QLjpCBrXjqvTtFiN4li0Nhjo=",1001,0,0]
                if (Or == "empty") {
                    console.log("oracle does not yet exist");
                    status.innerHTML = ("status: <font color=\"red\"> The bet, on oracle ID: ").concat(db.oid).concat(" , this oracle has not been created yet.</font>");
                    db.result = text_input("result of the oracle: ", workspace);
                    return close_early_view(db);
                } else {
                
                    db.result = Or[2];//3 is bad, 2 is false, 1 is true, 0 is still open
                    if (db.result == 0) {//oracle still open
                        var done_timer = Or[9];
                        status.innerHTML = ("status: <font color=\"red\"> The bet, on oracle ID: ").concat(db.oid).concat(" , is not yet settled. The oracle has not been finalized. It is expected to be settled a little after block height ").concat((done_timer).toString()).concat("</font>");
                        if (db.oracle_type_val == 1) {
                            db.result = text_input("outcome is true/false/bad: ", workspace);
                        } else if (db.oracle_type_val == 2) {
                            db.result = text_input("final price of the asset: ", workspace);
                        }
                        return close_early_view(db);
                    };
                    console.log("otc finisher");
                    close_early_view(db);
                    return start2(db);
                }
            });
        });
    }
    function start2(db) {
        //oracle has been closed already.
        //cev2(db);
        //var close_offer = text_input("close offer proposal: ", workspace);
        //var listen_button = button_maker2("load the proposal.", function() {
        //    display_close_offer2(JSON.parse(close_offer.value), db)
        //});
        //workspace.appendChild(listen_button);
        //workspace.appendChild(br());
        //var talk_button = button_maker2("make a proposal to close the channel.", function() {
        //    return we_send(db);//HERE
        //    //instead we should create a ctc offer.
        //});
        //workspace.appendChild(talk_button);
        //workspace.appendChild(br());
        var solo_button = button_maker2("Avoid clicking this if you don't have to. click here to attempt to make a solo-close tx. Do this if your partner is refusing to work with you to close the channel. This costs more money than the normal way to close a channel, and it will take more time to finish.", function() { return solo_func(db); });
        workspace.appendChild(solo_button);
    };

       /* 
        return messenger(["read", 1, db.cid, keys.pub()], function(txs) {
            if ((txs == btoa("error"))||(JSON.stringify(txs) == "[-6]")) {
                //no one has sent us this kind of message yet.
                //not yet received final state
                return we_send0(db);
            }
            var s1ctc = find_ctc(db.cid, txs.slice(1));
            if (ctc == "error") {
                return we_send0(db);
            }
            console.log(s1ctc);
            var sctc = keys.sign(s1ctc);
            console.log(sctc);
            var ctc = sctc[1];
            var b = verify_both(sctc);
            if (!(b == true)) {
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a bad signature</font>");
                return we_send0(db);
            }
            if (!(db.address1 == ctc[1])) {
                console.log(db.address1);
                console.log(ctc[1]);
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a wrong address 1</font>");
                return 0;
            }
            if (!(db.address2 == ctc[2])) {
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a wrong address 2</font>");
                return 0;
            }
            if (!(db.fee == ctc[3])) {
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a wrong fee</font>");
                return 0;
            }
            if (!(db.cid == ctc[5])) {
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a wrong cid</font>");
                return 0;
            }
            winnings_amount(db, function(db, winnings) {
                if (!(winnings == ctc[6])) {
                    status.innerHTML = ("status: <font color=\"red\"> CTC tx has a wrong final balances.</font>");
                    return 0;
                }


                return variable_public_get(["txs", [-6, sctc]], function(x) {
            
                    status.innerHTML = ("status: <font color=\"green\"> CTC tx is being published.</font>");
                    return wait_till_closed(db);
                });
            });
        });
    };
       */
    function close_early_view(db) {
        //show an interface for closing the channel early.
        if (db.oracle_type_val == 1) {
            //binary: ask true/false
            //db.result = text_input("outcome is true/false/bad: ", workspace);
            return cev2(db);
        } else if (db.oracle_type_val == 2) {
            //scalar: look up oracle_max measurement, ask for the final price.
            //db.result = text_input("final price of the asset: ", workspace);
            oracle_limit(db.oid, function(x) {
                console.log("set measured upper");
                db.measured_upper = parseFloat(x);
                return cev2(db);
            });
        }
    };
    function cev2(db){
        var early_button = button_maker2("generate a proposal to end the contract early and get your money out.", function() {
            //generate the signed ctc. send it along with the binary/scalar result used to generate it.
            var result;
            if(db.result.value){
                result = db.result.value;
            } else {
                result = db.result;
            }
            var x = oracle_value(db, result);
            console.log(JSON.stringify([result, x]));
            //return oracle_value(db, result, function(x) {
	    //return merkle.request_proof("accounts", db.address1, function(acc) {
                //nonce = acc[2]+1;
            var amount1 = db.channel_balance1 + x;
            var amount2 = db.channel_balance2 - x;
            var height = headers_object.top()[1];
	    var tx = ["ctc2", db.address1, db.address2, db.fee, db.cid, amount1, amount2, height+100, height];
            console.log(JSON.stringify(tx));
            var stx = keys.sign(tx);
            var imsg = [-6, early_close_code, db.oracle_type_val, result, stx];
            var their_address_val = Object.keys(channels_object.channel_manager())[0];
                //return send_encrypted_message(imsg, their_address_val, function() {
            var balances_string = calc_balances(db, x);
            status.innerHTML = ("status: <font color=\"blue\">Successfully generated an offer to close the channel.").concat(balances_string).concat(" Tell your partner to visit this page. Do not delete your channel state yet. Click 'get headers' to see if the contract is settled yet. give this data to your partner: </font> ".concat(JSON.stringify(imsg)));
            return wait_till_closed(db);
            //});
        });
        workspace.appendChild(early_button);
        workspace.appendChild(br());
        
        var close_offer = text_input("close offer proposal: ", workspace);
        var listen_button = button_maker2("load the proposal.", function() {
            display_close_offer2(JSON.parse(close_offer.value), db)
        });
        workspace.appendChild(listen_button);
        workspace.appendChild(br());
        workspace.appendChild(br());
    };
    function calc_balances(db, tx_a) {
        console.log(tx_a);
        var bAcc1 = db.channel_balance1 + tx_a;
        var bAcc2 = db.channel_balance2 - tx_a;
        return calc_balances2(db, bAcc1, bAcc2);
    }
    function calc_balances2(db, bAcc1, bAcc2) {
        var your_balance, their_balance;
        if (db.address1 == keys.pub()) {
            your_balance = bAcc1;
            their_balance = bAcc2;
        } else {
            your_balance = bAcc2;
            their_balance = bAcc1;
        }
        return ("you will receive ").concat(s2c(your_balance)).concat(" veo, and they will receive ").concat(s2c(their_balance)).concat(" veo.");
    }
    function check_ctc_amount(x, tx, db) {
        var amount1 = db.channel_balance1 + x;
        var amount2 = db.channel_balance2 - x;
        if (!(amount1 == tx[5])) {
            status.innerHTML = ("status: <font color=\"red\">The final distribution of funds was miscalculated.</font>");
            console.log(x);
                console.log(tx[6]);
                return 1;
            };
            if (!(amount2 == tx[6])) {
                status.innerHTML = ("status: <font color=\"red\">The final distribution of funds was miscalculated.</font>");
                console.log(x);
                console.log(tx[6]);
                return 1;
            };
            if (!(tx[4] == db.cid)) {
                status.innerHTML = ("status: <font color=\"error\">This tx is for closing the wrong channel.</font>");
                console.log(db.cid);
                console.log(c[4][1][5]);
                return 1;
            };
        return 0;
    };
    function display_close_offer2(c, db) {
        if (c == undefined) {
            status.innerHTML = ("status: <font color=\"red\">your mailbox does not have proposal to close this channel.</font>");
            return 0;
        };
        //console.log(c);//[-6, 5927, 2, "10", Array(4)]
        var tx, sctc;
        if (c.length == 5) {
            tx = c[4];
            //console.log(JSON.stringify(tx));
            //console.log(tx[6]);
            //console.log(db.channel_balance1);
            var sctc = keys.sign(tx);
            var tx_a1 = tx[1][5];
            var tx_a2 = tx[1][6];
            var balances_string = calc_balances2(db, tx_a1, tx_a2);
            status.innerHTML = ("status: <font color=\"blue\">This proposal is for ending the channel at the final state of: ").concat(c[3]).concat("; ").concat(balances_string).concat("</font>");
            //status.innerHTML = ("status: <font color=\"blue\">This proposal is for ending the channel at the final state of: ").concat(c[3]).concat("; you will receive ").concat(s2c(your_balance)).concat(" veo, and they will receive ").concat(s2c(their_balance)).concat(" veo.").concat("</font>");
            //ctc_amount = tx[6];//to acc1
            var x = oracle_value(db, c[3]);
            var cca = check_ctc_amount(x, c[4][1], db);
            if (cca == 1) { return 0; }
        //};
        } else if (c.length == 4) {
            tx = c;
            var sctc = keys.sign(tx);
            var ctc = sctc[1];
            var b = verify_both(sctc);
            if (!(b == true)) {
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a bad signature</font>");
                //return we_send0(db);
                return 0;
            }
            //var sctc = keys.sign(s1ctc);
            //console.log(sctc);
            var ctc = sctc[1];
            var b = verify_both(sctc);
            if (!(b == true)) {
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a bad signature</font>");
                //return we_send0(db);
                return 0;
            }
            if (!(db.address1 == ctc[1])) {
                console.log(db.address1);
                console.log(ctc[1]);
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a wrong address 1</font>");
                return 0;
            }
            if (!(db.address2 == ctc[2])) {
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a wrong address 2</font>");
                return 0;
            }
            if (!(db.fee == ctc[3])) {
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a wrong fee</font>");
                return 0;
            }
            if (!(db.cid == ctc[4])) {
                status.innerHTML = ("status: <font color=\"red\"> CTC tx has a wrong cid</font>");
                return 0;
            }
            oracle_result(db, function(db, winnings) {
                winnings = channel_result(db, winnings);
                var cca = check_ctc_amount(winnings, ctc, db);
                if (cca == 1) {return 0;}
            });
        }
        var accept_button = button_maker2("accept this proposal and close the channel", function() {
            //var stx = keys.sign(tx);
            return variable_public_get(["txs", [-6, sctc]], function(x) {
                //console.log(x);
                status.innerHTML = "status: <font color=\"green\">We attempted to close the channel. Now waiting for the tx to be included in a block.</font>";
                return wait_till_closed(db);
            });
        });
        workspace.innerHTML = "";
        workspace.appendChild(accept_button);
        //make a button for accepting this proposal and closing the channel.
    };
    function oracle_value(db, result) {
        var oracle_result;
        if (db.oracle_type_val == 1) {
            var br;
            if ((result == "true")||(result == 1)) {
                br = 1;
            } else if ((result == "false")||(result == 2)) {
                br = 2;
            } else if ((result == "bad")||(result == 3)) {
                br = 3;
            } else {
                status.innerHTML = ("status: <font color=\"red\">Error: binary oracle result should be 'true', 'false', or 'bad'.</font>");
                return 0;
            }
            oracle_result = br;
        } else if (db.oracle_type_val == 2) {
            console.log(result);
            console.log(db.measured_upper);
            /*if (!(db.measured_upper)) {
                console.log(db.oid);
                return(oracle_limit(db.oid, function(mu) {
                    db.measured_upper = mu;
                    var oracle_result = Math.floor(1024 * parseFloat(result) / db.measured_upper);
                    console.log(oracle_result);
                    return(callback(channel_result(db, oracle_result)));
                }));
                */
            oracle_result = Math.floor(1024 * parseFloat(result) / db.measured_upper);
        }
        console.log(oracle_result);
        return channel_result(db, oracle_result);
    }
    /*
    function oracle_value_old(db, result) {
        //result is "true"/"false"/"bad" or a string of a floating point, example "0.0135"
        //split in two.
        //first should convert from string to the oracle's result.
        //second should be the same as the second step of winnings_amount.
        var x;
        if (db.oracle_type_val == 1) {
            var br;
            if (result == "true") {
                br = 1;
            } else if (result = "false") {
                br = 2;
            } else if (result = "bad") {
                br = 3;
            } else {
                status.innerHTML = ("status: <font color=\"red\">Error: binary oracle result should be 'true', 'false', or 'bad'.</font>");
                return 0;
            }
            if (br == 3) {//tie
                x = 0;
            } else if (br == db.direction) {//acc1 wins
                x = db.channel_balance2;
            } else {//acc2 wins
                x = -db.channel_balance1;
            }
        } else if (db.oracle_type_val == 2) {
            var a = db.channel_balance1 + db.channel_balance2;//10 veo
            var b = Math.floor(1024 * parseFloat(result) / db.measured_upper);//1536  //15360
            var ll = db.lower_limit;//0
            var ul = db.upper_limit;//1023
            b = Math.round((b - ll) * 1024 / ul);//1538
            b = Math.max(0, b);
            b = Math.min(b, 1023);
            x = Math.floor(a * b / 1024) - db.channel_balance1;
        };
        return x;
    };
*/
    function find_ctc(cid, txs) {
        //[["signed",["ctc","BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=","BOzTnfxKrkDkVl88BsLMl1E7gAbKK+83pHCt0ZzNEvyZQPKlL/n8lYLCXgrL4Mmi/6m2bzj+fejX8D52w4U9LkI=",152050,9,"S9dYt1Xk16RDL8nMtYf3MHHFGg1vya5zz7rsUsU/UiY=",0],"MEYCIQD7d9NEvdp5PcVxbYaipiPvw46La0GQD24COQi7vQ7E8QIhAO7ztOSJgqQyuiOD8VDmx/NKODMlPViW7/kI9CYHsWrT",[-6]]]
        if (JSON.stringify(txs) == "[]") {
            return "error";
        }
        var cid2 = txs[0][1][5];
        if (cid == cid2) {
            return txs[0];
        }
        return find_ctc(cid, txs.slice(1));
    }
    function get_oracle_binary(oids, result, callback) {
        if (oids.length == 0) { return callback(result); }
        merkle.request_proof("oracles", oids[0], function(r){
            var oracle_value = r[2];//3 is bad, 2 is false, 1 is true, 0 is still open
            if (oracle_value == 3) {
                status.innerHTML = ("status: <font color=\"green\">this oracle resulted in a bad question.</font>");
                return  callback(0);//return everyone's money back to them, trade is un-done.
            } else if (oracle_value == 0) {
                status.innerHTML = ("status: <font color=\"green\">this oracle is not yet closed.</font>");
                return callback("error");
            } else if (oracle_value == 2) {//0 bit.
                return get_oracle_binary(oids.slice(1), result * 2, callback);
            } else if (oracle_value == 1) {//1 bit.
                return get_oracle_binary(oids.slice(1), (result * 2) + 1, callback);
            }
        });
    };
    /*
    function old_get_oracle_binary(oid, many, result0, callback) {
        if (many == 0) { return callback(result); }
        merkle.request_proof("oracles", oid, function(r) {
            var result = r[2];//3 is bad, 2 is false, 1 is true, 0 is still open
            if (result == 3) {
                status.innerHTML = ("status: <font color=\"green\">this oracle resulted in a bad question.</font>");
                return  callback(0);//return everyone's money back to them, trade is un-done.
            } else if (result == 0) {
                status.innerHTML = ("status: <font color=\"green\">this oracle is not yet closed.</font>");
                return callback("error");
            } else if (result == 2) {//0 bit.
                return get_oracle_binary(next_oid(oid), many - 1, result0 * 2, callback);
            } else if (result == 1) {//1 bit.
                return get_oracle_binary(next_oid(oid), many - 1, (result0 * 2) + 1, callback);
            }
        });
    };
*/
    function channel_result(db, oracle_result) {
        var bet = db.spk[3][1];//db.channel_balance1 + db.channel_balance2;//10 veo
        var a = bet[2];
        var spk_amount = db.spk[7];
        if (db.oracle_type_val == 1) {//binary
            if (oracle_result == 3) {//tie
                return 0;//undo contract, return everyone's money.
            } else if (oracle_result == db.direction) {//acc1 wins
                //should be positive.
                console.log("channel result a is ");
                console.log(a);//3 veo.
                console.log(spk_amount);
                //maxprice is the portion of money in the account controlled by acc1 * 10 000.
                //a = (amount_bet * ((10 000 + maxprice) / 10 000))
                
                var maxprice = Math.floor((10000 * (db.channel_balance1)) / (db.channel_balance2 + db.channel_balance1));
                var amount_bet = Math.floor(a * 10000 / (10000 + maxprice));
                console.log(JSON.stringify([amount_bet, a, maxprice]));
                console.log(JSON.stringify(db));
                //return spk_amount + a;//Math.floor(a / 2);
                return spk_amount + amount_bet;//Math.floor(a / 2);
            } else {//acc2 wins
                //should be negative.
                return spk_amount;
            }
        } else if (db.oracle_type_val == 2) {//scalar
            //var b = Math.floor(1024 * parseFloat(result) / db.measured_upper);//1536  //15360
            var ll = db.lower_limit;//0
            var ul = db.upper_limit;//1023
            b = Math.round((oracle_result - ll) * 1024 / ul);//1538
            b = Math.max(0, b);
            b = Math.min(b, 1023);
            //return Math.floor(a * b / 1024) - db.channel_balance1;
            console.log(JSON.stringify([oracle_result, a, ll, ul, b, spk_amount]));//[512,300000000,0,1023,513,-100000000]
            //[102,200000000,500,0,0,-100000000]
            return Math.floor(a * b / 1024) + spk_amount;

        }
    }
    function oracle_result(db, callback) {
        if (db.oracle_type_val == 2) {//scalar
            scalar_keys1(db.oid, function(ks) {
                return get_oracle_binary(
                    ks, 0,
                    function(b) {
                        return callback(db, b);
                    });
            });
        } else if (db.oracle_type_val == 1) {
            return callback(db, db.result);
        }
    }
    /*
    function oracle_result_old(db, callback) {
        //winnings_amount
        //split in two.
        //firs step should look up the result from the oracle.
        //second should be the same as the second step of winnings_amount.
        var x;
        if (db.oracle_type_val == 2) {//scalar
            var a = db.channel_balance1 + db.channel_balance2;
            return get_oracle_binary(
                db.cid, db.oid, 10, 0,
                function(b) {
                    var ll = db.lower_limit;
                    var ul = db.upper_limit;
                    b = Math.round((b - ll) * 1024 / ul);
                    b = Math.max(0, b);
                    b = Math.min(b, 1023);
                    x = Math.floor(a * b / 1024) - db.channel_balance1;
                    callback(db, x);
                });
        }
        if (db.result == db.direction){//acc1 wins
            console.log("acc1 wins");
            x = db.channel_balance2;
            //return callback(db, db.channel_balance2);
        } else if (db.result == 3) {//bad question
            status.innerHTML = ("status: <font color=\"green\">this oracle resulted in a bad question.</font>");
            //return 0;//return everyone's money back to them, trade is un-done.
            x = 0;//return everyone's money back to them, trade is un-done.
        } else {//acc2 wins
            console.log("acc2 wins");
            //return -db.channel_balance1;
            x = -db.channel_balance1;
        }
        return callback(db, x);
    }
*/
        /*
    function we_send(db) {
        //generate the channel_close_tx and send it to them.
	merkle.request_proof("accounts", db.address1, function(acc) {
            nonce = acc[2]+1;
            winnings_amount(db, function(db, a2) {
                //var a2 = winnings_amount(db);
                console.log("winnings amount result ");
                console.log(a2);
	        var tx = ["ctc", db.address1, db.address2, db.fee, nonce+1, db.cid, a2];
                var stx = keys.sign(tx);
                status.innerHTML = ("status: <font color=\"blue\">send this request to your partner: </font> ".concat(JSON.stringify(stx)));
                return wait_till_closed(db);
            });
        });
    };
*/
    function wait_till_closed(db) {
        //keep looking up the channel until it is closed, then make a message about how now it is safe to delete the channel state.
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("wait till closed");
            //console.log(c);
            if ((c == 0) || (c == "empty")) {
                status.innerHTML = ("status: <font color=\"blue\">The channel is now closed. It is safe to delete your channel state file.</font>");
                return 0;
            } else {
                return headers_object.on_height_change(function() { return wait_till_closed(db); });
            }
        });
    };
/*
    function credits_check(pub, minAmount, callback) {
        F = function() { return buy_credits(Math.floor(minAmount * 1.2), callback); };
        return messenger(["account", keys.pub()], function(a) {
            console.log("account is ");
            console.log(JSON.stringify(a));
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
*/
    function ss_encode(L) {
        if (JSON.stringify(L) == "[]") {
            return [];
        }
        // is [["ss",[0,0,0,0,4],[-6,["oracles","uXhkZVtS4rozAJtjt55Q/FXQb1Vd8lg8x/51fyT95Sg="]],0]]
        //should be
        //[["ss","AAAAAAAAAAAAAQ==",[-6],0]]]
        //
        //var c = compile(L[0].code);

        //scalar_market:settle_scalar/4

        console.log(JSON.stringify(L));
        //var c = compile(L[0].code);
        var c = btoa(array_to_string(L[0].code));
        //var c = "AAAAAAAAAAAAAQ==";
        console.log(c);
        return [["ss", c, L[0].prove, 0]].concat(ss_encode(L.slice(1)));
    }
    function compile(x) {
        return btoa(compile2(x));
    };
    function compile2(L) {
        if (JSON.stringify(L) == "[]") {
            return "";
        }
        //return String.fromCharCode(0).concat(String.fromCharCode(L[0])).concat(compile2(L.slice(1)));
        return (String.fromCharCode(L[0])).concat(compile2(L.slice(1)));
    }
    /*
    function scalar_to_prove(oid, n) {
        if (n == 0) { return []; }
        var noid = btoa(next_oid(atob(oid)));
        var rest = scalar_to_prove(noid, n-1);
        return [["oracles", oid]].concat(rest);
    };
    */
    function ss_maker(db) {
        /*
        var oid0 = db.cd.ssthem[0].prove[1][1];
        var to_prove, code;
        //to_prove = [-6, ["oracles", oid0], ["oracoes", oid1] ... ]
        if (db.oracle_type_val == 2) {//scalar
            to_prove = [-6].concat(scalar_to_prove(oid0, 10));
            console.log(JSON.stringify(db.spd));
            // SS1a = "binary "++ integer_to_list(size(SPD))++ " " ++ PriceDeclare ++ " int 1",
            // [0] ++ 4-bytes-size ++ spd_bytes ++ [0,0,0,0,1]
        } else if (db.oracle_type_val == 1) {//binary
            to_prove = [-6, ["oracles", oid0]];
            code = [0,0,0,0,1];
        }
        var ss = [-6].concat(ss_encode([{code: code, prove: to_prove}]));
        */
        var ss = [-6].concat(ss_encode(db.cd.ssthem));
        console.log(JSON.stringify(ss));//[-6,["ss","AAAAAAAAAAAAAQ==",[-6,["oracles","BPW6vQwCxNkaGQtO2t9DBjSfUmVU9OWRvw2WsPXruIE="]],0]]
        return ss;
    }
    function solo_func(db) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            console.log(JSON.stringify(acc));
            var nonce = acc[2] + 1;
            //var ss = [-6].concat(ss_encode(db.cd.ssthem));
            var ss = ss_maker(db);
            var fee = 202050;
            console.log("solo func");
            console.log(JSON.stringify(db.cd.them));
            //var tx = ["csc", keys.pub(), nonce, fee, keys.sign(db.cd.them), ss];
            var tx = ["csc", keys.pub(), nonce, fee, db.cd.them, ss];
            console.log(JSON.stringify(tx));
            var stx = keys.sign(tx);
            return variable_public_get(["txs", [-6, stx]], function(x) {
                console.log(x);
                status.innerHTML = "status: <font color=\"blue\">We attempted to publish the channel solo close tx.</font>";
                return 0;
            });
        });
    };
    function slash_func(db) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            var nonce = acc[2] + 1;
            //var ss = db.cd.ssme
            //var ss = [-6].concat(ss_encode(db.cd.ssthem));
            var ss = ss_maker(db);
            var fee = 202050;
            var tx = ["cs", keys.pub(), nonce, fee, keys.sign(db.cd.them), ss];
            var stx = keys.sign(tx);
            return variable_public_get(["txs", [-6, stx]], function(x) {
                console.log(x);
                status.innerHTML = "status: <font color=\"blue\">We attempted to publish the channel slash tx.</font>";
                return 0;
            });
        });
    };
    function timeout_func(db) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            var nonce = acc[2] + 1;
            var tx = ["timeout", keys.pub(), nonce, db.fee, db.cid, db.address1, db.address2];
            var stx = keys.sign(tx);
            return variable_public_get(["txs", [-6, stx]], function(x) {
                console.log(x);
                status.innerHTML = "status: <font color=\"blue\">We attempted to publish the channel timeout tx.</font>";
                return 0;
            });
        });
    }
})();
