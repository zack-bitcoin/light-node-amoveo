var subcurrency_balance = (function(){

    var div = document.getElementById("subcurrency_balance");
    var display = document.createElement("p");
    div.appendChild(display);

    var contract_id = text_input("contract_id: ", div);
//    contract_id.value = "smNS5nh9+rYThL095bt6oQIi6jQYbL2FZtleyxxroyM=";
    div.appendChild(contract_id);
    div.appendChild(br());
    var button = button_maker2("update balance", balance);
    div.appendChild(button);
    div.appendChild(br());
    async function balance(){
        var cid_key = contract_id.value;
        //merkle.request_proof("contracts", cid_key, function(c) {
        var c = await merkle.arequest_proof("contracts", cid_key);
        var many_types;
        if(c == "empty"){
            many_types = 10;
            //display.innerHTML = "that contract does not exist"
            //return(0);
        } else {
            many_types = c[2];
        }
        balance2(many_types, cid_key, c, "");
        //});
    };
    async function balance2(type, cid, contract, s) {
        if(type < 1){
            display.innerHTML = s;
            return(0);
        };
        var trie_key = sub_accounts.key(keys.pub(), cid, type);
        trie_key = btoa(array_to_string(trie_key));
        //merkle.request_proof("sub_accounts", trie_key, function(x) {
        //rpc.post(["sub_accounts", trie_key], function(x) {
        var x = await rpc.apost(["sub_accounts", trie_key]);
        var amount = 0;
        if(x[0] == "sub_acc"){
            amount = x[1];
        };
        s = ("")
            .concat("<br> type ")
            .concat(type)
            .concat(" balance: ")
            .concat(amount)
            .concat(s);
        balance2(type-1, cid, contract, s);
        //});
    };
    return({value: function(x) { contract_id.value = x}
           });
})();
