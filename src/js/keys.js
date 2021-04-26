
function keys_function1() {
    var ec = new elliptic.ec('secp256k1');
    var keys_internal;
    const urlParams = new URLSearchParams(window.location.search);
    var urlPriv = urlParams.get('priv');
    if(urlPriv){
        keys_internal = ec.keyFromPrivate(urlPriv, "hex");
        setTimeout(function(){
            update_pubkey();
        }, 0);
    } else {
        keys_internal = new_keys();
    };
    var account_title = document.createElement("h3");
    account_title.innerHTML = "account ";
    var div = document.createElement("div");
    var save_name = document.createElement("input");
    save_name.type = "text";
    save_name.value = "Amoveo private key";
    var load_text = document.createTextNode("get key from file");
    var file_selector = document.createElement("input");
    file_selector.type = "file";
    file_selector.onchange = load_keys;
    if(!(configure["hide_keys"])){
        document.body.appendChild(account_title);
        document.body.appendChild(div);
        div.appendChild(load_text);
        div.appendChild(file_selector);
    }
    //div.appendChild(br());
    if(configure["new_account"]){
        var save_button = button_maker2("Generate new account. Saves the private key to a file.", save_keys);
        //div.appendChild(br());
    }
    if(configure["watch_only_account"]){
        var watch_only_instructions = document.createTextNode("put your pubkey here to make a watch-only wallet that is unable to spend money.");
        var watch_only_pubkey = document.createElement("input");
        watch_only_pubkey.type = "text";
        var watch_only_button = button_maker2("load pubkey", watch_only_func); 
    }
    var pub_div = document.createElement("div");
    div.appendChild(br());
    div.appendChild(pub_div);
    if(configure["new_account"]){
        var new_pubkey_button = button_maker2("generate keys from passphrase", new_keys_check);
        div.appendChild(br());
        div.appendChild(save_name);
        //div.appendChild(br());
        div.appendChild(save_button);
        div.appendChild(br());
    }
    if(configure["watch_only_account"]){
        div.appendChild(watch_only_instructions);
        div.appendChild(watch_only_pubkey);
        div.appendChild(watch_only_button);
        div.appendChild(br());
    };
    var new_pubkey_div = document.createElement("div");
    if(configure["new_account"]){
        div.appendChild(new_pubkey_button);
        div.appendChild(new_pubkey_div);
        div.appendChild(br());

    };
    var balance_button = button_maker2("check balance ", update_balance);
    var bal_div = document.createElement("div");
    bal_div.innerHTML = "your balance: ?";

    div.appendChild(bal_div);
    div.appendChild(balance_button);
    //append_children(div, [bal_div, balance_button]);

    //update_pubkey();
    function input_maker(val) {
        var x = document.createElement("input");
        x.type = "text";
        x.value = val;
        return x;
    }
    function new_keys_watch(x) {
	return ec.keyFromPublic(x);
    }
    function new_keys_entropy(x) {
        return ec.genKeyPair({entropy: hash(serialize([x]))});
    }
    function new_keys() {
        return ec.genKeyPair();
    }
    function pubkey_64() {
        var pubPoint = keys_internal.getPublic("hex");
        return btoa(fromHex(pubPoint));
    }
    function powrem(x, e, p) {
        //if (e == 0n) {
        if (e == 0) {
            //return 1n;
            return 1;
        //} else if (e == 1n) {
        } else if (e == 1) {
            return x;
        //} else if ((e % 2n) == 0n) {
        } else if ((e % 2) == 0) {
            return powrem(((x * x) % p),
                          //(e / 2n),
                          (e / 2),
                          p);
        } else {
            //return (x * powrem(x, e - 1n, p)) % p;
            return (x * powrem(x, e - 1, p)) % p;
        }
    };
    function decompress_pub(pub) {
        //pub = "AhEuaxBNwXiTpEMTZI2gExMGpxCwAapTyFrgWMu5n4cI";
        //var p = 115792089237316195423570985008687907853269984665640564039457584007908834671663n;
        var p = 0;
        var b = atob(pub);
        var a = string_to_array(b);
        var s = BigInt(a[0] - 2);
        var x = big_array_to_int(a.slice(1, 33));
        //var y2 = (((((x * x) % p) * x) + 7n) % p);
        var y2 = (((((x * x) % p) * x) + 7) % p);
        //var y = powrem(y2, ((p+1n) / 4n), p);
        var y = powrem(y2, ((p+1) / 4), p);
        //if (!(s == (y % 2n))) {
        if (!(s == (y % 2))) {
            y = ((p - y) % p);
        }
        pub = [4].concat(big_integer_to_array(x, 32)).concat(big_integer_to_array(y, 32));
        return btoa(array_to_string(pub));
    }
    function compress_pub(p) {
        var b = atob(p);
        var a = string_to_array(b);
        var x = a.slice(1, 33);
        var s = a[64];
        var f;
        if ((s % 2) == 0) {
            f = 2;
        } else {
            f = 3;
        }
        return btoa(array_to_string([f].concat(x)))
    }
    function raw_sign(x) {
        //x should be a list of bytes.
        var h = hash(x);
        var sig = keys_internal.sign(h);
        var sig2 = sig.toDER();
        return btoa(array_to_string(sig2));
    }
    function sign_tx(tx) {
        var sig;
        var stx;
	if (tx[0] == "signed") {
	    console.log(JSON.stringify(tx));
            //var sig = raw_sign(tx[1]);
	    sig = btoa(array_to_string(sign(tx[1], keys_internal)));
	    stx = tx;

	} else {
            sig = btoa(array_to_string(sign(tx, keys_internal)));
            stx = ["signed", tx, [-6], [-6]];
	}
	var pub = pubkey_64();
	if ((stx[1][0] == -7) || (pub == stx[1][1])) {
	    stx[2] = sig;
	} else if (pub == stx[1][2]) {
	    stx[3] = sig;
	} else {
	    console.log(JSON.stringify(tx));
	    throw("sign error");
	}
        return stx;
    }
    function update_pubkey() {
        var pub = pubkey_64();
        var link = document.createElement("a");
        link.href = "account_explorer.html?pubkey="
            .concat(pub);
        link.innerHTML = pub;
        link.target = "_blank";
        pub_div.innerHTML = ("your pubkey ");
        pub_div.appendChild(link);
    }
    function watch_only_func() {
	var v = watch_only_pubkey.value;
	keys_internal = new_keys_watch(string_to_array(atob(v)));
	update_pubkey();
    }
    function new_keys_check() {
        //alert("this will delete your old keys. If you havemoney secured by this key, and you haven't saved your key, then this money will be destroyed.");
        var warning = document.createElement("h3");
        warning.innerHTML = "This will delete your old keys from the browser. Save your keys before doing this.";
        var button = button_maker2("cancel ", cancel);
        var button2 = button_maker2("continue", doit);
	var entropy_txt = document.createElement("h3");
	entropy_txt.innerHTML = "put random text here to make keys from";
	var entropy = document.createElement("input");
	entropy.type = "text";
        append_children(new_pubkey_div, [entropy_txt, entropy, warning, button, br(), button2]);
	// add interface for optional entropy 
        function cancel() {
            new_pubkey_div.innerHTML = "";
        }
        function doit() {
            new_pubkey_div.innerHTML = "";
	    var x = entropy.value;
	    if (x == '') {//If you don't provide entropy, then it uses a built in random number generator.
		keys_internal = new_keys();
		set_balance(0);
	    } else {
		keys_internal = new_keys_entropy(x);
	    }
            update_pubkey();
        }
    }
    function check_balance(Callback) {
        var trie_key = pubkey_64();
        //var top_hash = hash(headers_object.serialize(headers_object.top()));
        merkle.request_proof("accounts", trie_key, function(x) {
	    Callback(x[1]);
        });
    }
    var update_balance_callback = function(){
        return(0);
    };
    function update_balance() {
        var trie_key = pubkey_64();
        var headers_top = headers_object.top();
        if (headers_top == 0) {
            setTimeout(update_balance,
                       20);
            return(0);
        }
        //var top_hash = hash(headers_object.serialize(headers_object.top()));
        rpc.post(["account", trie_key], function(unconfirmed) {
            var U = unconfirmed[1] / token_units();
            
            merkle.request_proof("accounts", trie_key, function(x) {
                var C = x[1] / token_units();
                //set_balance(C);
                var S = ("your balance ").concat(
                    (C).toString()).concat(
                        " VEO");
                if (!(C == U)) {
                    S = S.concat(
                        ", unconfirmed: ").concat(
                            (U-C).toString()).concat(
                                " VEO");
                };
                bal_div.innerHTML = S;
                update_balance_callback();
            });
        });
    }
    function set_balance(n) {
        bal_div.innerHTML = ("your balance ").concat((n).toString()) + " VEO";
    }
    function save_keys() {
        download(keys_internal.getPrivate("hex"), save_name.value, "text/plain");
	update_pubkey();
    }
    function load_keys() {
        var file = (file_selector.files)[0];
        var reader = new FileReader();
        reader.onload = function(e) {
	    set_balance(0);
            keys_internal = ec.keyFromPrivate(reader.result, "hex");
            update_pubkey();
            update_balance();
        }
        reader.readAsText(file);
    }
    function encrypt(val, to) {
        return encryption_object.send(val, to, keys_internal);
    }
    function decrypt(val) {
	return encryption_object.get(val, keys_internal);
    }
    return {make: new_keys,
            pub: pubkey_64,
            raw_sign: raw_sign,
            sign: sign_tx,
            ec: (function() { return ec; }),
            encrypt: encrypt,
            decrypt: decrypt,
            check_balance: check_balance,
            keys_internal: (function() {return keys_internal;}),
            update_balance:update_balance,
            update_balance_callback: (function (x) {
                update_balance_callback = x;}),
            compress: compress_pub,
            decompress: decompress_pub };
}
var keys = keys_function1();
