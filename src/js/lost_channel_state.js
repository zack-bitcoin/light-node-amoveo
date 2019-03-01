(function otc_function() {
    var fee = 152050;
    var div = document.createElement("div");
    document.body.appendChild(div);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    var cid = text_input("channel id: ", div);
    div.appendChild(br());
    var our_balance = text_input("The total veo you will receive from this channel: ", div);
    div.appendChild(br());

})();
