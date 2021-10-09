var new_scalar_contract = (function(){
    var div = document.getElementById("new_scalar_contract");
    if(!(div)){
        var div = document.createElement("div");
    };
    var display = document.createElement("p");
    div.appendChild(display);
    var full = btoa(array_to_string([255,255,255,255]));
    var empty = btoa(array_to_string([0,0,0,0]));

    var oracle_text = text_input("the question we ask the oracle", div);
    div.appendChild(br());
    var max_price_text = text_input("maximum value we can measure with this oracle", div);
    div.appendChild(br());
    var source = text_input("source contract (leave blank for veo): ", div);
    div.appendChild(br());
    var source_type = text_input("source subcurrency type (leave blank for veo): ", div);
    div.appendChild(br());
    var button = button_maker2("make contract", make_contract);
    div.appendChild(button);

    async function make_contract(){
        var Text = oracle_text.value;
        var MP = parseInt(max_price_text.value);
        if(MP<1){
            display.innerHTML = "max price must be an integer";
            return(0);
        }
        var Source, SourceType;
        if(source.value == ""){
            Source = btoa(array_to_string(integer_to_array(0, 32)));
            SourceType = 0;
        } else {
            Source = source.value;
            SourceType = parseInt(source_type.value);
        };
        var tx = make_tx(Text, MP, Source, SourceType);
        var CH = tx[2];
        var cid = merkle.contract_id_maker(CH, 2);

        setTimeout(async function(){
            var msg =
                ["add", 3, btoa(Text),
                 0, MP, Source,
                 SourceType];
            var x = await rpc.apost(msg, get_ip(), 8090);
            console.log(x);
            console.log("taught a scalar contract.");
            return(0);
        }, 0);

        var stx = keys.sign(tx);
        var msg = await apost_txs([stx]);
        display.innerHTML = msg
            .concat("<br>the contract id is <br>")
            .concat(cid);
    };
    function make_tx(text, max_price, Source, SourceType){
        var contract = scalar_derivative.maker(text, max_price);
        var CH = scalar_derivative.hash(contract);
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
        text: function(x){oracle_text.value = x},
        max: function(x){max_price_text.value = x},
        make_tx: make_tx
    });
})(); 
