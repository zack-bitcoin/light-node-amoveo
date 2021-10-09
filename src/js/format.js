
function default_ip() {
    //return("159.89.87.58");
    return("0.0.0.0");
};


function token_units() { return 100000000 }; // VEO
function s2c(x) { return x / token_units(); }
function write_veo(x) {
    return((s2c(x)).toFixed(8));
};
function read_veo(X) {
    return Math.floor(parseFloat(X.value, 10) * token_units());
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

function random_cid(n) {
    if (n == 0) { return ""; }
    else {
        var rn = Math.floor(Math.random() * 256);
        var rl = String.fromCharCode(rn);
        return rl.concat(random_cid(n-1))}
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
        signed_second_offer =
            swaps.pack(second_offer);
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
    var market1 = await rpc.apost(["markets", mid1]);
    var market2 = await rpc.apost(["markets", mid2]);
    var market3 = await rpc.apost(["markets", mid3]);
    var p_est = price_estimate(market1, market2, market3);
    var liq = total_liquidity(market1, market2, market3);
    return([p_est, liq]);
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
