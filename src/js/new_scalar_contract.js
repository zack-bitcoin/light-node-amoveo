var new_scalar_contract = (function(){
    var div = document.getElementById("new_scalar_contract");
    //var div = document.createElement("div");
    var display = document.createElement("p");
    div.appendChild(display);
    var full = btoa(array_to_string([255,255,255,255]));
    var empty = btoa(array_to_string([0,0,0,0]));

    //var oracle_start_height = text_input("when it becomes possible to report on the outcome of the oracle question. a block height: ", div);
    //div.appendChild(br());
    var oracle_text = text_input("the question we ask the oracle", div);
    div.appendChild(br());
    var max_price_text = text_input("maximum value we can measure with this oracle", div);
    div.appendChild(br());
    var button = button_maker2("make contract", make_contract);
    div.appendChild(button);

    function make_contract(){
        //var Start = parseInt(oracle_start_height.value);
        var Text = oracle_text.value;
        var MP = parseInt(max_price_text.value);
        var tx = make_tx(Text, MP);
        var CH = tx[2];
        console.log(CH);
        var cid = binary_derivative.id_maker(CH, 2);
        var stx = keys.sign(tx);
        post_txs([stx], function(msg){
            display.innerHTML = msg
                .concat("<br>the contract id is <br>")
                .concat(cid);
        });
    };
    function make_tx(text, max_price, Source, SourceType){
        var contract = scalar_derivative.maker(text, max_price);
        var CH = scalar_derivative.hash(contract);
        console.log("new scalar contract make tx");
        console.log(JSON.stringify(CH));
        console.log(JSON.stringify([text, max_price]));
        //i6Z+KENBfoAiJ0+GNRtw5yZrnZ/U26f+stv2/McKWZk=
        var Fee = 152050;
        var MT = 2;
        if(!(Source)){
            Source = btoa(array_to_string(integer_to_array(0, 32)));
            SourceType = 0;
        };
        var tx = ["contract_new_tx", keys.pub(), CH, Fee, MT, Source, SourceType];
        return(tx);
    };
    return({
        //height: function(x){oracle_start_height.value = x},
        text: function(x){oracle_text.value = x},
        max: function(x){max_price_text.value = x},
        make_tx: make_tx
    });
})(); 
