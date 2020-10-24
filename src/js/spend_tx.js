
var spend_tx = (function spend_1() {
    var div = document.createElement("div");
    document.body.appendChild(div);
    div.appendChild(document.createElement("br"));
    var spend_amount = document.createElement("INPUT");
    spend_amount.setAttribute("type", "text");
    //spend_amount.id = "spend_amount";
    var spend_amount_info = document.createElement("h8");
    spend_amount_info.innerHTML = "amount to send: ";

    var spend_address = document.createElement("INPUT");
    spend_address.setAttribute("type", "text");
    //spend_address.id = "spend_address";
    var input_info = document.createElement("h8");
    input_info.innerHTML = "to pubkey: ";
    var raw_tx = document.createElement("h8");
    spend_button = button_maker2("send", spend_tokens);
    raw_button = button_maker2("print unsigned transaction to screen", print_tx);
    var error_msg = document.createElement("div");
    var calculate_max_send_button = button_maker2("calculate max send amount", function() {
	keys.check_balance(function(Amount) {
            var to0 = spend_address.value;
	    var to = parse_address(to0);
	    if (to == 0) {
		error_msg.innerHTML = "please input the recipient's address";
	    } else {
		error_msg.innerHTML = "";
	    }
            fee_lookup(to, function(fee, tx_type){
		var A2 = Amount - fee - 1;
		spend_amount.value = (A2 / token_units()).toString();

            });
	});
    });
    div.appendChild(calculate_max_send_button);
    div.appendChild(document.createElement("br"));
    div.appendChild(spend_amount_info);
    div.appendChild(spend_amount);
    div.appendChild(input_info);
    div.appendChild(spend_address);
    div.appendChild(spend_button);
    div.appendChild(raw_button);
    div.appendChild(error_msg);
    div.appendChild(document.createElement("br"));
    div.appendChild(raw_tx);
    var fee;
    function fee_lookup(to, callback){
        rpc.post(["account", to], function(acc){
            var tx_type = "spend";
            var gov_id = 15;
            if((acc === 0) || (acc === "empty")){
                tx_type = "create_acc_tx";
                gov_id = 14;
            };
	    merkle.request_proof("governance", gov_id, function(gov_fee) {
		var fee = tree_number_to_value(gov_fee[2]) + 50;
                return(callback(fee, tx_type));
            });
        });
    };
    function make_tx(to, from, amount, callback){
        rpc.post(["account", from], function(from_acc){
            return(make_tx2(from_acc, to, from, amount, callback));
        });
    };
    function make_tx2(from_acc, to, from, amount, callback){
        var nonce = from_acc[2] + 1;
        fee_lookup(to, function(fee, tx_type){
            var tx = [tx_type, from, nonce, fee, to, amount];
            if(tx_type === "spend"){
                tx = tx.concat([0]);
            };
            return(callback(tx));
        });
    };
    function print_tx(){
        parse_inputs(function(tx){
            error_msg.innerHTML = JSON.stringify(tx);
        });
    };
    function parse_inputs(callback){
	var to = parse_address(spend_address.value);
        var amount = Math.floor(parseFloat(spend_amount.value, 10) * token_units());
        var from = keys.pub();
        rpc.post(["account", from], function(from_acc){
            console.log(from_acc);
            var bal = from_acc[1];
            if(from_acc === 0) {
	        error_msg.innerHTML = "load a private key with money";
            } else if (bal < amount){
	        error_msg.innerHTML = "insufficient balance. you cannot afford to make this tx.";
	    } else if (to === 0) {
	        error_msg.innerHTML = "Badly formatted recipient's address";
	    } else {
                return(make_tx2(from_acc, to, keys.pub(), amount, function(tx){
                    callback(tx);
                }));
            };
        });
    };

    function spend_tokens() {
        parse_inputs(function(tx){
            var stx = keys.sign(tx);
            post_txs([stx], function(msg){
                error_msg.innerHTML = msg;
            });
        });
    };
    return({
        make_tx:make_tx
    });
})();

