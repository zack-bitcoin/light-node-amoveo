(function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    var title = document.createElement("h3");
    title.innerHTML = "oracles";
    div.appendChild(title);
    var oid = document.createElement("INPUT");
    oid.type = "text";
    div.appendChild(oid);
    var b = button_maker2("lookup oracle", lookup);
    div.appendChild(b);
    div.appendChild(br());
    var oracleOutput = document.createElement("div");
    div.appendChild(oracleOutput);
    div.appendChild(br());
    async function lookup() {
	oracleOutput.innerHTML = "";
	var v = oid.value;
	var x = await merkle.arequest_proof("oracles", v);
	var result = x[2];
	var question_hash = x[3];
	var starts = x[4];
	var type = x[5];
	var done_timer = x[9];
	var governance = x[10];
	var governance_amount = x[11];
	var orders_hash = x[7];
	var a;
	if (result == 0) {
	    a = text("this oracle is still open");
	} else if (result == 1) {
	    a = text("this oracle closed in state: true");
	} else if (result == 2) {
	    a = text("this oracle closed in state: false");
	} else if (result == 3) {
	    a = text("this oracle closed in state: bad-question");
	} else {
            console.log("result is ");
            console.log(a);
            return(0);
        }
	oracleOutput.appendChild(a);
	oracleOutput.appendChild(br());
        var scalar_price_div = document.createElement("div");
        oracleOutput.appendChild(scalar_price_div);
        var gov_div = document.createElement("div");
        oracleOutput.appendChild(gov_div);
	if (governance == 0) {
	    gov_div.appendChild(text("this is a question oracle"));
	    gov_div.appendChild(br());
            console.log(v);
            var x = await rpc.apost(["oracles", v]);
            //todo? we should verify that hash(q) == v;
            var question_hash = x[3];
            var t = await rpc.apost(["oracle", 2, question_hash]);
            var q = "asks: "
                .concat(atob(t));
            gov_div.appendChild(text(q));
	} else {
	    oracleOutput.appendChild(text("this is a governance oracle"));
	    oracleOutput.appendChild(br());
	    var gov_txt = "governance variable: ".concat(JSON.stringify(governance));
	    oracleOutput.appendChild(text(gov_txt));
	    oracleOutput.appendChild(br());
	    var gov_amount_txt = "governance amount: ".concat(JSON.stringify(governance_amount));
	    oracleOutput.appendChild(text(gov_amount_txt));
	}
	oracleOutput.appendChild(br());
	var starts_txt = "starts: ".concat(JSON.stringify(starts));
	oracleOutput.appendChild(text(starts_txt));
	oracleOutput.appendChild(br());
	var type2;
	if (type == 3) {
	    type2 = "bad-question";
	} else if (type == 1) {
	    type2 = "true";
	} else if (type == 2) {
	    type2 = "false";
	}
	var type_txt = "current type: ".concat(type2);
	oracleOutput.appendChild(text(type_txt));
	oracleOutput.appendChild(br());
	var done_txt = "done timer: ".concat(JSON.stringify(done_timer));
	oracleOutput.appendChild(text(done_txt));
        
        var root = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE=";
    };
    async function lookup_unmatched_head(root, oid, div) {
        var key = ["key", root, oid];
	var x = await merkle.arequest_proof("unmatched", key);
        return lookup_unmatched_orders(x[1], oid, div, 1);
    };
    async function lookup_unmatched_orders(pub, oid, div, N) {
        var key = ["key", pub, oid];
        var Null = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
	var x = await merkle.arequest_proof("unmatched", key);
        var amount = x[3];
        div.appendChild(br());
        div.appendChild(text("oracle bet number ".concat((N).toString()).concat(" with pubkey: ").concat(pub).concat(" amount: ").concat((s2c(amount)).toString())));
        div.appendChild(br());
        var pointer = x[4];
        if (pointer == Null) {
            return 0;
        } else {
            return lookup_unmatched_orders(pointer, oid, div, N+1);
        }
    }
    function oracle_bets(x) {
	console.log("inside oracle bets");
	console.log(JSON.stringify(x));
    }
    function try_get_scalar_price(oid, div) {
        //very similar to otc_finisher.js get_oracle_binary.
        scalar_keys1(oid, function(ks) {
            return(tgsp((ks).reverse(), div, 0));
        });
    };
    async function tgsp(ks, div, result) {
        if (ks.length == 0) {
            div.innerHTML = "scalar oracle result if closed now: ".concat(result);
            return(0);
        }
        var r = await merkle.arequest_proof("oracles", ks[0]);
        var r2 = r[2];//3 is bad, 2 is false, 1 is true, 0 is still open
        if (r2 == 0) {
            //the oracle isn't closed yet
            r2 = r[5];
        }
        if ((r2 == 3) || (r2 == 0)) {
            div.innerHTML = "scalar oracle result if closed now: bad question";
            return 0;
        } else if (r2 == 1) {
            return tgsp(ks.slice(1), div, (result * 2) + 1);
        } else if (r2 == 2) {
            return tgsp(ks.slice(1), div, (result * 2));
        };
    };
    function old_tgsp(oid, div, many, result0) {
        if (many == 0) {
            div.innerHTML = "scalar oracle result if closed now: ".concat(result0);
            return(0);
        }
        merkle.request_proof("oracles", oid, function(r) {
            var result = r[2];//3 is bad, 2 is false, 1 is true, 0 is still open
            if (result == 0) {
                //the oracle isn't closed yet
                result = r[5];
            }
            if ((result == 3) || (result == 0)) {
                div.innerHTML = "scalar oracle result if closed now: bad question";
                return 0;
            } else if (result == 1) {
                return tgsp(btoa(next_oid(atob(oid))), div, many - 1, (result0 * 2) + 1);
            } else if (result == 2) {
                return tgsp(btoa(next_oid(atob(oid))), div, many - 1, (result0 * 2));
            };
        });
    };
})();
