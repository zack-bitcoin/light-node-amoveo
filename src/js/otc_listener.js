(function otc_listener() {
    var div = document.createElement("div");
    document.body.appendChild(div);

    var title = document.createElement("h3");
    title.innerHTML = "direct derivatives response form";
    div.appendChild(title);
    var start_button = button_maker2("load your keys, then click this", start1);
 div.appendChild(start_button);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"orange\">listening for offers to trade. Send your pubkey to people who want to make trades with you.</font>";
    div.appendChild(status);
    var contract_number = 0;
    var max_contract_number = 0;
    var contracts = [];
    var next_button = button_maker2("Previous", function() {
        contract_number = Math.min(contract_number + 1, max_contract_number - 1);
        display_trade(contract_number);
    });
    div.appendChild(next_button);
    var previous_button = button_maker2("Next", function() {
        contract_number = Math.max(contract_number - 1, 0);
        display_trade(contract_number);
    });
    div.appendChild(previous_button);
    var contract_view = document.createElement("div");
    div.appendChild(br());
    div.appendChild(contract_view);
        //contract_view.innerHTML = 0;
    function start1() {
        return messenger(["read", 0, keys.pub()], function(x) {
            if (x == []) {
                setTimeout(start1(), 10000);
            } else {
                //remember, old messages do not get deleted. So don't think that they are sending you the same trade offer over and over. check the spk.cid to see if the channel already exists.
                console.log("in start 1");
                console.log(JSON.stringify(x));
                var z = x.slice(1).map(function(a){ return keys.decrypt(a); });
                //get rid of contracts that are no longer valid.
                //git rid of contracts if the cid already has a channel.
                max_contract_number = z.length;
                contracts = z;
                display_trade(contract_number);
            }
        });
    }
    function display_trade(n){
        console.log(JSON.stringify(contracts));
        y = contracts[n];
        console.log(JSON.stringify(y));
        var db = {};
        db.direction_val = y[1];
        db.expires = y[2];
        db.maxprice = y[3];
        db.acc1 = y[4];
        db.acc2 = y[5];
        if (!(keys.pub() == db.acc2)) {
            console.log("wrong address");
            return 0;
        }
        db.period = y[6];
        db.amount1 = y[7];
        db.amount2 = y[8];
        console.log(db.amount2);
        db.oid = y[9];
        db.height = y[10];
        db.delay = y[11];
        db.contract_sig = y[12];
        db.spd = atob(y[13]);
        db.spk_nonce = y[14];
        db.oracle_type_val = y[15];
        db.oracle_type;
        db.cid = y[16];
        db.payment = y[20];
        if (db.oracle_type_val == 1) {
            db.oracle_type = "scalar";
            db.bits = y[17];
            db.upper_limit = y[18];
            db.lower_limit = y[19];
        } else if (db.oracle_type_val == 0) {
            db.oracle_type = "binary";
        }
        if (db.direction_val == 1) {
            db.direction = "false or short";
        } else if (db.direction_val == 2) {
            db.direction = "true or long";
        }
        console.log("display trade");

        variable_public_get(["oracle", db.oid], function(x) {
            var question = atob(x[2]);
            console.log(question);
            
            var s1 = ("their address: ").concat(db.acc1).concat("<br />").concat(
                "oracle: ").concat(db.oid).concat("<br />").concat(
                    "oracle text: ").concat(question).concat("<br />").concat(
                        "our bet amount: ").concat(db.amount2 / token_units()).concat("<br />").concat(
                            "their bet amount: ").concat(db.amount1 / token_units()).concat("<br />");
            var s2 = s1.concat("you win if the outcome is: ").concat(db.direction).concat("<br />").concat("scalar or binary?: ").concat(db.oracle_type).concat("<br />").concat("delay: ").concat((db.delay).toString()).concat("<br />").concat("for this contract, you pay: ").concat((-(db.payment) / token_units()).toString()).concat("<br />");;
            if (db.oracle_type_val == 1) {//scalar
            s2 = s2.concat("upper limit: ").concat((db.upper_limit).toString()).concat("<br />").concat("lower limit: ").concat((db.lower_limit).toString()).concat("<br />");
            }
            var cvdiv = document.createElement("div");
            cvdiv.innerHTML = s2;
            contract_view.innerHTML = "";
            contract_view.appendChild(cvdiv);
            var accept_button = button_maker2("Accept this trade", function() { return accept_trade(db); } );
            contract_view.appendChild(accept_button);
        });
    };
    function accept_trade(db) {
        console.log("accepting this trade");
        status.innerHTML = "status: <font color=\"green\">checking if this trade is valid.</font>";
        return merkle.request_proof("oracles", db.oid, function(x) {
            var result = x[2];
            if (!(result == 0)) {
                status.innerHTML = "status: <font color=\"red\">Error: That oracle does not exist.</font>";
                return 0;
            }
            db.oracle = x;
            if (db.oracle_type_val == 1) { //scalar
                return verify_exists(db.oid, 10, function() {return accept_trade2(db);});
            }
            return accept_trade2(db);
        });
    };
    function accept_trade2(db){
        return variable_public_get(["account", db.acc1], function(their_acc) {
            if (their_acc == "empty") {
                    status.innerHTML = "status: <font color=\"red\">Error: your partner needs to have veo in their account to make a channel.</font>";
            } else if (their_acc[1] < (db.acc1 + 1000000)) {
                status.innerHTML = "status: <font color=\"red\">Error: you partner doesn't have enough veo to make a bet that big.</font>";
                return 0;
            }
            db.account1 = their_acc;
            status.innerHTML = "status: <font color=\"green\">the trade looks valid. Now checking if you need credits.</font>";
            glossary.link(status, "messenger_credits");
            return messenger_object.min_bal(1000000, function(){return accept_trade3(db)});
        });
    };
    function accept_trade3(db) {
        return messenger(["account", keys.pub()], function(a) {
            console.log("account is (accept_trade3)");
            console.log(a);
            if ((a == 0) || (a[1] < 1000000)) { //10 milibits
                return setTimeout(function() {return accept_trade3(db);}, 20000);
            }
            var period = 10000000;//only one period because there is only one bet.
            var amount = db.amount1 + db.amount2;
            var sc;
            if (db.oracle_type == "scalar") {
                console.log("accept trade 3 direction ");
                console.log(db.direction_val);
                sc = scalar_market_contract(db.direction_val, db.expires, db.maxprice, db.acc1, period, amount, db.oid, db.height, db.upper_limit, db.lower_limit, db.bits);
            } else if (db.oracle_type == "binary") {
                sc = market_contract(db.direction_val, db.expires, db.maxprice, db.acc1, period, amount, db.oid, db.height);
            }
            //var delay = 1000;//a little over a week
            var spk = ["spk", db.acc1, keys.pub(), [-6], 0,0,db.cid, 0,0,db.delay];
            var cd = channels_object.new_cd(spk, [],[],[],db.expires, db.cid);
            var spk2 = market_trade(cd, amount, db.maxprice, sc, db.oid);
            var sspk2 = keys.sign(spk2);
            sspk2[2] = db.contract_sig;
            var v = verify_both(sspk2);
            if (!(v == true)) {
                status.innerHTML = "status: <font color=\"red\">Error: one of the signatures is wrong, maybe the contract wasn't identically calculated on both nodes.</font>";
                return 0;
            }
            var pd = pd_maker(db.height, db.maxprice - 1, 9999, db.oid);
            var pd2 = db.spd.slice(0, pd.length);
            if (!(pd == pd2)) {
                status.innerHTML = "status: <font color=\"red\">Error: the price declaration was not calculated identically on both nodes.</font>";
                console.log(JSON.stringify(pd));//we calculate
                console.log(JSON.stringify(atob(pd2)));//they calculate
                return 0;
            }
            var pd_sig = db.spd.slice(pd.length);
            //var v = verify(pd, pd_sig, keys.ec().keyFromPublic(toHex(atob(db.acc1)), "hex"));
            var their_key = keys.ec().keyFromPublic(toHex(atob(db.acc1)), "hex");
            var v = their_key.verify(hash(pd), bin2rs(atob(pd_sig)), "hex");
            if (!(v == true)) {
                status.innerHTML = "status: <font color=\"red\">Error: the price declaration's signature is invalid.</font>";
                return 0;
            }
            var fee = 152050;
            merkle.request_proof("accounts", db.acc1, function (acc) {
                var nonce = acc[2]+1;
                var tav2, oav2;
                if (db.payment > 0) {
                    oav2 = db.payment;
                    tav2 = 0;
                } else {
                    oav2 = 0;
                    tav2 = -(db.payment)
                }
                var channel_tx = ["nc", db.acc1, db.acc2, fee, nonce, db.amount1 + oav2, db.amount2 + tav2, db.delay, db.cid];
                var stx = keys.sign(channel_tx);
                var msg = [-6, stx, sspk2[3]];
                send_encrypted_message(msg, db.acc1, function() {
                    var meta = 0;
                    var ss = channels_object.new_ss([0,0,0,0,4], [-6, ["oracles", db.oid]], meta);
                    var expiration = 10000000;
                    var cd = channels_object.new_cd(sspk2[1], sspk2, [ss], [ss], expiration, db.cid);
                    console.log(JSON.stringify(cd));
                    channels_object.write(db.acc1, cd);
                    status.innerHTML = "status: <font color=\"red\">Warning: you need to save your channel state to a file. You can leave the browser open longer to find out when this channel will be made, or you can load your channel state into otc_finisher to find out the channel state later.</font>";
                    channels_object.write(db.acc1, cd);
                    return start2(db);
                });
            });
        });
    };
    function start2(db) {
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("channel is ");
            console.log(c);
            if (c == "empty") {
                return headers_object.on_height_change(function() { return start2(db); });
            }
            status.innerHTML = "status: <font color=\"green\">The channel has been formed, and the smart contract is active. If you have saved a copy of the signed smart contract, then it is now safe to close the browser.</font>";
        });
    }
})();
