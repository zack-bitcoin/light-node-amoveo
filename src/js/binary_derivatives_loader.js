(function(){
    var div = document.getElementById("loader");
    
    var display = document.createElement("p");
    div.appendChild(br());
    div.appendChild(display);
    div.appendChild(br());

    var offer = text_input("put the offer here: ", div);
    div.appendChild(br());
    var button = button_maker2("load offer", load_offer);
    div.appendChild(button);
    var accept_button =
        button_maker2("accept offer",
                      function(){
                          display.innerHTML = "load an offer before you can accept it.";
                      });
    div.appendChild(accept_button);
    div.appendChild(br());
    div.appendChild(br());

    function load_offer(){
        var X = JSON.parse(offer.value);
        var Y = contracts.unpack_binary(X);
        console.log(Y);
        display.innerHTML = JSON.stringify(Y);//TODO, display the details of the trade more nicely.
        accept_button.onclick = function(){
            console.log("sign and publish TODO");
        };
    };
    
})();
