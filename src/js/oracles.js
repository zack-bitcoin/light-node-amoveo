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
    function lookup() {
	oracleOutput.innerHTML = "";
	var v = oid.value;
	merkle.request_proof("oracles", v, function(x) {
	    var result = x[2];
	    var question_hash = x[3];
	    var starts = x[4];
	    var type = x[5];
	    var done_timer = x[9];
	    var governance = x[10];
	    var governance_amount = x[11];
	    var orders_hash = x[7];
            console.log(orders_hash);
	    var a;
	    if (result == 0) {
		a = text("this oracle is still open");
	    } else if (result == 1) {
		a = text("this oracle closed in state: true");
	    } else if (result == 2) {
		a = text("this oracle closed in state: false");
	    } else if (result == 3) {
		a = text("this oracle closed in state: bad-question");
	    }
	    oracleOutput.appendChild(a);
	    oracleOutput.appendChild(br());
            var gov_div = document.createElement("div");
            oracleOutput.appendChild(gov_div);
	    if (governance == 0) {
		gov_div.appendChild(text("this is a question oracle"));
		gov_div.appendChild(br());
		//var asks_txt = "asks: ".concat(btoa(btoa(question_hash)));
                console.log(v);
                variable_public_get(["oracle", v], function(x) {
                    //public_get["oracle, OID]
                    //we should verify that hash(q) == v;
                    console.log(x);
                    var q = atob(x[2]);
                    var question = q.slice(0, q.length);
		    var asks_txt = "asks: ".concat(question);
		    gov_div.appendChild(text(asks_txt));
                });
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

	    console.log("new");
	    console.log(v);
            console.log(orders_hash);
            //return 0;
            var key = ["key", orders_hash, v];
            console.log(JSON.stringify(key));
	    merkle.request_proof("unmatched", key, function(x) {
		console.log(x);
	        //variable_public_get(["oracle_bets", v], oracle_bets);
	        //now display the whole thing.
	        //oracleOutput.appendChild(br());
	        //var x2 = text(JSON.stringify(x));
	        //oracleOutput.appendChild(x2);
	    });

	});
    };
    function oracle_bets(x) {
	console.log("inside oracle bets");
	console.log(JSON.stringify(x));
    }
})();
