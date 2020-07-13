

var globalChannelOffer;

var CBA = (function otc_listener() {
    var div = document.createElement("div");
    document.body.appendChild(div);
    var title2 = document.createElement("h3");
    title2.innerHTML = "accept trade";
   // div.appendChild(title2);

    
 /*   var load_button = document.createElement("input");
    load_button.type = "file";
    load_button.onchange = function() {
        var file = (load_button.files)[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            cp_text.value = reader.result;
        }
        reader.readAsText(file);
    };
    div.appendChild(load_button);
*/
    //div.appendChild(br());

    
    var start_button = button_maker2("Go", cp_start);
    console.log("channel proposal text:" + globalChannelOffer);
    //var cp_text = globalChannelOffer;
  // HERE //  var cp_text = text_input("accept trade offer and broadcast 99% channel close", div);

  //  div.appendChild(br());
   // div.appendChild(start_button);
  //  div.appendChild(br());



    var title = document.createElement("h3");
    title.innerHTML = "smart contract details";
  //  div.appendChild(title);
    //var start_button = button_maker2("load your keys, then click this", start1);
    //div.appendChild(start_button);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready for offers to trade. Send your pubkey to people who want to make trades with you.</font>";
 //   div.appendChild(status);
    var contract_number = 0;
    var max_contract_number = 0;
    var contracts = [];
    /*
      var next_button = button_maker2("Previous", function() {
        contract_number = Math.min(contract_number + 1, max_contract_number - 1);
        original_display_trade(contracts[contract_number]);
    });
    //div.appendChild(next_button);
    var previous_button = button_maker2("Next", function() {
        contract_number = Math.max(contract_number - 1, 0);
        original_display_trade(contracts[contract_number]);
    });
    //div.appendChild(previous_button);
    */
    var contract_view = document.createElement("div");
  //  div.appendChild(br());
    div.appendChild(contract_view);
    //contract_view.innerHTML = 0;
    function cp_start() {
        
        //globalChannelOffer = cp_text.value;

        console.log(globalChannelOffer);

        //var x = JSON.parse(cp_text.value);
        //var x = JSON.parse(cp_text.value);
        var x = globalChannelOffer;
        var msg = x[1];
        var signed_nc_offer = x[2];
        //msg[11] is signedPD
        display_trade(msg, function(db){

            //var accept = button_maker2("Accept trade and make channel.", function() {
                var accept = button_maker2("Accept trade and make channel.", createChannel);


                function createChannel() {
                return accept_trade(db, function(db2) {
                    var period = default_period();
                    var spk2 = spk_maker(db2, 0, db.amount1 + db.amount2, period);
                    var contract = spk2[3][1];
                    if (!(JSON.stringify(contract) == JSON.stringify(msg[21]))){
                        console.log(JSON.stringify(contract));
                        console.log(JSON.stringify(msg[21]));
                        status.innerHTML = "status: <font color=\"red\">we calculated the contract code differently.</font> ";
                        return 0;
                    }
                    console.log(JSON.stringify(spk2));
                    var CH = btoa(array_to_string(hash(serialize(spk2))));
                    var NCO = signed_nc_offer[1];
                    var contract_hash2 = NCO[9];
                    if (!(JSON.stringify(CH) == JSON.stringify(contract_hash2))) {
                        console.log(JSON.stringify(CH));
                        console.log(JSON.stringify(contract_hash2));
                        status.innerHTML = "status: <font color=\"red\">we calculated the contract hash differently.</font> ";
                        return 0;
                    }
                    //var sch = keys.sign([-7, CH, keys.pub(), 1]);
                    var their_spk_sig = msg[12];
                    if (!(check_spk_sig(db.acc1, CH, their_spk_sig[2]))) {
                        console.log("bad smart contract signature");
                        console.log(their_spk_sig[2]);
                        return 0;
                    };
                    var v = pd_checker(db);
                    if (!(v == true)) {
                        status.innerHTML = "status: <font color=\"red\">Error: the price declaration's signature is invalid.</font>";
                        return 0;
                    }
                    var fee = 152050;
                    var contract_sig = spk_sig(CH);
                    var tx = ["nc_accept", keys.pub(), signed_nc_offer, fee, contract_sig];
		    var stx = keys.sign(tx);
		    rpc.post(["txs", [-6, stx]], function(x) {
                        //save channel state
                        var my_spk_sig = [-7, 2, contract_sig];
                        var sspk2 = ["signed", spk2, their_spk_sig, my_spk_sig]; 
                        record_channel_state(sspk2, db, keys.pub(), function() {
                        status.innerHTML = "status: <font color=\"green\">The channel has been successfully formed.</font>";
                        console.log("The channel has been successfully formed");
                        });
                    });
                });
            };

            createChannel();

           // contract_view.appendChild(accept);
        });
    };
    function display_trade(y, callback){
        //console.log(JSON.stringify(contracts));
        //y = contracts[n];
        var db = derivatives_load_db(y);
        console.log(JSON.stringify(y));
        merkle.request_proof("channels", db.cid, function(c) {
            console.log(c);
            if (!((c == 0) || (c == "empty"))) {
                console.log("that contract was already made.")
                return(0);
            };
            rpc.post(["oracle", db.oid], function(x) {
                var question;
                if (x == 0) {
                    //question = "UNKNOWN: this oracle has not yet been created. You can use this page http://159.89.87.58:8080/new_oracle.html to generate the same ID to verify what this contract is betting on.";
                    question = atob(y[23]);
                    var oracle_start = y[22];
                    var oid0 = y[9];
                    console.log(JSON.stringify([oracle_start, question]));
                    var oid_check = id_maker(oracle_start,0,0,question);
                    if (!(oid0 == oid_check)){
                        question = "ERROR! OID improperly calculated. Do not accept this channel offer, your money will get trapped!";
                    };
                    console.log("this oracle does not yet exist.");
                } else {
                    question = atob(x[2]);
                    console.log(question);
                }

                ZYX.proposer_start();
                
                console.log(globalChannelClose);

                var s1 = ("their address: ").concat(db.acc1).concat("<br />").concat(
          //            "channel close: ").concat(globalChannelClose).concat("<br />").concat(                  
                    "oracle: ").concat(db.oid).concat("<br />").concat(
                        "channel id:").concat(db.cid).concat("<br />").concat(
                            "betting on this: ").concat(question).concat("<br />").concat(
                                "our bet amount: ").concat(db.amount2 / token_units()).concat("<br />").concat(
                                    "their bet amount: ").concat(db.amount1 / token_units()).concat("<br />");
                var s2 = s1.concat("you win if the outcome is: ").concat(db.direction).concat("<br />").concat("scalar or binary?: ").concat(db.oracle_type).concat("<br />").concat("channel delay: ").concat((db.delay).toString()).concat("<br />");
                var cvdiv = document.createElement("div");
                if (db.oracle_type_val == 2) {//scalar
                    s2 = s2.concat("upper limit: ").concat((db.upper_limit).toString()).concat("<br />").concat("lower limit: ").concat((db.lower_limit).toString()).concat("<br />");
                    //stablecoin vs long-veo
                    if ((db.upper_limit == 1023) || (db.lower_limit == 0)){
                        setTimeout(function(){
                            oracle_limit(db.oid, function(oracle_upper) {
                                var ave = db.upper_limit + db.lower_limit;
                                var ratio = db.amount2 / (db.amount2 + db.amount1);
                                var price = ave * oracle_upper * ratio / 1023;
                                s2 = s2.concat("this is unleveraged, so it is a stablecoin. It is trading at a price of ").concat((1/price)).concat(" stablecoin per veo");
                                cvdiv.innerHTML = s2;
                            });
                        }, 100);
                    }
                }
                cvdiv.innerHTML = s2;
                contract_view.innerHTML = "";
           //     contract_view.appendChild(cvdiv);
                callback(db);
            });
        });
    };
    function accept_trade(db, callback) {
        console.log("accepting this trade");
        status.innerHTML = "status: <font color=\"green\">checking if this trade is valid.</font>";
        return merkle.request_proof("oracles", db.oid, function(x) {
            /*
            var result = x[2];
            if (!(result == 0)) {
                status.innerHTML = "status: <font color=\"red\">Error: That oracle does not exist. (did you sync headers?) </font>";
                return 0;
            }
            */
            //db.oracle = x;
            //if (db.oracle_type_val == 2) { //scalar
            //    return verify_exists(db.oid, 10, function() {return accept_trade2(db, callback);});
            //}
            return accept_trade2(db, callback);
        });
    };
    function accept_trade2(db, callback){
        return rpc.post(["account", db.acc1], function(their_acc) {
            if (their_acc == 0) {
                    status.innerHTML = "status: <font color=\"red\">Error: your partner needs to have veo in their account to make a channel.</font>";
            } else if (their_acc[1] < (db.acc1 + 1000000)) {
                status.innerHTML = "status: <font color=\"red\">Error: you partner doesn't have enough veo to make a bet that big.</font>";
                return 0;
            }
            db.account1 = their_acc;
            return callback(db);
        });
    };
    /*
    function accept_trade3(db) {
        var spk2 = spk_maker(db, keys.pub());
        //var sspk2 = keys.sign(spk2);
        var sig = spk_sig(spk2);
        var sspk2 = ["signed", spk2, [-6], [-7, 2, sig]];
        sspk2[2] = db.contract_sig;
        var v = verify_both(sspk2);
        if (!(v == true)) {
            status.innerHTML = "status: <font color=\"red\">Error: one of the signatures is wrong, maybe the contract wasn't identically calculated on both nodes.</font>";
            return 0;
        }
        var v = pd_checker(db);
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
                record_channel_state(sspk2, db, keys.pub());
                status.innerHTML = "status: <font color=\"red\">Warning: you need to save your channel state to a file. You can leave the browser open longer to find out when this channel will be made, or you can load your channel state into otc_finisher to find out the channel state later.</font>";
                return start2(db);
            });
        });
    };
    */
    function pd_checker(db) {
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
        //return their_key.verify(hash(pd), bin2rs(atob(pd_sig)), "hex");
        return their_key.verify(hash(serialize(btoa(pd))), bin2rs(pd_sig), "hex");
    }
    function start2(db) {
        merkle.request_proof("channels", db.cid, function(c) {
            console.log("channel is ");
            console.log(c);
            if (c == 0) {
                return headers_object.on_height_change(function() { return start2(db); });
            }
            status.innerHTML = "status: <font color=\"green\">The channel has been formed, and the smart contract is active. If you have saved a copy of the signed smart contract, then it is now safe to close the browser.</font>";
        });
    }

    return {cp_start: cp_start};

})();
