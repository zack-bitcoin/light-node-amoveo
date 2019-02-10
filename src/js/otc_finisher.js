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
        db.cid = spk[6];
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("channel is ");
            console.log(c);
            if (c == "empty") {
                status.innerHTML = "status: <font color=\"red\">that channel does not exist</font>";
                return 0;
            };
            var channel_status = c[10];
            if (channel_status == 1) {
                //display the final state of the channel, and give a message that it is now safe to delete this channel state.
                status.innerHTML = "status: <font color=\"red\">that channel has already been closed. You cannot close it again. </font>";
                return 0;

            };
            var bet = spk[3][1];
            console.log(JSON.stringify(bet));
            //["bet",code,300000000,["market",1,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",3000,"BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=",10000000,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk="],[-7,1,5000]]
            var key = bet[3];
            console.log(JSON.stringify(key));
            //["market",1,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",3000,"BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=",10000000,"wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk="]
            var oid = key[2];
            merkle.request_proof("oracles", oid, function(Or) {
                console.log(JSON.stringify(Or));
                //["oracle","wqsBDVWpK35TS/VqFYC94QWnNOwClAerYlbtz3AvKtk=",0,"yAKJm0Zl9jpFBkbolYXdqOKe90nndgCHskmkw8DhSiE=",1000,3,0,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","BIVZhs16gtoQ/uUMujl5aSutpImC4va8MewgCveh6MEuDjoDvtQqYZ5FeYcUhY/QLjpCBrXjqvTtFiN4li0Nhjo=",1001,0,0]
                var result = Or[2];//3 is bad, 2 is false, 1 is true, 0 is still open
                if //(false){//
                    (result == 0) {//oracle still open
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
            if (txs == btoa("error")) {
                //no one has sent us this kind of message yet.
                //not yet received final state
                return we_send(db);
            }
            //scroll through available txs to see if any are what we want.
            //if they sent us a channel_close tx, and it is correct, then we sign and publish, then make a message about how the channel is safe to delete.
            console.log(JSON.stringify(txs));
        });
    };
    function we_send(db) {
        //generate the channel_close_tx and send it to them.
        //return messenger(["send", 1, ], function(x) {
        //make a message about how we signed the tx to close the channel, and now we are just waiting on them to sign it and publish.
        //give a button to start closing the channel with a channel_solo_close tx, along with a warning about how closing with a solo-close will break privacy and cost a larger fee, and it will probably take longer than just waiting for Bob to sign the tx. The light node tells her to keep a copy of the file from step (6) until the channel is closed.
    }
})();
