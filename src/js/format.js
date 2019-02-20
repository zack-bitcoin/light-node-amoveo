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
        return messenger(["send", 0, to, sr], function(x) {
            return callback();
        });
    });
};
function verify_exists(oid, n, callback) {
    console.log(oid);
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

    
