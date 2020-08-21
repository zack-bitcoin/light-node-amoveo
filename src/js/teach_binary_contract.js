var teach_binary_contract = (function(){
    //take oracle text and start height. sends to server.
    var div = document.getElementById("teach_binary_contract");
    var display = document.createElement("p");
    div.appendChild(display);

    var s_ip = text_input("server ip: ", div);
    div.appendChild(br());
    s_ip.value = get_ip();
    
    var s_port = text_input("server port: ", div);
    div.appendChild(br());
    s_port.value = "8090";

    var oracle_text = text_input("oracle text: ", div);
    div.appendChild(br());
    var oracle_height = text_input("oracle height: ", div);
    div.appendChild(br());
    var source = text_input("source contract (leave blank for veo): ", div);
    div.appendChild(br());
    var source_type = text_input("source subcurrency type (leave blank for veo): ", div);
    div.appendChild(br());

    var button = button_maker2("teach", teach);
    div.appendChild(button);
    
    function teach() {
        var msg = ["add", 2,
                   btoa(oracle_text.value),
                   parseInt(oracle_height.value)];
        //added source and source_type to the p2p server. now we need to use the new api.
        if(!(source.value == "")){
            msg = msg.concat(
                [source.value,
                 parseInt(source_type.value)]);
        };
        console.log(msg);
        rpc.post(msg,
                 function(x){
                     console.log(x);
                     display.innerHTML = "success";
                     return(0);
                 },
                 s_ip.value,
                 parseInt(s_port.value));
    };
    return({
        oracle_text: function(x){oracle_text.value = x},
        oracle_height: function(x){oracle_height.value = x},
        teach: teach
    });
})();
