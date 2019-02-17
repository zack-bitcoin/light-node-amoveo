(function otc_finisher() {
    var div = document.createElement("div");
    document.body.appendChild(div);
    var title = document.createElement("h3");
    title.innerHTML = "direct derivatives response form";
    div.appendChild(title);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    var their_address = text_input("their_address: ", div);
    div.appendChild(br());
    var start_button = button_maker2("load your keys and channel data, then click this", start1);
    div.appendChild(start_button);
    //we need a tool for solo-closing the channel, for if your partner refuses to help you. (maybe for now asking for help on a forum is good enough?)
    function start1() {
        //console.log(JSON.stringify(channels_object.channel_manager));
        var db = {};
        db.fee = 152050;
        //var cd = channels_object.read(their_address.value);
        db.cd = channels_object.read(their_address.value);
        console.log(JSON.stringify(db.cd));
        //var spk = cd.me;
        db.spk = db.cd.me;
        db.address1 = db.spk[1];
        db.address2 = db.spk[2];
        db.cid = db.spk[6];
        db.amount = db.spk[7];
        console.log("lookup channel ");
        console.log(db.cid);
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("channel is ");
            console.log(c);
            if (c == "empty") {
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
            var bet = db.spk[3][1];
            //console.log(JSON.stringify(bet));
            //["bet",code,300000000,["market",1,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",3000,"BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=",10000000,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk="],[-7,1,5000]]
            var key = bet[3];
            var meta = bet[4];
            db.direction = meta[1];//1 is a bet on true, 2 is false.
            //console.log(JSON.stringify(key));
            //["market",1,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",3000,"BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=",10000000,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk="]
            db.oid = key[2];
            db.type = key[1];
            if (db.type == 2) {
                db.lower_limit = key[7];
                db.upper_limit = key[8];
            }
            merkle.request_proof("oracles", db.oid, function(Or) {
                //console.log(JSON.stringify(Or));
                //["oracle","wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",0,"yAKJm0Zl9jpFBkbolYXdqOKe90nndgCHskmkw8DhSiE=",1000,3,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","BIVZhs16gtoQ/uUMujl5aSutpImC4va8MewgCveh6MEuDjoDvtQqYZ5FeYcUhY/QLjpCBrXjqvTtFiN4li0Nhjo=",1001,0,0]
                db.result = Or[2];//3 is bad, 2 is false, 1 is true, 0 is still open
                if //(false){//
                    (db.result == 0) {//oracle still open
                    var done_timer = Or[9];
                    status.innerHTML = ("status: <font color=\"red\"> The bet is not yet settled. The oracle has not been finalized. you need to wait longer to close this channel. It is expected to be settled a little after block height ").concat((done_timer).toString()).concat("</font>");
                    return 0;
                    };
                return start2(db);
            });
        });
    }
    function start2(db) {
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
    function we_send0(db) {
        return credits_check(keys.pub(), 1200000, function() {return we_send1(db);});
    }
    function we_send1(db) {
        return messenger(["account", keys.pub()], function(a) {
            if ((a == 0) || (a[1] < 1000000)) { //10 milibits
                return setTimeout(function() {return we_send1(db);}, 20000);
            }
            return we_send(db);
        });

    };
    function get_oracle_binary(cid, oid, many, result, callback) {
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
                return get_oracle_binary(cid + 1, oid, many - 1, result * 2, callback);
            } else if (result == 1) {//1 bit.
                return get_oracle_binary(cid + 1, oid, many - 1, (result * 2) + 1, callback);
            }
        });
    };
    function winnings_amount(db, callback) {
        var x;
        if (db.type == 2) {//scalar
            var a = db.channel_balance1 + db.channel_balance2;
            return get_oracle_binary(
                db.cid, db.oid, 10, 0,
                function(b) {
                    console.log(a);
                    console.log(b);//undefined
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
    function we_send(db) {
        //generate the channel_close_tx and send it to them.
	merkle.request_proof("accounts", keys.pub(), function(acc) {
            nonce = acc[2]+1;
            winnings_amount(db, function(db, a2) {
                //var a2 = winnings_amount(db);
                console.log("winnings amount result ");
                console.log(a2);
	        var tx = ["ctc", db.address1, db.address2, db.fee, nonce+1, db.cid, a2];
                var stx = keys.sign(tx);
                return messenger(["account", keys.pub()], function(account) {
                    console.log(account);
                    var m_nonce = account[3] + 1;
                    var r = [-7, 53411, keys.pub(), m_nonce, stx];
                    //var r = [-7, 53411, keys.pub(), m_nonce, 0];
                    var sr = keys.sign(r);
                    console.log(JSON.stringify(sr));
                    return messenger(["send", 1, their_address.value, sr], function(x) {
                        status.innerHTML = ("status: <font color=\"blue\">We signed the tx to close the channel, now waiting for your partner to come online and sign the tx. Keep a copy of the channel state until the channel is closed.</font>");
                        //give a button to start closing the channel with a channel_solo_close tx, along with a warning about how closing with a solo-close will break privacy and cost a larger fee, and it will probably take longer than just waiting for Bob to sign the tx. The light node tells her to keep a copy of the file from step (6) until the channel is closed.
                        var solo_button = button_maker2("Avoid clicking this if you don't have to. click here to attempt to make a solo-close tx. Do this if your partner is refusing to work with you to close the channel. This costs more money than the normal way to close a channel, and it will take more time to finish.", function() { return solo_func(db); });
                        div.appendChild(solo_button); 
                        return wait_till_closed(db);
                    });
                });
            });
        });
    };
    function wait_till_closed(db) {
        //keep looking up the channel until it is closed, then make a message about how now it is safe to delete the channel state.
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("wait till closed");
            //console.log(c);
            if (c == "empty") {
                status.innerHTML = ("status: <font color=\"blue\">The channel is now closed. It is safe to delete your channel state file.</font>");
                return 0;
            } else {
                return headers_object.on_height_change(function() { return wait_till_closed(db); });
            }
        });
    };
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
    function ss_encode(L) {
        if (JSON.stringify(L) == "[]") {
            return [];
        }
        // is [["ss",[0,0,0,0,4],[-6,["oracles","uXhkZVtS4rozAJtjt55Q/FXQb1Vd8lg8x/51fyT95Sg="]],0]]
        //should be
        //[["ss","AAAAAAAAAAAAAQ==",[-6],0]]]
        //
        var c = compile(L[0].code);
        return [["ss", c, L[0].prove, 0]].concat(ss_encode(L.slice(1)));
    }
    function compile(x) {
        return btoa(compile2(x));
    };
    function compile2(L) {
        if (JSON.stringify(L) == "[]") {
            return "";
        }
        return String.fromCharCode(0).concat(String.fromCharCode(L[0])).concat(compile2(L.slice(1)));
    }
    function solo_func(db) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            var nonce = acc[2] + 1;
            var ss = [-6].concat(ss_encode(db.cd.ssthem));
            console.log(JSON.stringify(ss));
            var fee = 202050;
            var tx = ["csc", keys.pub(), nonce, fee, keys.sign(db.cd.them), ss];
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
            var ss = [-6].concat(ss_encode(db.cd.ssthem));
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
