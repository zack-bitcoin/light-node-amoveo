

function default_ip() {
    return("159.89.87.58");
    //return("0.0.0.0");
};



function token_units() { return 100000000 }; // VEO
function s2c(x) { return x / token_units(); }
function c2s(x) {
    return Math.floor(parseFloat(x.value, 10) * token_units());
}
function new_ss(code, prove, meta) {
    if (meta == undefined) {
        meta = 0;
    }
    return {"code": code, "prove": prove, "meta": meta};
}
function new_cd(me, them, ssme, ssthem, expiration, cid) {
    return {"me": me, "them": them, "ssme": ssme, "ssthem": ssthem, "cid":cid, "expiration": expiration};
}
function big_array_to_int(l) {
    //var x = 0n;
    var x = 0;
    for (var i = 0; i < l.length; i++) {
        //x = (x.times(256)).plus(l[i]);
        //x = (256n * x) + BigInt(l[i]);
        x = 0;
    }
    return x;
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
function big_integer_to_array(i, size) {
    var a = [];
    for ( var b = 0; b < size ; b++ ) {
        //var j = ((i % 256n) + 256n) % 256n;
        //var j =((i % 256n) + 256n) % 256n;
        var j = 0;
        //console.log(j);
        a.push(parseInt(j.toString()));
        //a.push(((i % 256n) + 256n) % 256n);
        //i = i / 256n;
        i = 0;//i / 256n;
        //a.push(i.remainder(256).plus(256).remainder(256));
        //i = i.divide(256);
        //a.push(((i % 256) + 256) % 256);
        //i = Math.floor(i/256);
    }
    return a.reverse();
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
function button_maker3(val, fun) {
    var button = document.createElement("input");
    button.type = "button";
    button.value = val;
    button.onclick = function(){return(fun(button))};
    return button;
};
function button_maker2(val, fun) {
    var button = document.createElement("input");
    button.type = "button";
    button.value = val;
    button.onclick = fun;
    return button;
};
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
function checkbox_input(text, div){
    var box = document.createElement("input");
    box.type = "checkbox";
    //box.checked = true;
    var box_label = document.createElement("label");
    box_label.innerHTML = text;
    div.appendChild(box_label);
    div.appendChild(box);
    return box;
};
function load_selector_options(selector, L) {
    if(L.length < 1) {
        return(0);
    };
    var option = document.createElement("option");
    option.innerHTML = L[0];
    option.value = L[0];
    selector.appendChild(option);
    var L2 = L.slice(1);
    load_selector_options(selector, L2);
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

function random_cid(n) {
    if (n == 0) { return ""; }
    else {
        var rn = Math.floor(Math.random() * 256);
        var rl = String.fromCharCode(rn);
        return rl.concat(random_cid(n-1))}
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

   /* 
async function oracle_limit(oid, callback) {
    //return rpc.post(["oracle", oid], function(x) {
    var x = await rpc.apost(["oracle", oid]);
    var question = atob(x[2]);
        //console.log(question);
        //measured_upper.value = (largest_number(question, 0, 0)).toString();
    return callback(oracle_limit_grabber(question));
});
function oracle_limit_grabber(question) {
        console.log("oracle limit grabber");
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
};
*/


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
function encode_cid(cid, pub) {
    var top_header = headers_object.top();
    var blockheight = top_header[1];
    //var f29 = 104600;
    var f29 = headers_object.forks.twenty_nine;
    if (blockheight > f29){//fork 29
        return(btoa(array_to_string(hash(string_to_array(atob(cid)).concat(string_to_array(atob(pub)))))));
    }else{
        return(cid);
    };
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
        db.knowable = y[22];
    } else if (db.oracle_type_val == 1) {
        db.oracle_type = "binary";
        //db.maxprice = 1;
        }
    if (db.direction_val == 1) {
        db.direction = "false or short or long-veo";
    } else if (db.direction_val == 2) {
        db.direction = "true or long or stablecoin";
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
        console.log("creating contract");
        console.log(JSON.stringify(db));
        //var activates = db.oracle[4];
        var activates = db.knowable;
        console.log(activates);
        sc = scalar_market_contract(db.direction_val, db.expires, db.maxprice, db.acc1, period, amount, db.oid, db.height, db.lower_limit, db.upper_limit, db.bits, activates);
    } else if (db.oracle_type == "binary") {
        sc = market_contract(db.direction_val, db.expires, db.maxprice, db.acc1, period, amount, db.oid, db.height);
    }
    //var delay = 1000;//a little over a week
    var spk = ["spk", db.acc1, acc2, [-6], 0,0,db.cid, 0,0,db.delay];
    var cd = new_cd(spk, [],[],[],db.expires, db.cid);
    //console.log(JSON.stringify(spk));
    //console.log(JSON.stringify(sc));
    //console.log("format spk maker before market trade");
    //console.log(amount);//2 veo
    //console.log(db.maxprice);//5000 //if this was 0, it would probably fix it.
    return market_trade(cd, amount, db.maxprice, sc, db.oid);
};
function scalar_to_prove2(ks) {
    return (ks).map(function(x) {
        return(["oracles", x]);
    });
};
function rcs_to_prove(otv, oid, callback) {
    var to_prove;
    if (otv == 2) {//scalar
        return(scalar_keys1(oid, function(ks) {
            console.log(JSON.stringify(ks));
            to_prove = [-6].concat(scalar_to_prove2(ks));
            return(callback(to_prove));
        }));
    } else if (otv == 1){//binary
        to_prove = [-6, ["oracles", oid]];
        return(callback(to_prove));
    }
};
    
function record_channel_state(sspk2, db, acc2, callback) {
    var meta = 0;
    return(rcs_to_prove(
        db.oracle_type_val,
        db.oid,
        function(to_prove) {
            var spd_bytes = string_to_array(db.spd);
            var size = spd_bytes.length;
            var size_a = Math.floor(size / 256);
            var size_b = size % 256;
            var code = [2,0,0,size_a,size_b].concat(spd_bytes).concat([0,0,0,0,1]);
            var ss = new_ss(code, to_prove, meta);
            var expiration = 10000000;
            var cd = new_cd(sspk2[1], sspk2, [ss], [ss], expiration, db.cid);
            var nacc;
            if (db.acc1 == keys.pub()) {
                nacc = acc2;
                //channels_object.write(acc2, cd);
            } else {
                nacc = db.acc1;
                //channels_object.write(db.acc1, cd);
            };
            return(callback(cd, nacc));
        }));
};


function id_maker(start, gov1, gov2, question) {
    //for oracle ids.
    if (question.length > 999) {
        console.log("question is too long");
        return "question too long";
    }
    var x = integer_to_array(start, 4).concat
    (integer_to_array(gov1, 4)).concat
    (integer_to_array(gov2, 4)).concat
    (hash(string_to_array(question)));
    return(btoa(array_to_string(hash(x))));//is array
};
/*
function post_txs(txs, callback) {
    rpc.post(["txs", [-6].concat(txs)],
             function(x) {
                 if(x == "ZXJyb3I="){
                     callback("server rejected the tx");
                 }else{
                     callback("published tx. the tx id is ".concat(x));
                 }
             });
};
*/
async function apost_txs(txs) {
    var x = await rpc.apost(["txs", [-6].concat(txs)]);
    if(x == "ZXJyb3I="){
        return("server rejected the tx");
    }else{
        return("published tx. the tx id is ".concat(x));
    };
};
async function apost_offer(
    display, IP, offer, second_offer
){
    var signed_second_offer;
    if(!(second_offer)){
        signed_second_offer = 0;
    } else {
        signed_second_offer = swaps.pack(second_offer);
    }
    var signed_offer;
    if(!(offer[0] === "signed")){
        signed_offer = swaps.pack(offer);
    } else {
        signed_offer = offer;
    };
    var z = await rpc.apost(
        ["add", signed_offer,
         signed_second_offer],
        IP, 8090);//p2p_derivatives
    display.innerHTML =
        "successfully posted your crosschain offer. ";
};

var configure = {};

configure["new_account"] = true;
configure["watch_only_account"] = true;
configure["channel_view"] = true;


    function total_liquidity(market1, market2, market3) {
        var K1 = market1[4] * market1[7];
        var K2 = market2[4] * market2[7];
        var K3 = market3[4] * market3[7];
        var W1 = Math.sqrt(K1);
        var W2 = Math.sqrt(K2);
        var W3 = Math.sqrt(K3);
        var total = 0;
        if(W1){ total += W1 };
        if(W2){ total += W2 };
        if(W3){ total += W3 };
        return(total);
    };
    function price_estimate(market1, market2, market3) {
        var K1 = market1[4] * market1[7];
        var K2 = market2[4] * market2[7];
        var K3 = market3[4] * market3[7];
        var P1 = market1[4] / market1[7];
        var P2 = 1 - (market2[4]/market2[7]);
        //R = (1-P)/P
        //PR = 1-P
        //P(R+1) = 1
        //P = 1/(R+1)
        var P3 = 1/(1 + (market3[4]/market3[7]));
        var W1 = Math.sqrt(K1);
        var W2 = Math.sqrt(K2);
        var W3 = Math.sqrt(K3);
        var Ps = [P1, P2, P3];
        //console.log([market1[4], market1[7]]);
        //console.log(Ps);
        var Ws = [W1, W2, W3];
        //console.log(Ws);
        var W_total = 0;
        var P = 0;
        for(var i = 0; i<Ps.length; i++) {
            if(!(Number.isNaN(Ps[i]))){
                P += Ps[i]*Ws[i];
                W_total += Ws[i];
            };
        };
        P = P / W_total;
        //console.log(P);
        return(P);
    };
async function price_estimate_read(cid, source, source_type, callback){
    var mid1 = new_market.mid(source, cid, source_type, 1);
    var mid2 = new_market.mid(source, cid, source_type, 2);
    var mid3 = new_market.mid(cid, cid, 1, 2);
    //rpc.post(["markets", mid1], function(market1){
    var market1 = await rpc.apost(["markets", mid1]);
    var market2 = await rpc.apost(["markets", mid2]);
                //rpc.post(["markets", mid3], function(market3){
    var market3 = await rpc.apost(["markets", mid3]);
    var p_est = price_estimate(market1, market2, market3);
                    //console.log(JSON.stringify([cid, source_type, market1, market2]));
    var liq = total_liquidity(market1, market2, market3);
    //return(callback(p_est, liq));
    return([p_est, liq));
//});
//});
//});
};
    function contract_to_cid(Contract) {
        var Source = Contract[8];
        var SourceType = Contract[9];
        var MT = Contract[2];
        var CH = Contract[1];
        var cid = merkle.contract_id_maker(CH, MT, Source, SourceType);
        return(cid);
    };


function read_float(s){
    return(s.replace(/[^\d|\.]/g,''));
};
