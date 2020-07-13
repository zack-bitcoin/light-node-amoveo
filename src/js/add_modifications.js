(function add() {
    var div = document.createElement("div");
    div.appendChild(br());
    document.body.appendChild(div);
 //   var status = document.createElement("p");
 //   status.innerHTML = "add offer status: <font color=\"green\">ready</font>";
  //  div.appendChild(status);
 //   div.appendChild(br());
    var contract = text_input("trade: ", div);
    div.appendChild(br());
    //var question_text = text_input("if the oracle does not yet exist, put the question text here: ", div);
    //div.appendChild(br());
    //var expires = text_input("if the oracle does not yet exist, put the height when it becomes possible to trade here: ", div);
    //div.appendChild(br());
    var Button = button_maker2("put the trade on this local page", publish);
    div.appendChild(Button);
    function publish() {
    //    status.innerHTML = "add offer status: <font color=\"red\">failed</font>";
        var c = JSON.parse(contract.value);
        //c = c.concat([[-7,
        //               btoa(question_text.value),
        //               parseInt(expires.value)]]);

       // console.log(contract.value);
        ABC.display_oracles(c);     
        console.log(contract.value);
        rpc.post(["add", c], function(X) {

//l2.slice(1)


     //       status.innerHTML = "add offer status: <font color=\"green\">successfully posted a trade</font>";
        });
    };
})();
