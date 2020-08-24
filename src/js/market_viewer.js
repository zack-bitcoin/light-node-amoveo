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
            if(c == "empty") {
                display.innerHTML = "that market does not exist";
                return(0);
            };
            //-record(market, {id, cid1, type1, amount1, cid2, type2, amount2, shares}).
    //["market","7VcDtMRdZ0vTy9kzDoiMCiqveix/bs0t5qBla4fIWYE=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",0,1010000,"vWSumtEl1WBhxaeVzu/MdBQtdmnuWTXMtupnKTDJ+vI=",2,990099,1000000]
            console.log(c);
            var sub1 = ("")
                .concat(" <br> contract 1: ")
                .concat(c[2])
                .concat(" <br> type 1: ")
                .concat(c[3]);
            if(c[2] == btoa(array_to_string(integer_to_array(0, 32)))){
                sub1 = "<br> currency 1: veo ";
            };
            var sub2 = ("")
                .concat(" <br> cid 2: ")
                .concat(c[5])
                .concat(" <br> type 2: ")
                .concat(c[6]);
            if(c[5] == btoa(array_to_string(integer_to_array(0, 32)))){
                sub1 = "<br> currency 2: veo ";
            };
            
            display.innerHTML = ("market id: ")
                .concat(c[1])
                .concat(sub1)
                .concat(" <br> amount 1: ")
                .concat(c[4])
                .concat(sub2)
                .concat(" <br> amount 2: ")
                .concat(c[7])
                .concat(" <br> shares: ")
                .concat(c[7]);
            //display.innerHTML = JSON.stringify(c);
            //console.log(JSON.stringify(c));
        });
    };
    return({
        mid: function(x){mid.value = x},
        doit: doit
    });
})();
