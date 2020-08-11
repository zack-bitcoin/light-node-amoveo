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
        var cid1 = x[1][6];
        //console.log([cid1, cid2]);
        //rpc.post(["read", 3, cid], function(r) {
        //   console.log(r);
        var zero = btoa(array_to_string(integer_to_array(0,32)));
        if(!(cid1 == zero)){
            rpc.post(["read", 3, cid1], function(first){
                console.log(first);
                console.log(cid1);
                if(first == 0){
                    display.innerHTML = "contract "
                        .concat(cid1)
                        .concat(" is unknown to the server");
                    return(0);
                } else {
                    return(publish2(zero, x));
                }
            }, s_ip.value, parseInt(s_port.value));
        } else {
            return(publish2(zero, x));
        };
    };
    function publish2(zero, x) {
        var cid2 = x[1][9];
        if(!(cid2 == zero)){
            rpc.post(["read", 3, cid2], function(second){
                console.log(second);
                console.log(cid2);
                if(second == 0) {
                    display.innerHTML = "contract "
                        .concat(cid2)
                        .concat(" is unknown to the server");
                    return(0);
                } else {
                    return(publish3(x));
                }
            }, s_ip.value, parseInt(s_port.value));
        } else {
            return(publish3(x));
        }
    };
    function publish3(x){
        rpc.post(["add", x], function(z)
                 {
                     display.innerHTML = "successfully sent the swap offer to the server.";
                 },
                 s_ip.value,
                 parseInt(s_port.value));
    };

    return({ip: function(x){ s_ip.value = x},
            port: function(x){ s_port.value = x},
            offer: function(x){ offer.value = x},
            publish: publish
           });
    
})();
