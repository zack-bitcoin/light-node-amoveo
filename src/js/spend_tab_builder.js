function spend_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var display = document.createElement("div");
    var title = document.createElement("h3");
    title.innerHTML = "Spend currency";
    div.appendChild(title);
    div.appendChild(br());
    div.appendChild(display);
    div.appendChild(br());
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "kind to send: ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());
    var amount_text = text_input("how much to send: ", div);
    var max_button = button_maker2("max", calculate_max);
    div.appendChild(amount_text);
    div.appendChild(max_button);
    div.appendChild(br());
    var recipient_text = text_input("who to send to: ", div);
    var button = button_maker2("send", send);
    div.appendChild(br());
    div.appendChild(button);
    div.appendChild(br());

    function calculate_max(){
        if(selector.value == "veo"){
            merkle.request_proof("accounts", keys.pub(), function(x) {
                amount_text.value = (x[1] / token_units()).toString();
            });
        } else {
            var V = JSON.parse(selector.value);
            var cid = V[0];
            var type = parseInt(V[1]);
            var trie_key = sub_accounts.key(keys.pub(), cid, type);
            var trie_key = btoa(array_to_string(trie_key));
            merkle.request_proof("sub_accounts", trie_key, function(x) {
                amount_text.value = (x[1] / token_units()).toString();
            });
        };
    };
    function send(){
        rpc.post(["account", keys.pub()], function(ma) {
        //merkle.request_proof("accounts", keys.pub(), function(ma) {
            var Nonce = ma[2] + 1;
            var fee = 152050;
            var to = recipient_text.value;
            to = parse_address(to);
            var amount = Math.round(parseFloat(amount_text.value)* token_units());
            if(selector.value == "veo"){
                if(to == 0){
                    display.innerHTML = "badly formatted recipient's address";
                    return(0);
                };
                //merkle.request_proof("accounts", to, function(them) {
                rpc.post(["account", to], function(them) {
                    var tx;
                    if(them == "empty"){
		        tx = ["create_acc_tx", keys.pub(), Nonce, fee, to, amount];
                    } else {
		        tx = ["spend", keys.pub(), Nonce, fee, to, amount, 0];
                    };
                    console.log(JSON.stringify(tx));
                    var stx = keys.sign(tx);
                    post_txs([stx], function(msg){
                        display.innerHTML = msg;
                    });
                });
            } else {
                var V = JSON.parse(selector.value);
                var cid = V[0];
                var type = parseInt(V[1]);
                var tx = ["sub_spend_tx",
                          keys.pub(),
                          Nonce,
                          fee, to, amount,
                          cid, type];
                console.log(JSON.stringify(tx));
                var stx = keys.sign(tx);
                post_txs([stx], function(msg){
                    display.innerHTML = msg;
                });
            };
        });
    };
};
