lookup_account1();
function lookup_account1() {
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(document.createElement("br"));
    var lookup_account = document.createElement("div");
    document.body.appendChild(lookup_account);
    var lookup_account_address = document.createElement("INPUT");
    lookup_account_address.setAttribute("type", "text");
    var input_info = document.createElement("h8");
    input_info.innerHTML = "pubkey: ";
    document.body.appendChild(input_info);
    document.body.appendChild(lookup_account_address);

    var lookup_account_button = document.createElement("BUTTON");
    var lookup_account_text_node = document.createTextNode("lookup account");
    lookup_account_button.appendChild(lookup_account_text_node);
    lookup_account_button.onclick = lookup_account_helper;
    document.body.appendChild(lookup_account_button);

    var zeroth_confirmation = document.createElement("p");
    zeroth_confirmation.innerHTML = "this shows your balance including 0th confirmation txs which are not yet included in a block.";
    document.body.appendChild(zeroth_confirmation);
    document.body.appendChild(document.createElement("br"));

    async function lookup_account_helper() {
        var x = lookup_account_address.value.trim();
        var y = await rpc.apost(["account", x]);
        lookup_accounts_helper2(y);
    }
    function lookup_account_helper2(x) {
        lookup_account.innerHTML = "balance: ".concat(x[1] / token_units()).concat(" VEO");
    }
}
