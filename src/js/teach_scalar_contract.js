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
    var oracle_height = text_input("oracle height, an integer: ", div);
    div.appendChild(br());
    var max_val = text_input("maximum value that can be measured, an integer: ", div);
    div.appendChild(br());
    var button = button_maker2("teach", teach);
    div.appendChild(button);
    function teach() {
        rpc.post(["add", 3,
                  btoa(oracle_text.value),
                  parseInt(oracle_height.value),
                  parseInt(max_val.value)
                 ],
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
        max_val: function(x){max_val.value = x},
        teach: teach
    });
})();
