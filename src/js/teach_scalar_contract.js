var teach_scalar_contract = (function(){
    var div = document.getElementById("teach_scalar_contract");
    var display = document.createElement("p");
    div.appendChild(display);

    var s_ip = text_input("server ip: ", div);
    div.appendChild(br());
    s_ip.value = get_ip();
    
    var s_port = text_input("server port: ", div);
    div.appendChild(br());
    s_port.value = "8090";

    var oracle_text = text_input("what is being measured, and at what time?: ", div);
    div.appendChild(br());
    //    var oracle_height = text_input("oracle height, an integer: ", div);
    //div.appendChild(br());
    var max_val = text_input("maximum value that can be measured, an integer: ", div);
    div.appendChild(br());
    var source = text_input("source contract (leave blank for veo): ", div);
    div.appendChild(br());
    var source_type = text_input("source subcurrency type (leave blank for veo): ", div);
    div.appendChild(br());
    var button = button_maker2("teach", teach);
    div.appendChild(button);
    async function teach() {
        var msg = ["add", 3,
                   btoa(oracle_text.value),
                   0,
                   parseInt(max_val.value)
                  ];
        if(!(source.value == "")){
            msg = msg.concat(
                [source.value,
                 parseInt(source_type.value)]);
        };
        console.log(msg);
        var x = await rpc.apost(
            msg,
            s_ip.value,
            parseInt(s_port.value));
        console.log(x);
        display.innerHTML = "successfully taught contract with id: "
            .concat(x);
        return(0);
    };
    return({
        oracle_text: function(x){oracle_text.value = x},
        max_val: function(x){max_val.value = x},
        teach: teach
    });
})();
