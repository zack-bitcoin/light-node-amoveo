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
        var cid1 = x[1][6];
        var zero = btoa(array_to_string(integer_to_array(0,32)));
        if(!(cid1 == zero)){
            console.log("about to post");
            rpc.post(["read", 3, cid1], function(first){
            console.log("just posted");
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
        var second_offer = 0;
        if(!(cid2 == zero)){
            console.log("about to post");
            rpc.post(["read", 3, cid2], function(second){
            console.log("just posted");
                if(second == 0) {
                    display.innerHTML = "contract "
                        .concat(cid2)
                        .concat(" is unknown to the server");
                    return(0);
                } else {
                    if(second[0] == "binary"){
                        var f = swaps.unpack(x);
                        var C = {
                            acc1: keys.pub(),
                            end_limit: 9999999999,
                            amount1: f.amount2,
                            cid1: f.cid2,
                            type1: f.type2,
                            amount2: Math.floor(f.amount2 * 0.99),
                            fee1: 200000,
                            nonce: f.nonce
                        };
                        second_offer = swaps.pack(C);
                    };
                    return(publish3(x, second_offer));
                }
            }, s_ip.value, parseInt(s_port.value));
        } else {
            return(publish3(x, 0));
        }
    };
    function publish3(x, second_offer){
        rpc.post(["add", x, second_offer], function(z)
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
