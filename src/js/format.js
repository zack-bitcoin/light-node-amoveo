function token_units() { return 100000000 }; // VEO
function s2c(x) { return x / token_units(); }
function c2s(x) {
    return Math.floor(parseFloat(x.value, 10) * token_units());
}
function array_to_int(l) {
    var x = 0;
    for (var i = 0; i < l.length; i++) {
        x = (256 * x) + l[i];
    }
    return x;
}
function toHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        l = str.charCodeAt(i).toString(16);
        var z = "";
        if (l.length < 2) { z = "0"; }
        hex += z;
	hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}
function fromHex(h) {
    var s = '';
    for(var i = 0; (2*i) < h.length;i++) {
        var m = h.slice((2*i), (2*(i+1)));
        var n = parseInt(m, 16);
        var l = String.fromCharCode(n);
        s = s.concat(l);
    }
    return s;
}
function string_to_array(x) {
    var a = new Uint8Array(x.length);
    for (var i=0; i<x.length; i++) {
        a[i] = x.charCodeAt(i);
    }
    return Array.from(a);
}
function integer_to_array(i, size) {
    var a = [];
    for ( var b = 0; b < size ; b++ ) {
        a.push(((i % 256) + 256) % 256);
        i = Math.floor(i/256);
    }
    return a.reverse();
}
function array_to_string(x) {
    var a = "";
    for (var i=0; i<x.length ; i++) {
        a += String.fromCharCode(x[i]);
    }
    return a;
}
function hash2integer(h) {
    function hash2integer2(h, i, n) {
        var x = h[i];
        if  ( x == 0 ) {
            return hash2integer2(h, i+1, n+(256*8));
        } else {
            return n + hash2integer3(x, h[i+1]);
        }
    }
    function dec2bin(dec){
        n = (dec).toString(2);
        n="00000000".substr(n.length)+n;
        return n;
    }
    function hash2integer3(byte1, byte2) {
        var x = dec2bin(byte1).concat(dec2bin(byte2));
        return hash2integer4(x, 0, 0);
    }
    function hash2integer4(binary, i, n) {
        var x = binary[i];
        if ( x == "0" ) { return hash2integer4(binary, i+1, n+256) }
        else {
            var b2 = binary.slice(i, i+8);
            var y = hash2integer5(b2) + n;
            return y;
        }
    }
    function hash2integer5(bin) {
        var x = 0;
        for (var i=0; i < bin.length; i++) {
            var y = bin[i];
            if ( y == "0" ) { x = x * 2; }
            else { x = 1 + (x * 2) }
        }
        return x;
    }
    return hash2integer2(h.concat([255]), 0, 0);
}
function newhash2integer(h) {
    function hash2integer2(h, i, n) {
        var x = h[i];
        if  ( x == 0 ) {
            return hash2integer2(h, i+1, n+(256*8));
        } else {
            return n + hash2integer3(x, h[i+1]);
        }
    }
    function dec2bin(dec){
        n = (dec).toString(2);
        n="00000000".substr(n.length)+n;
        return n;
    }
    function hash2integer3(byte1, byte2) {
        var x = dec2bin(byte1).concat(dec2bin(byte2));
        return hash2integer4(x, 0, 0);
    }
    function hash2integer4(binary, i, n) {
        var x = binary[i];
        if ( x == "0" ) { return hash2integer4(binary, i+1, n+256) }
        else {
            var b2 = binary.slice(i+1, i+9);//this is the only line that is different between hash2integer and newhash2integer
            var y = hash2integer5(b2) + n;
            return y;
        }
    }
    function hash2integer5(bin) {
        var x = 0;
        for (var i=0; i < bin.length; i++) {
            var y = bin[i];
            if ( y == "0" ) { x = x * 2; }
            else { x = 1 + (x * 2) }
        }
        return x;
    }
    
    return hash2integer2(h.concat([255]), 0, 0);
}
function button_maker2(val, fun) {
    var button = document.createElement("input");
    button.type = "button";
    button.value = val;
    button.onclick = fun;
    return button;
}
function br() {
    return document.createElement("br");
};
function append_children(d, l) {
    for (var i = 0; i < l.length; i++) {
        d.appendChild(l[i]);
    }
}
function text(a) {
    var x2 = document.createElement("h8");
    x2.innerHTML = a;
    return x2;
};
function text_input(query, div) {
    var x = document.createElement("INPUT");
    x.type = "text";
    var q = text(query);
    div.appendChild(q);
    div.appendChild(x);
    return x;
};

