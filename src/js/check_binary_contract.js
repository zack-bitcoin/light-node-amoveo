var check_binary_contract = (function(){
    var div = document.getElementById("check_binary_contract");
    var display = document.createElement("p");
    div.appendChild(display);

    var s_ip = text_input("server ip: ", div);
    div.appendChild(br());
    s_ip.value = get_ip();
    
    var s_port = text_input("server port: ", div);
    div.appendChild(br());
    s_port.value = "8090";


    var cid = text_input("contract id: ", div);
    div.appendChild(br());
    var button = button_maker2("lookup", lookup);
    div.appendChild(button);
    function lookup(){
        rpc.post(["read", 3, cid.value], function(z){
            if(z == 0){
                display.innerHTML = "the server does not yet know about that contract";
                return(0);
            };
            console.log(JSON.stringify(z));
            var oracle_text = atob(z[1]);
            var start_height = z[2];
            if(z.length == 5) {
                display.innerHTML = "scalar contract <br> oracle start height: "
                    .concat(start_height)
                    .concat("<br> oracle text: ")
                    .concat(oracle_text)
                    .concat("<br> max price: ")
                    .concat(z[3]);

            } else {
                display.innerHTML = "binary contract <br> oracle start height: "
                    .concat(start_height)
                    .concat("<br> oracle text: ")
                    .concat(oracle_text);
            }
        }, s_ip.value, parseInt(s_port.value));
    };
    return({
        cid: function(x){cid.value = x},
        lookup: lookup
    });
})();
