(function() {
    var refresh_channels_button = button_maker2("refresh channels interfaces. Useful if you swich channel servers", function() {
        variable_public_get(["pubkey"], function(pubkey) {
            channels_object.load_button.onchange = function() {return channels_object.load_channels(pubkey) };
            return channels_object.refresh(pubkey);
        });
    });
    var div = document.createElement("div");
    document.body.appendChild(div);
    div.appendChild(refresh_channels_button);
})();
