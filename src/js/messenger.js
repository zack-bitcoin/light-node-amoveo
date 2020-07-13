var messenger_object = (function() {
    var div = document.createElement("div");
    document.body.appendChild(div);

    var title = document.createElement("h3");
    title.innerHTML = "encrypted messenger account credits";
    div.appendChild(title);

    var credits = document.createElement("div");
    const credits_default = "encrypted messenger credits: ";
    credits.innerHTML = credits_default.concat("?");
    function display_credits(n) {
        credits.innerHTML = credits_default.concat((n).toString());
    }
    div.appendChild(credits);
    var check_credits_button = button_maker2("check encrypted messenger credits balance", check_credits);
    div.appendChild(check_credits_button);
    div.appendChild(br());
    var more_div = document.createElement("div");
    div.appendChild(more_div);
    var more_credits_button = button_maker2("buy more credits now ", function() {
        more_div.innerHTML = "";
        var warning = document.createElement("p");
        warning.innerHTML = "warning: wait at least 2 blocks before attempting to buy more credits.";
        more_div.appendChild(warning);
        return buy_credits(1000000, function(){return 0;});
    });
    more_div.appendChild(more_credits_button);
    div.appendChild(br());
    function check_credits() {
        return messenger(["account", keys.pub()], function(a) {
            if (a==0) {
                display_credits(0);
            } else {
                display_credits(a[1]);
            }
        });
    }
    function buy_credits2(Amount, callback) {
        //status.innerHTML = "status: <font color=\"green\">you don't have enough credits, now puchasing more.</font>";
        return rpc.post(["pubkey"], function(server_pubkey) {
            console.log("server pubkey ");
            console.log(server_pubkey);
            return fee_checker(
                keys.pub(),
                function(x) {
                    var s = "fail. the server's account should already exist.";
                    console.log(s);
                    return s;
                }, function (Fee) {
		    return rpc.post(["spend_tx", Amount, Fee, keys.pub(), server_pubkey], function(tx) {
                        //this tx purchases more credits.
                        var stx = keys.sign(tx);
                        rpc.post(["txs", [-6, stx]], function() {
                            return buy_credits3(Math.floor(Amount - 1), callback);
                            //return callback();
                        });
                    });
                });
        });
    }
    function buy_credits3(a, callback) {
        return messenger(["account", keys.pub()], function(a) {
            if ((a == 0) || (a[1] < 1000000)) { //10 milibits
                return setTimeout(function() {
                    return buy_credits3(a, callback);
                }, 20000);
            }
            return callback();
        });

    };
    function buy_credits(minAmount, callback) {
        F = function() { return buy_credits2(Math.floor(minAmount * 2), callback); };
        return messenger(["account", keys.pub()], function(a) {
            if (a == 0) { //10 milibits
                //account does not exist
                display_credits(0);
                return F();
            } else if (a[1] < minAmount) {
                //account has insufficient balance
                display_credits(a[1]);
                return F();
            }
            return callback();
        });
    }
    function more_credits() {
        return buy_credits(2000000, function(){return 0;});
    };
    return {display: display_credits,
            check: check_credits,
            min_bal: buy_credits};
})();
