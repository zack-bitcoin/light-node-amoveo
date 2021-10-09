var market_liquidity_balance = (function(){
    var div = document.getElementById("market_liquidity_balance");
    var display = document.createElement("p");
    div.appendChild(display);

    var mid = text_input("market id: ", div);
    div.appendChild(br());
    var button = button_maker2("check blance", doit);
    div.appendChild(button);
    async function doit(){
        var key = sub_accounts.key(keys.pub(), mid.value, 0);
        var key = btoa(array_to_string(key));
        //merkle.request_proof("sub_accounts", key, function(x) {
        var x = await merkle.arequest_proof("sub_accounts", key);
        var amount;
        if(x == "empty"){
            amount = 0;
        } else {
            amount = x[1];
        };
        display.innerHTML = ("you have this much: ").concat(amount);
    //});
    };
    return({
        mid: (function(x){mid.value = x})
    });
})();
