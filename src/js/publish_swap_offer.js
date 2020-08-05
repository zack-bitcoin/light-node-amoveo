var publish_swap_offer = (function() {
    var div = document.getElementById("publish_swap_offer");
    var display = document.createElement("p");
    div.appendChild(display);

    var s_ip = text_input("server ip: ", div);
    div.appendChild(br());
    s_ip.value = get_ip();
    
    var s_port = text_input("server port: ", div);
    div.appendChild(br());

    s_port.value = "8090";

    var offer = text_input("offer: ", div);
    div.appendChild(br());

    var button = button_maker2("publish the offer", publish);
    
    div.appendChild(button);
    div.appendChild(br());

    function publish(){
        var x = JSON.parse(offer.value);
        //console.log(JSON.parse(x));
        console.log(JSON.stringify(x));
        rpc.post(["add", x], function(z)
                 {
                     console.log("should be zero");
                     console.log(z);
                 },
                 s_ip.value, parseInt(s_port.value));
    };

    return({ip: function(x){ s_ip.value = x},
            port: function(x){ s_port.value = x},
            offer: function(x){ offer.value = x}
           });
    
})();
