var subcurrency_balance = (function(){

    var div = document.getElementById("subcurrency_balance");
    var display = document.createElement("p");
    div.appendChild(br());
    div.appendChild(display);
    div.appendChild(br());

    var contract_id = text_input("contract_id: ", div);
    contract_id.value = "smNS5nh9+rYThL095bt6oQIi6jQYbL2FZtleyxxroyM=";
    div.appendChild(contract_id);
    div.appendChild(br());
    var button = button_maker2("update balance", balance);
    div.appendChild(button);
    div.appendChild(br());
    function balance(){
        var cid_key = contract_id.value;
        merkle.request_proof("contracts", cid_key, function(c) {
            var many_types = c[2];
            balance2(many_types, cid_key, c, "");
        });
    };
    function balance2(type, cid, contract, s) {
        if(type < 1){
            display.innerHTML = s;
            return(0);
        };
        var veo_key = keys.pub();
        var trie_key =
            hash((string_to_array(atob(veo_key)))
                 .concat(string_to_array(atob(cid)))
                 .concat(integer_to_array(type, 32)));
        var trie_key = btoa(array_to_string(trie_key));
        merkle.request_proof("sub_accounts", trie_key, function(x) {
            var amount = 0;
            if(x[0] == "sub_acc"){
                amount = x[1];
            };
            s = s
                .concat("<br> type ")
                .concat(type)
                .concat(" balance: ")
                .concat(amount);
            balance2(type-1, cid, contract, s);
        });
    };
    return({value: contract_id.value});
})();
