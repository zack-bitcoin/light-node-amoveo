var binary_id = (function(){
    //generate the id for a binary contract
    var div = document.getElementById("binary_id");
    var display = document.createElement("p");
    div.appendChild(display);
    var full = btoa(array_to_string([255,255,255,255]));
    var empty = btoa(array_to_string([0,0,0,0]));
    var oracle_start_height = text_input("when it becomes possible to report on the outcome of the oracle question. a block height: ", div);
    div.appendChild(br());
    var oracle_text = text_input("the question we ask the oracle", div);
    div.appendChild(br());
    var button = button_maker2("make contract id", doit);
    div.appendChild(button);
    function doit(){
        var Start = parseInt(oracle_start_height.value);
        var Text = oracle_text.value;
        var oracle_id = id_maker(Start, 0, 0, Text);//from format
        var CH = binary_derivative.hash(oracle_id);
        var MT = 3;
        var Source = btoa(array_to_string(integer_to_array(0, 32)));
        var SourceType = 0;
        var cid = binary_derivative.id_maker(CH, MT, Source, SourceType);
        display.innerHTML = cid;
        return(0);
    };
    return({
        start: function(x){oracle_start_height.value = x},
        text: function(x){oracle_text.value = x},
        doit:doit
    });
})();
