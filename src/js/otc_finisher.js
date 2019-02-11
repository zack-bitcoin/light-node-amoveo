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
        var cd = channels_object.read(their_address.value);
        console.log(JSON.stringify(cd));
        var spk = cd.me;
        db.address1 = spk[1];
        db.address2 = spk[2];
        db.cid = spk[6];
        db.amount = spk[7];
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("channel is ");
            console.log(c);
            if (c == "empty") {
                status.innerHTML = "status: <font color=\"red\">that channel does not exist</font>";
                return 0;
            };
            db.channel_balance1 = c[4];
            db.channel_balance2 = c[5];
            var channel_status = c[10];
            if (channel_status == 1) {
                //display the final state of the channel, and give a message that it is now safe to delete this channel state.
                status.innerHTML = "status: <font color=\"red\">that channel has already been closed. You cannot close it again. </font>";
                return 0;

            };
            var bet = spk[3][1];
            //console.log(JSON.stringify(bet));
            //["bet",code,300000000,["market",1,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",3000,"BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=",10000000,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk="],[-7,1,5000]]
            var key = bet[3];
            var meta = bet[4];
            db.direction = meta[1];//1 is a bet on true, 2 is false.
            //console.log(JSON.stringify(key));
            //["market",1,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",3000,"BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=",10000000,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk="]
            var oid = key[2];
            merkle.request_proof("oracles", oid, function(Or) {
                //console.log(JSON.stringify(Or));
                //["oracle","wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",0,"yAKJm0Zl9jpFBkbolYXdqOKe90nndgCHskmkw8DhSiE=",1000,3,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","BIVZhs16gtoQ/uUMujl5aSutpImC4va8MewgCveh6MEuDjoDvtQqYZ5FeYcUhY/QLjpCBrXjqvTtFiN4li0Nhjo=",1001,0,0]
                var result = Or[2];//3 is bad, 2 is false, 1 is true, 0 is still open
                if (false){//
                    //(result == 0) {//oracle still open
                    var done_timer = Or[9];
                    status.innerHTML = ("status: <font color=\"red\"> The bet is not yet settled. The oracle has not been finalized. you need to wait longer to close this channel. It is expected to be settled a little after block height ").concat((done_timer).toString()).concat("</font>");
                    return 0;
                    };
                db.result = result;
                return start2(db);
            });
        });
    }
    function start2(db) {
        return messenger(["read", 1, db.cid, keys.pub()], function(txs) {
            if ((txs == btoa("error"))||(JSON.stringify(txs) == "[-6]")) {
                //no one has sent us this kind of message yet.
                //not yet received final state
                return we_send(db);
            }
            //scroll through available txs to see if any are what we want.
            //if they sent us a channel_close tx, and it is correct, then we sign and publish, then make a message about how the channel is safe to delete, otherwise return we_send(db);
            console.log(JSON.stringify(txs));
        });
    };
    function we_send(db) {
        //generate the channel_close_tx and send it to them.
	merkle.request_proof("accounts", keys.pub(), function(acc) {
            nonce = acc[2]+1;
            var fee = 152050;
            var a2
            if (db.result == db.direction){//acc1 wins
                console.log("acc1 wins");
                a2 = db.channel_balance2;
            } else if (db.result == 3) {//bad question
                status.innerHTML = ("status: <font color=\"red\">this oracle resulted in a bad question.</font>");
                return 0;
            } else {//acc2 wins
                console.log("acc2 wins");
                a2 = -db.channel_balance1;
            }

	    var tx = ["ctc", db.address1, db.address2, fee, nonce+1, db.cid, a2];
            var stx = keys.sign(tx);
            return messenger(["account", keys.pub()], function(account) {
                var m_nonce = account[3] + 1;
                var r = [-7, 53411, keys.pub(), m_nonce, stx];
                var sr = keys.sign(r);
                return messenger(["send", 1, sr], function(x) {
                    status.innerHTML = ("status: <font color=\"blue\">We signed the tx to close the channel, now waiting for your partner to come online and sign the tx. Keep a copy of the channel state until the channel is closed.</font>");
                    //give a button to start closing the channel with a channel_solo_close tx, along with a warning about how closing with a solo-close will break privacy and cost a larger fee, and it will probably take longer than just waiting for Bob to sign the tx. The light node tells her to keep a copy of the file from step (6) until the channel is closed.
                    return wait_till_closed(db);
                });
            });
        });
    };
    function wait_till_closed(db) {
        //keep looking up the channel until it is closed, then make a message about how now it is safe to delete the channel state.
        merkle.request_proof("channels", db.cid, function(c) {
            var channel_status = c[10];
            if (channel_status == 1) {
                status.innerHTML = ("status: <font color=\"blue\">The channel is now closed. It is safe to delete your channel state file.</font>");
                return 0;
            } else {
                return setTimeout(function() { return wait_till_closed(db); }, 10000);
            }
        });
    }
})();