function tree_number_to_value(t) {
    if (t < 101) {
        return t;
    } else {
        var top = 101;
        var bottom = 100;
	var t2 = t - 100;
        var x = tree_number_det_power(10000, top, bottom, t2);
        return Math.floor(x / 100);
    }
}
function tree_number_det_power(base, top, bottom, t) {
    if (t == 1) {
        return Math.floor((base * top) / bottom);
    }
    var r = Math.floor(t % 2);
    if (r == 1) {
        var base2 = Math.floor((base * top) / bottom);
        return tree_number_det_power(base2, top, bottom, t-1);
    } else if (r == 0) {
        var top2 = Math.floor((top * top)  / bottom);
        return tree_number_det_power(base, top2, bottom,
                                     Math.floor(t / 2));
    }
}
function parse_address(A) {
    //remove spaces or periods. " " "."
    A2 = A.trim();
    A3 = A2.replace(/\./g,'');
    //if it is the wrong length, make an error.
    //88
    B = ((A3).length == 88);
    if (B) { return A3; } else { return 0; };
}

function read_veo(X) {
    return Math.floor(parseFloat(X.value, 10) * token_units());
}

function fee_checker(address, Callback1, Callback2) {
    variable_public_get(["account", address],
			function(result) {
			    if (result == "empty") {
				merkle.request_proof("governance", 14, function(gov_fee) {
				    var fee = tree_number_to_value(gov_fee[2]) + 50;
				    Callback1(fee);
				   });
			    } else {
				merkle.request_proof("governance", 15, function(gov_fee) {
				    var fee = tree_number_to_value(gov_fee[2]) + 50;
				    Callback2(fee);
				});
			    }});
};

function send_encrypted_message(imsg, to, callback) {
    var emsg = keys.encrypt(imsg, to);
    messenger(["account", keys.pub()], function(account) {
        //console.log("account is ");
        //console.log(JSON.stringify(account));
        var nonce = account[3] + 1;
        //nonce = 0;//look up nonce from account, add 1 to it.
        //var r = [53412, keys.pub(), nonce, emsg];
        var r = [-7, 53412, keys.pub(),nonce,emsg];
        //console.log(JSON.stringify(r));
        var sr = keys.sign(r);
        //console.log("check signature");
        //console.log(verify1(sr));
        return messenger(["send", 0, to, sr], function(x) {
            return callback();
        });
    });
};
function verify_exists(oid, n, callback) {
    //console.log(oid);
    if (n == 0) {
        return callback();
    }
    return merkle.request_proof("oracles", oid, function(x) {
        var result = x[2];
        if (!(result == 0)) {
            status.innerHTML = "status: <font color=\"red\">Error: That oracle does not exist.</font>";
            return 0;
        };
        return verify_exists(btoa(next_oid(atob(oid))), n-1, callback);
    });
};
function random_cid(n) {
    if (n == 0) { return ""; }
    else {
        var rn = Math.floor(Math.random() * 256);
        var rl = String.fromCharCode(rn);
        return rl.concat(random_cid(n-1))}
};
function next_oid(oid) {
    //oid starts in binary format. we want to add 1 to the binary being encoded by oid.
    var ls = oid[oid.length - 1];
    var n = ls.charCodeAt(0);
    if (n == 255) {
        return next_oid(oid.slice(0, oid.length - 1)).concat(String.fromCharCode(0));
    }
    return oid.slice(0, oid.length - 1).concat(String.fromCharCode(n+1));
};





