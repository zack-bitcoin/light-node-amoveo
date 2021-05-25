var simplified_resolve_scalar_contract = (function(){
    var div = document.getElementById("simplified_resolve_scalar_contract");
    var display = document.createElement("p");
    div.appendChild(display);

    var MaxMeasurable = 4294967295;
    
    var cid_input = text_input("contract id: ", div);
    cid_input.value = "dD76riHgEABZxODlZHgy74/3V8In7gk+xoPjUieUB2M=";
//PX/VkaUaTJfHk7VWm0jordTlJ1MTZQJ2jczoyrXf5LY=";
    div.appendChild(br());
    
    var oid_input = text_input("oracle id: ", div);
    oid_input.value = "ue+zjAleNWlqlGABLT5mvQC7Ggk0EiC24AksomSNo0o=";
//f42a/1Q9+y/F9IY6xyjA1ER+38K7tBPPA9KMsrfDnHY=";
    div.appendChild(br());

    var button = button_maker2("resolve", doit);
    div.appendChild(button);
    div.appendChild(br());
    function doit(){
        var cid = cid_input.value;
        var oid = oid_input.value;
        rpc.post(["read", 3, cid], function(contract){
            var oracle_question = atob(contract[1]);
            var max_price = contract[3];
            rpc.post(["oracles", oid], function(oracle){
                var oracle_height = oracle[4];
                var question_hash = oracle[3];
                rpc.post(["oracle", 2, question_hash], function(text){
                    console.log(oracle_question);
                    console.log(atob(text));
                    var is = atob(text).match(/max.0, min.MaxVal, .B . MaxVal . MaxPrice.. is \d*/)[0].match(/\d*$/)[0];
                    var final_price = parseInt(is, 10);
                    final_price = Math.round(is*max_price/MaxMeasurable);
                    return(resolve(
                        oracle_question, oracle_height,
                        max_price, final_price, oid));
                });
            });
        }, get_ip(), 8090);
        return(0);
    }

    /*
    var oracle_height = text_input("oracle height: ", div);
    div.appendChild(br());
    
    var oracle_question = text_input("oracle question: ", div);
    div.appendChild(br());
    var max_price = text_input("max price: ", div);
    div.appendChild(br());
    var final_price = text_input("result price: ", div);
    div.appendChild(br());
    */

    function resolve(Text, Start, MP, FP, oid0){
        console.log(JSON.stringify([MP, FP]));
        console.log(JSON.stringify(Text));
        //var Start = parseInt(oracle_height.value);
        //var Text = oracle_question.value;
        //var MP = parseInt(max_price.value);
        //        var FP = parseInt(final_price.value);
        var FullText =
            scalar_oracle_creation.fulltext(
                //final_price.value,
                FP.toString(),
                MP.toString(),
                //max_price.value,
                Text);
        //console.log("should be");
        //console.log("MaxPrice = 1; MaxVal = 4294967295; B = Zack wins this chess game https://lichess.org/tBeXCWCn from $0 to $MaxPrice; max(0, min(MaxVal, (B * MaxVal / MaxPrice)) is 4294967295");
        console.log("is");
        console.log(FullText);
//        var FullText = scalar_derivative.oracle_text(max_price.value, Text)
//            .concat(final_price.value);
        var oid = id_maker(Start,
                           0,0, FullText);
        if(!(oid === oid0)){
            console.log("OIDs do not match!");
            return(0);
        };
        console.log(Start);
        console.log(FullText);
//        5
// MaxPrice = 5000; MaxVal = 4294967295; B = btc price in USD - 10000 from $0 to $MaxPrice; max(0, min(MaxVal, (B * MaxVal / MaxPrice)) is 3000
        var contract = scalar_derivative.maker(
            Text, MP, Start);
        console.log("resolve scalar contract is ");
        //AgAAAIhNYXhQcmljZSA9IDMwMDA7IE1heFZhbCA9IDQyOTQ5NjcyOTU7IEIgPSBidGMgcHJpY2UgaW4gVVNEIC0gMTAwMDAgZnJvbSAkMCB0byAkTWF4UHJpY2U7IG1heCgwLCBtaW4oTWF4VmFsLCAoQiAqIE1heFZhbCAvIE1heFByaWNlKSkgaXMgAAAAAAVulhk1FzkDMDKPhxQYhhaMOkYUFEcUcHFIbwAAAAABeAAAAAACeBYAAAAAA3iDFIMWFIMWFIMUrIcAAAAAAXmMFYaGAAAAAAJ5AAAAAAN5jDpGFBQCAAAAATBHFJCMhxYUFgIAAAAgZG5qf8R1IqSFsCnQ4QXpxAO/3H2WLW/Hk7q+o0ybcqVxSIYohig7RkcNSI2HFhQCAAAAAQE7RkcNSIQAAAAAA3kWggD/////AAAAAAN5MxaCiIwEA+g="
        //AgAAAIhNYXhQcmljZSA9IDUwMDA7IE1heFZhbCA9IDQyOTQ5NjcyOTU7IEIgPSBidGMgcHJpY2UgaW4gVVNEIC0gMTAwMDAgZnJvbSAkMCB0byAkTWF4UHJpY2U7IG1heCgwLCBtaW4oTWF4VmFsLCAoQiAqIE1heFZhbCAvIE1heFByaWNlKSkgaXMgAAAAAAVulhk1FzkDMDKPhxQYhhaMOkYUFEcUcHFIbwAAAAABeAAAAAACeBYAAAAAA3iDFIMWFIMWFIMUrIcAAAAAAXmMFYaGAAAAAAJ5AAAAAAN5jDpGFBQCAAAAATBHFJCMhxYUFgIAAAAgZG5qf8R1IqSFsCnQ4QXpxAO/3H2WLW/Hk7q+o0ybcqVxSIYohig7RkcNSI2HFhQCAAAAAQE7RkcNSIQAAAAAA3kWggD/////AAAAAAN5MxaCiIwEA+g="
        var CH = scalar_derivative.hash(contract);
        console.log(JSON.stringify(CH));
        //console.log(JSON.stringify([oracle_question.value, parseInt(max_price.value), Start]));
        var cid = binary_derivative.id_maker(CH, 2);
        console.log(JSON.stringify(cid));
        merkle.request_proof("contracts", cid, function(c){
            console.log("contract");
            if(c=="empty"){
                display.innerHTML = "that contract does not exist ".concat(cid);
                return(0);
            };
            merkle.request_proof("oracles", oid, function(oracle){
                console.log("oracle");
                if(oracle == "empty"){
                    display.innerHTML = "oracle does not exist";
                    console.log(oid);
                    return(0);
                };
                /*
                if(oracle[2] == 0){
                    display.innerHTML = "oracle is not yet resolved";
                    console.log(oracle);
                    return(0);
                }
                */
                console.log(JSON.stringify(oracle));
//" int 4294967295 int1 3 / ">>), 
                rpc.post(["account", keys.pub()], function(Acc){
                    var Nonce = Acc[2] + 1;
                    var fee = 152050;

                    var tx0 = ["oracle_close", keys.pub(), Nonce, fee, oid];
                    var stx0 = keys.sign(tx0);

                    var evidence =
                        //string_to_array(atob("AJmZmZk="))
                        ([0])
                        .concat(integer_to_array(Math.round(MaxMeasurable*FP/MP), 4))
                        .concat([0])
                        .concat(integer_to_array(Start, 4));
                    var evidence = btoa(array_to_string(evidence));
                    var tx1 = ["contract_evidence_tx",
                               keys.pub(), Nonce+1, fee*2, contract,
                               cid, evidence,//"AJmZmZk=",
                               [-6, ["oracles", oid]]];
                    console.log(JSON.stringify(tx1));
                    var stx1 = keys.sign(tx1);
                    
                    var tx2 = ["contract_timeout_tx2",
                               keys.pub(), Nonce+2, fee,
                               cid, 0, 0, 0, 0];
                    var stx2 = keys.sign(tx2);
                    console.log(JSON.stringify(tx2));
                    //return(0);
                    post_txs([stx0], function(msg0){
                        display.innerHTML = msg0;
                        post_txs([stx1], function(msg){
                            display.innerHTML = msg0
                                .concat("<br>")
                                .concat(msg);
                            post_txs([stx2], function(msg2){
                                display.innerHTML = msg0
                                    .concat("<br>")
                                    .concat(msg)
                                    .concat("<br>")
                                    .concat(msg2);
                            });
                        });
                    });
                });
            });
        });
    };
    
    return({
        cid: function(x){cid_input.value = x},
        oid: function(x){oid_input.value = x}
    });
})();
