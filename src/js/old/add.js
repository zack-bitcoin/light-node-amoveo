(function add() {
    var div = document.createElement("div");
   // document.body.appendChild(div);
    var status = document.createElement("p");
    status.innerHTML = "add offer status: <font color=\"green\">ready</font>";
 //   div.appendChild(status);
  //  div.appendChild(br());
    var contract = text_input("channel offer: ", div);
 //   div.appendChild(br());
    //var question_text = text_input("if the oracle does not yet exist, put the question text here: ", div);
    //div.appendChild(br());
    //var expires = text_input("if the oracle does not yet exist, put the height when it becomes possible to trade here: ", div);
    //div.appendChild(br());
    var Button = button_maker2("publish the channel offer", publish);
//    div.appendChild(Button);
    function publish() {
        status.innerHTML = "add offer status: <font color=\"red\">failed</font>";
        var c = JSON.parse(contract.value);
        //c = c.concat([[-7,
        //               btoa(question_text.value),
        //               parseInt(expires.value)]]);
        rpc.post(["add", c], function(X) {
            status.innerHTML = "add offer status: <font color=\"green\">successfully posted a trade</font>";
        });
    };
})(); 
