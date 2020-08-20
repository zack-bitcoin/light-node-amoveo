var new_contract = (function(){
    var div = document.getElementById("new_contract");
    var display = document.createElement("p");
    div.appendChild(display);
    var full = btoa(array_to_string([255,255,255,255]));
    var empty = btoa(array_to_string([0,0,0,0]));

    var oracle_start_height = text_input("when it becomes possible to report on the outcome of the oracle question. a block height: ", div);
    div.appendChild(br());
    var oracle_text = text_input("the question we ask the oracle", div);
    div.appendChild(br());
    var button = button_maker2("make contract", make_contract);
    div.appendChild(button);
    function make_tx(Start, Text) {
        var oracle_id = id_maker(Start, 0, 0, Text);//from format
        var CH = binary_derivative.hash(oracle_id);
        var Fee = 152050;
        var MT = 3;
        var Source = btoa(array_to_string(integer_to_array(0, 32)));
        var SourceType = 0;
        var tx = ["contract_new_tx", keys.pub(), CH, Fee, MT, Source, SourceType];
        return(tx);
    }
    function make_contract(){
        var Start = parseInt(oracle_start_height.value);
        var Text = oracle_text.value;

        var tx = make_tx(Start, Text);
        console.log(tx);
        var stx = keys.sign(tx);
        post_txs([stx], function(msg){
            var CH = tx[2];
            var MT = tx[4];
            var Source = tx[5];
            var SourceType = tx[6];
            var cid = binary_derivative.id_maker(CH, MT, Source, SourceType);
            display.innerHTML = msg
                .concat("<br>the contract id is: ")
                .concat(cid);
        });
    };
    return({
        start_height: function(x){oracle_start_height.value = x},
        oracle_text: function(x){oracle_text.value = x},
        make_tx: make_tx,
        make_publish_tx: make_contract
    });
})(); 


