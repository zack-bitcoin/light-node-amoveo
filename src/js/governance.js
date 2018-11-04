(function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    var title = document.createElement("h3");
    title.innerHTML = "governance";
    div.appendChild(title);
    var oid = document.createElement("INPUT");
    oid.type = "text";
    div.appendChild(oid);
    var b = button_maker2("lookup governance", lookup);
    div.appendChild(b);
    div.appendChild(br());
    var governanceOutput = document.createElement("div");
    div.appendChild(governanceOutput);
    div.appendChild(br());
    function tree_number_to_value(n) {
	if (n < 101) {
	    return n;
	} else {
	    return tree_number_to_value_exponential(n - 100);
	}
    }
    function tree_number_to_value_exponential(t) {
	var top = 101;
	var bottom = 100;
	return det_power(top, bottom, t);
    }
    function det_power(top, bottom, t) {
	return Math.floor(det_power2(10000, top, bottom, t)/100)
    }
    function det_power2(base, top, bottom, t) {
	if (t == 1) {
	    return Math.floor( (base * top) / bottom);
	} else {
	    var r = t % 2;
	    if (r == 1) {
		var b2 = Math.floor((base * top) / bottom);
		return det_power2(b2, top, bottom, t-1);
	    } else {
		return det_power2(base, Math.floor((top*top) / bottom), bottom, Math.round(t / 2));
	    }
	}
    }
    function id_to_name(id) {
	if (id == 1) { return "block_reward"; }
	else if (id == 2) { return "developer_reward"; }
	else if (id == 3) { return "max_block_size"; }
	else if (id == 4) { return "block_period"; }
	else if (id == 5) { return "time_gas"; }
	else if (id == 6) { return "space_gas"; }
	else if (id == 7) { return "fun_limit"; }
	else if (id == 8) { return "var_limit"; }
	else if (id == 9) { return "governance_change_limit"; }
	else if (id == 10) { return "oracle_initial_liquidity"; }
	else if (id == 11) { return "minimum_oracle_time"; }
	else if (id == 12) { return "maximum_oracle_time"; }
	else if (id == 13) { return "maximum_question_size"; }
	else if (id == 14) { return "create_acc_tx"; }
	else if (id == 15) { return "spend"; }
	else if (id == 16) { return "delete_acc_tx"; }
	else if (id == 17) { return "nc"; }
	else if (id == 18) { return "ctc"; }
	else if (id == 19) { return "csc"; }
	else if (id == 20) { return "timeout"; }
	else if (id == 21) { return "cs"; }
	else if (id == 22) { return "ex"; }
	else if (id == 23) { return "oracle_new"; }
	else if (id == 24) { return "oracle_bet"; }
	else if (id == 25) { return "oracle_close"; }
	else if (id == 26) { return "unmatched"; }
	else if (id == 27) { return "oracle_winnings"; }
	else if (id == 28) { return "oracle_question_liquidity"; }
	else {return "not a governance id";}
    }
    function lookup() {
	governanceOutput.innerHTML = "";
	var v = parseInt(oid.value);
	console.log(v);
	merkle.request_proof("governance", v, function(x) {
	    console.log(JSON.stringify(x));
	    var id = x[1];
	    var value = tree_number_to_value(x[2]);
	    var locked = x[3];
	    var locked_text;
	    if (locked == 0) {
		locked_text = ". is not locked.";
	    } else {
		locked_text = ". is locked.";
	    }
	    var name = id_to_name(id);
	    console.log(value);
	    console.log((value).toString());
	    //governanceOutput.appendChild(br());
	    
	    governanceOutput.appendChild(text("governance name ".concat(name).concat(". value is ").concat((value).toString()).concat(locked_text)));
	    //governanceOutput.appendChild(text((value).toString()));
	});
    };
})();
