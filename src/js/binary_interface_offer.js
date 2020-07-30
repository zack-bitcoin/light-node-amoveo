
var binary_interface_offer = (function(){

    var div = document.getElementById("binary_derivatives");

    var display = document.createElement("p");
    div.appendChild(display);
    
    function test(){
        var p = document.createElement("div");
        p.innerHTML = "hello";
        div.appendChild(p);
    };

    var full = btoa(array_to_string([255,255,255,255]));
    var empty = btoa(array_to_string([0,0,0,0]));

    var amount1 = text_input("how much you bet: ", div);
//    amount1.value = "1";
    var amount2 = text_input("how much they bet: ", div);
    //amount2.value = "1";
    div.appendChild(br());
    var timelimit = text_input("how long until this offer is invalid? in blocks: ", div);
    //timelimit.value = "2";
    div.appendChild(br());
    var oracle_start_height = text_input("when it becomes possible to report on the outcome of the oracle question. a block height: ", div);
    //oracle_start_height.value = "10";
    div.appendChild(br());
    var oracle_text = text_input("the question we ask the oracle", div);
    //oracle_text.value = "1=1";
    div.appendChild(br());
    var direction = text_input("you win if the outcome is", div);
    //direction.value = "true";
    div.appendChild(br());

    var make_offer_button = button_maker2("make offer", make_offer);
    div.appendChild(make_offer_button);
    function make_offer(){
        rpc.post(["account", keys.pub()], function(my_acc){
            if(my_acc == 0) {
                display.innerHTML = "you don't have an account loaded";
                return(0);
            };
            var now = headers_object.top()[1];
            var Amount1 = parseInt(amount1.value);
            var Amount2 = parseInt(amount2.value);
            var TimeLimit = parseInt(timelimit.value);
                //how long until your trade offer is not valid, in blocks
            var OracleStartHeight = parseInt(oracle_start_height.value);
            var OracleText = oracle_text.value;
            var Direction;
            if(direction.value == "true"){
                Direction = 1;
            }else if(direction.value == "false"){
                Direction = 2;
            }
            var C = {
                oracle_start_height: OracleStartHeight,
                oracle_text: OracleText,
                from: keys.pub(),
                nonce: my_acc[2] + 1,
                start_limit: now - 1,
                end_limit: now + TimeLimit,
                source_id: btoa(array_to_string(integer_to_array(0, 32))),
                source_type: 0,
                amount1: Amount1,
                amount2: Amount2,
                fee1: 200000,
                fee2: 200000
            };
            if(Direction == 1){
                C.subs1 = [-6, full, empty];
                C.subs2 = [-6, empty, full];
            }else if(Direction == 2){
                C.subs1 = [-6,empty, full];
                C.subs2 = [-6, full, empty];
            };
            var Packed = contracts.pack_binary(C);
            display.innerHTML = JSON.stringify(Packed);
        });

    };
    return({
        amount1: function(x){ amount1.value = x},
        amount2: function(x){ amount2.value = x},
        timelimit: function(x){ timelimit.value = x},
        oracle_start_height: function(x){ oracle_start_height.value = x},
        oracle_text: function(x){ oracle_text.value = x},
        direction: function(x){ direction.value = x},
    });
})();
