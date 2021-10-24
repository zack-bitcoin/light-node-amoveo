
var spend_tx = (function () {
    var div = document.createElement("div");
    if(!(configure["spend_tx_interface"] === false)){
        document.body.appendChild(div);
    };
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
	var to = parse_address(spend_address.value);
        var Amount = parseFloat(spend_amount.value, 10);
	if (to == 0) {
	    error_msg.innerHTML = "please input the recipient's address";
            return(0);
	};
        max_send_amount(keys.pub(), to, function(A2, tx_type){
	    spend_amount.value = (A2 / token_units()).toString();
        });
    });
    div.appendChild(calculate_max_send_button);
    div.appendChild(br());
    div.appendChild(spend_amount_info);
    div.appendChild(spend_amount);
    div.appendChild(input_info);
    div.appendChild(spend_address);
    div.appendChild(spend_button);
    div.appendChild(raw_button);
    div.appendChild(error_msg);
    div.appendChild(br());
    div.appendChild(raw_tx);
    var fee;
    async function afee_lookup(to, callback){
        var acc = await rpc.apost(["account", to]);
        var tx_type = "spend";
        var gov_id = 15;
        if((acc === 0) || (acc === "empty")){
            tx_type = "create_acc_tx";
            gov_id = 14;
        };
	var gov_fee = await merkle.arequest_proof("governance", gov_id);
	var fee = tree_number_to_value(gov_fee[2]) + 50;
        return([fee, tx_type]);
    };
    async function amake_tx(to, from, amount){
        var from_acc = await rpc.apost(["account", from]);
        return(amake_tx2(from_acc, to, from, amount));
    };
    async function amake_tx2(from_acc, to, from, amount){
        var nonce = from_acc[2] + 1;
        var [fee, tx_type] = await afee_lookup(to);
        var tx = [tx_type, from, nonce, fee, to, amount];
        if(tx_type === "spend"){
            tx = tx.concat([0]);
        };
        return(tx);
    };
    function print_tx(){
        parse_inputs(function(tx){
            error_msg.innerHTML = JSON.stringify(tx);
        });
    };
    async function parse_inputs(callback){
	var to = parse_address(spend_address.value);
        var amount = Math.floor(parseFloat(spend_amount.value, 10) * token_units());
        var from = keys.pub();
        var from_acc = await rpc.apost(["account", from]);
        console.log(from_acc);
        var bal = from_acc[1];
        if(from_acc === 0) {
	    error_msg.innerHTML = "load a private key with money";
        } else if (bal < amount){
	    error_msg.innerHTML = "insufficient balance. you cannot afford to make this tx.";
	} else if (to === 0) {
	    error_msg.innerHTML = "Badly formatted recipient's address";
	} else {
            var x = await amake_tx2(
                from_acc, to, keys.pub(), amount);
            return(callback(x));
        };
    };
    async function spend_tokens() {
        parse_inputs(async function(tx){
            var stx = keys.sign(tx);
            var msg = await apost_txs([stx]);
            error_msg.innerHTML = msg;
        });
    };
    async function max_send_amount(pub, to, callback){
        var acc = await rpc.apost(["account", pub]);
        var bal = acc[1];
        var [fee, tx_type] = await afee_lookup(to);
        callback(bal-fee-1, tx_type);
    };
    return({
        amake_tx: amake_tx,
        max_send_amount: max_send_amount
    });
})();