function pd_maker(height, price, portion, oid) {
    //PD = <<Height:32, Price:16, PortionMatched:16, MarketID/binary>>,
    var a = make_bytes(4, height);
    var b = make_bytes(2, price);
    var c = make_bytes(2, portion);
    var d = atob(oid);
    return a.concat(b).concat(c).concat(d);
}
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

    
function oracle_limit(oid, callback) {
    return variable_public_get(["oracle", oid], function(x) {
        var question = atob(x[2]);
        //console.log(question);
        //measured_upper.value = (largest_number(question, 0, 0)).toString();
        return callback(oracle_limit_grabber(question));
    });
    function oracle_limit_grabber(question) {
        //console.log("oracle limit grabber");
        if (question.length < 4) {
            return "";
        }
        var f = question.slice(0, 4);
        if (f == "from") {
            return olg2(question.slice(4));
        }
        return oracle_limit_grabber(question.slice(1));
    }
    function olg2(question) {
        //console.log("olg2");
        //console.log(question);
        if (question.length < 2) {
            return "";
        }
        var f = question.slice(0, 2);
        if (f == "to") {
            //console.log("calling olg3 ");
            return olg3(question.slice(2), "");
        }
        return olg2(question.slice(1));
    }
    function olg3(question, n) {
        //console.log(n);
        if (question.length < 1) { return n; }
        var l = question[0];
        if (((l >= "0") && (l <= "9")) || (l == ".")) {
            var n2 = n.concat(l);
            return olg3(question.slice(1), n2);
        } else if (n == "") {
            return olg3(question.slice(1), n);
        } else {
            return n;
        }
    };

}
function check_spk_sig(pub, ch, sig) {
    //console.log("format check spk sig");
    //console.log(JSON.stringify([ch, sig, pub]));
    var our_key =  keys.ec().keyFromPublic(toHex(atob(pub)), "hex");
    return verify(ch, sig, our_key);
}
function spk_sig(x) {
    if (x[0] == "spk") {
        //console.log("format spk sig");
        //console.log(JSON.stringify(x));
        x = btoa(array_to_string(hash(serialize(x))));
    }
    var sig1 = sign(x, keys.keys_internal());
    return btoa(array_to_string(sig1));
};
function derivatives_load_db(y) {
    //console.log(JSON.stringify(y));
    var db = {};
    db.direction_val = y[1];
    db.expires = y[2];
    db.maxprice = y[3];
    db.acc1 = y[4];
    db.acc2 = y[5];
    //if (!(keys.pub() == db.acc2)) {
    //   console.log("wrong address");
    //  return 0;
    // }
    db.period = y[6];
    db.amount1 = y[7];
    db.amount2 = y[8];
    //console.log(db.amount2);
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
    if (db.oracle_type_val == 2) {
        db.oracle_type = "scalar";
        db.bits = y[17];
        db.upper_limit = y[18];
        db.lower_limit = y[19];
    } else if (db.oracle_type_val == 1) {
        db.oracle_type = "binary";
        //db.maxprice = 1;
        }
    if (db.direction_val == 1) {
        db.direction = "false or short";
    } else if (db.direction_val == 2) {
        db.direction = "true or long";
        }
    //console.log("display trade");
    return db;
};
function default_period() {
    return 1000000;
}
function spk_maker(db, acc2, amount, period) {
    //console.log("spk maker amount ");
    //console.log(amount);
    //var period = 10000000;//only one period because there is only one bet.
    //var amount = db.amount1 + db.amount2;
    var sc;
    if (db.oracle_type == "scalar") {
        sc = scalar_market_contract(db.direction_val, db.expires, db.maxprice, db.acc1, period, amount, db.oid, db.height, db.upper_limit, db.lower_limit, db.bits);
    } else if (db.oracle_type == "binary") {
        sc = market_contract(db.direction_val, db.expires, db.maxprice, db.acc1, period, amount, db.oid, db.height);
    }
    //var delay = 1000;//a little over a week
    var spk = ["spk", db.acc1, acc2, [-6], 0,0,db.cid, 0,0,db.delay];
    var cd = channels_object.new_cd(spk, [],[],[],db.expires, db.cid);
    //console.log(JSON.stringify(spk));
    //console.log(JSON.stringify(sc));
    //console.log("format spk maker before market trade");
    //console.log(amount);//2 veo
    //console.log(db.maxprice);//5000 //if this was 0, it would probably fix it.
    return market_trade(cd, amount, db.maxprice, sc, db.oid);
};
function scalar_to_prove(oid, n) {
    if (n == 0) { return []; }
    var noid = btoa(next_oid(atob(oid)));
    var rest = scalar_to_prove(noid, n-1);
    return [["oracles", oid]].concat(rest);
};
function record_channel_state(sspk2, db, acc2) {
    var meta = 0;
    if (db.oracle_type_val == 2) {//scalar
        to_prove = [-6].concat(scalar_to_prove(db.oid, 10));
    } else if (db.oracle_type_val == 1){//binary
        to_prove = [-6, ["oracles", db.oid]];
    }
    console.log(JSON.stringify(db.spd));
    //var size = (db.spd).length * 2;
    var spd_bytes = string_to_array(db.spd);
    var size = spd_bytes.length;
    var size_a = Math.floor(size / 256);
    var size_b = size % 256;
    var code = [2,0,0,size_a,size_b].concat(spd_bytes).concat([0,0,0,0,1]);
    console.log(JSON.stringify(code));
    console.log(db.oracle_type_val);
        // SS1a = "binary "++ integer_to_list(size(SPD))++ " " ++ PriceDeclare ++ " int 1",
        // [0] ++ 4-bytes-size ++ spd_bytes ++ [0,0,0,0,1]
    //var ss = channels_object.new_ss([0,0,0,0,4], to_prove, meta);
    var ss = channels_object.new_ss(code, to_prove, meta);
    //var expiration = 0;//so a smart contract could close the channel very quickly.
    var expiration = 10000000;
    var cd = channels_object.new_cd(sspk2[1], sspk2, [ss], [ss], expiration, db.cid);
    //console.log("record channel state ");
    //console.log(JSON.stringify([db.acc1, db.acc2]));
    if (db.acc1 == keys.pub()) {
        channels_object.write(acc2, cd);
    } else {//if (db.acc2 == keys.pub()) {
        channels_object.write(db.acc1, cd);
    }
};




