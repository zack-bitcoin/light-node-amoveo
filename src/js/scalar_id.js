var scalar_id = (function(){
    var div = document.getElementById("scalar_id");
    var display = document.createElement("p");
    div.appendChild(display);

    //var oracle_start_height = text_input("when it becomes possible to report on the outcome of the oracle question. a block height: ", div);
    //div.appendChild(br());
    var oracle_text = text_input("the question we ask the oracle", div);
    div.appendChild(br());
    var max_price_text = text_input("maximum value we can measure with this oracle", div);
    div.appendChild(br());
    var source = text_input("source contract (leave blank for veo): ", div);
    div.appendChild(br());
    var source_type = text_input("source subcurrency type (leave blank for veo): ", div);
    div.appendChild(br());

    var button = button_maker2("make contract id", doit);
    div.appendChild(button);
    function doit(){
        //var Start = parseInt(oracle_start_height.value);
        var Text = oracle_text.value;
        var Max = parseInt(max_price_text.value);
        var contract = scalar_derivative.maker(Text, Max, 0);
        var CH = scalar_derivative.hash(contract);

        var MT = 2;
        var Source, SourceType;
        if(source.value == ""){
            Source = btoa(array_to_string(integer_to_array(0, 32)));
            SourceType = 0;
        } else {
            Source = source.value;
            SourceType = parseInt(source_type.value);
        };
        console.log([CH, MT, Source, SourceType]);
        var cid = binary_derivative.id_maker(CH, MT, Source, SourceType);
        display.innerHTML = cid;
        return(0);
    };
    return({
        //height: function(x){oracle_start_height.value = x},
        text: function(x){oracle_text.value = x},
        max: function(x){max_price_text.value = x},
        doit: doit
    });
})();
