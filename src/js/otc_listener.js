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
    var next_button = button_maker2("Next", function() {
        contract_number = Math.min(contract_number + 1, max_contract_number - 1);
        display_trade(contract_number);
    });
    div.appendChild(next_button);
    var previous_button = button_maker2("Previous", function() {
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
        //[-6,1,3000,5000,"BHpLwieFVdD5F/z1mdScC9noIZ39HgnwvK8jHqRSBxjzWBssIR1X9LGr8QxTi8fUQws1Q5CGnmTk5dZwzdrGBi4=","BOzTnfxKrkDkVl88BsLMl1E7gAbKK+83pHCt0ZzNEvyZQPKlL/n8lYLCXgrL4Mmi/6m2bzj+fejX8D52w4U9LkI=",10000000,100000000,100000000,"0fbZfpka2gqBaHVf+d2AtBnLZRHD64J+VTyfOW/C/f4=",72,1000,"MEYCIQCgNB4aY7EuvoAyLZTbh2oeHBEkz8pL2N1yPX8qytXP8AIhAKDMsIz0FfxATJw+5dNHdNWMP6r7eWahzyxHfOblBeSo","\u0000\u0000\u0000H\u0013'\u000fÑöÙ~\u001aÚ\nhu_ùÝ´\u0019Ëe\u0011Ãë~U<9oÂýþMEQCIFVBWOXnLdr9NR42l90/lNmApepjOHLc/T30btn5ckIvAiB9ev+44cE9jkz1Pb9lw/DdgALrj6OrB8oq39Lsl0GAuA==",1]
        //var imsg = [-6, db.bet_direction_val, bet_expires, maxprice, keys.pub(), db.their_address_val, period, db.our_amount_val, db.their_amount_val, oid, height, delay, contract_sig, signedPD, spk_nonce];
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
        db.oid = y[9];
        db.height = y[10];
        db.delay = y[11];
        db.contract_sig = y[12];
        db.spd = y[13];
        db.spk_nonce = y[14];
        db.oracle_type_val = y[15];
        db.oracle_type;
        db.cid = y[16];
        if (db.oracle_type_val == 1) {
            db.oracle_type = "scalar";
        } else if (db.oracle_type_val == 0) {
            db.oracle_type = "binary";
        }
        if (db.direction_val = 1) {
            db.direction = "false";
        } else if (db.direction_val = 0) {
            db.direction = "true";
        }
        console.log("display trade");

        var s1 = ("their address: ").concat(db.acc1).concat("<br />").concat(
            "oracle: ").concat(db.oid).concat("<br />").concat(
                "our bet amount: ").concat(db.amount2).concat("<br />").concat(
                    "their bet amount: ").concat(db.amount1).concat("<br />");
        var s2 = ("you win if the outcome is: ").concat(db.direction).concat("<br />").concat("scalar or binary?: ").concat(db.oracle_type);
        var cvdiv = document.createElement("div");
        cvdiv.innerHTML = s1.concat(s2);
        contract_view.innerHTML = "";
        contract_view.appendChild(cvdiv);
        var accept_button = button_maker2("Accept this trade", function() { return accept_trade(db); } );
        contract_view.appendChild(accept_button);
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
            return accept_trade2(db);
        });
    };
    function accept_trade2(db){
        return variable_public_vet(["account", db.acc1], function(their_acc) {
            if (their_acc == "empty") {
                    status.innerHTML = "status: <font color=\"red\">Error: your partner needs to have veo in their account to make a channel.</font>";
            } else if (their_acc[1] < (db.acc1 + 1000000)) {
                status.innerHTML = "status: <font color=\"red\">Error: you partner doesn't have enough veo to make a bet that big.</font>";
                return 0;
            }
            db.account1 = their_acc;
        return credits_check(keys.pub(), 1000000, function(){return accept_trade3(db)} );
        });
    };
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
    function accept_trade3(db) {
        return messenger(["account", keys.pub()], function(a) {
            console.log("account is (start4)");
            console.log(a);
            if (a[1] < 1000000) { //10 milibits
                return setTimeout(function() {return accept_trade3(db);}, 20000);
            }
            var period = 10000000;//only one period because there is only one bet.
            var amount = db.amount1 + db.amount2;
            var sc = market_contract(db.bet_direction, db.bet_expires, db.maxprice, db.acc1, period, amount db.oid, db.height);
            var delay = 1000;//a little over a week
            var spk = ["spk", db.acc1, keys.pub(), [-6], 0,0,db.cid, 0,0,delay];
            var cd = channels_object.new_cd(spk, [],[],[],db.bet_expires, db.cid);
            var spk2 = market_trade(cd, amount, db.maxprice, sc, db.oid);
            var sspk2 = keys.sign(spk2);
            //verify that our partner signed an identical sspk2
            //verify the signature on the price declaration
            //verify that height, price, and portion of price_declaration are valid
            //the light node also creates and signs the tx for making this channel, and sends that to Bob along with everything else.
            
    }

    function start2(db) {
        //The light node makes a big warning, telling Bob that he needs to save the signed smart contract to a file.
        //the light node checks every 10 seconds until it sees that the channel has been included on-chain.
        //the lightnode makes a message saying that it is now safe to shut off, and that it is important to keep the file from step (6) until the contract is completed.
    };
})();
