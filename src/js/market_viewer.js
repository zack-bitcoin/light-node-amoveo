var market_viewer = (function(){
    var div = document.getElementById("market_viewer");
    var display = document.createElement("p");
    div.appendChild(display);

    var mid = text_input("market id: ", div);
    div.appendChild(br());
    var button = button_maker2("lookup market", doit);
    div.appendChild(button);

    function doit(){
        merkle.request_proof("markets", mid.value, function(c) {
            //-record(market, {id, cid1, type1, amount1, cid2, type2, amount2, shares}).
            display.innerHTML = JSON.stringify(c);
            console.log(JSON.stringify(c));
        });
    };
    return({
        mid: function(x){mid.value = x},
        doit: doit
    });
})();
