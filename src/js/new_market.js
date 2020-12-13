var new_market = (function(){
    var div = document.getElementById("new_market");
    if(!(div)){
        div = document.createElement("div");
    };
    var display = document.createElement("p");
    div.appendChild(display);
    var cid1 = text_input("subcurrency contract 1 (leave blank for veo): ", div);
    div.appendChild(br());
    var type1 = text_input("subcurrency contract 1 type (leave blank for veo): ", div);
    div.appendChild(br());
    var amount1 = text_input("how much of the first kind of subcurrency you pay: ", div);
    div.appendChild(br());
    var cid2 = text_input("subcurrency contract 2 (leave blank for veo): ", div);
    div.appendChild(br());
    var type2 = text_input("subcurrency contract 2 type (leave blank for veo): ", div);
    div.appendChild(br());
    var amount2 = text_input("how much of the second kind of subcurrency you pay: ", div);
    div.appendChild(br());
    var button = button_maker2("make market", doit);
    div.appendChild(button);


    function doit(){
        var Fee = 152050;
        var CID1 = cid1.value;
        var CID2 = cid2.value;
        var Type1 = parseInt(type1.value);
        var Type2 = parseInt(type2.value);
        if(!CID1){
            CID1 = btoa(array_to_string(integer_to_array(0, 32)));
            Type1 = 0;
        };
        if(!CID2){
            CID2 = btoa(array_to_string(integer_to_array(0, 32)));
            Type2 = 0;
        };
        var tx = ["market_new_tx", keys.pub(), 0, Fee,
                  CID1, CID2,
                  Type1,
                  Type2,
                  parseInt(amount1.value),
                  parseInt(amount2.value)];
        var MID = mid(CID1, CID2, Type1, Type2);
        console.log(JSON.stringify(tx));
        var stx = keys.sign(tx);
        post_txs([stx], function(msg){
            display.innerHTML = msg
                .concat(" and the market id is ")
                .concat(MID);
        });
    };
    function mid(CID1, CID2, Type1, Type2){
        var V1 = array_to_int(string_to_array(atob(CID1)));
        var V2 = array_to_int(string_to_array(atob(CID2)));
        if((V1 < V2) || ((V1 === V2) && (Type1 < Type2))){
            //[CID1, Type1] <= [CID2, Type2]){
        } else {
            return(mid(CID2, CID1, Type2, Type1));
            var CID3 = CID1;
            var Type3 = Type1;
            Type1 = Type2;
            CID1 = CID2;
            CID2 = CID3;
            Type2 = Type3;
        }
        var MID = btoa(array_to_string(
            hash(string_to_array(atob(CID1))
                 .concat(string_to_array(atob(CID2)))
                 .concat(integer_to_array(Type1, 2))
                 .concat(integer_to_array(Type2, 2)))));
        return(MID);
    };

    return({
        cid1: function(x){cid1.value = x},
        type1: function(x){type1.value = x},
        amount1: function(x){amount1.value = x},
        cid2: function(x){cid2.value = x},
        type2: function(x){type2.value = x},
        amount2: function(x){amount2.value = x},
        mid: mid,
        doit: doit
    });
})();
