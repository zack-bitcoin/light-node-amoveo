var resolve_scalar_contract = (function(){
    var div = document.getElementById("resolve_scalar_contract");
    var display = document.createElement("p");
    div.appendChild(display);

    var oracle_height = text_input("oracle height: ", div);
    div.appendChild(br());
    
    var oracle_question = text_input("oracle question: ", div);
    div.appendChild(br());
    var max_price = text_input("max price: ", div);
    div.appendChild(br());
    var final_price = text_input("result price: ", div);
    div.appendChild(br());

    var button = button_maker2("resolve", resolve);
    div.appendChild(button);
    div.appendChild(br());

    function resolve(){
        var Start = parseInt(oracle_height.value);
        var Text = oracle_question.value;
        var MP = parseInt(max_price.value);
        //        var FP = parseInt(final_price.value);
        var FullText =
            scalar_oracle_creation.fulltext(
                final_price.value,
                max_price.value,
                oracle_question.value);
//        var FullText = scalar_derivative.oracle_text(max_price.value, Text)
//            .concat(final_price.value);
        var oid = id_maker(Start,
                           0,0, FullText);
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
        console.log(JSON.stringify([oracle_question.value, parseInt(max_price.value), parseInt(oracle_height.value)]));
        var cid = binary_derivative.id_maker(CH, 2);
        merkle.request_proof("contracts", cid, function(c){
            if(c=="empty"){
                display.innerHTML = "that contract does not exist ".concat(cid);
                return(0);
            };
            merkle.request_proof("oracles", oid, function(oracle){
                if(oracle == "empty"){
                    display.innerHTML = "oracle does not exist";
                    console.log(oid);
                    return(0);
                };
                if(oracle[2] == 0){
                    display.innerHTML = "oracle is not yet resolved";
                    console.log(oracle);
                    return(0);
                }
                console.log(JSON.stringify(oracle));
//" int 4294967295 int1 3 / ">>), 
                merkle.request_proof("accounts", keys.pub(), function(Acc){
                    var Nonce = Acc[2] + 1;
                    var fee = 152050;
                    var tx1 = ["contract_evidence_tx",
                               keys.pub(), Nonce, fee, contract,
                               cid, "AJmZmZk=",
                               [-6, ["oracles", oid]]];
                    console.log(JSON.stringify(tx1));
                    var stx1 = keys.sign(tx1);
                    
                    var tx2 = ["contract_timeout_tx",
                               keys.pub(), Nonce+1, fee,
                               cid, 0, 0, 0];
                    var stx2 = keys.sign(tx2);
                    post_txs([stx1], function(msg){
                        display.innerHTML = msg;
                        post_txs([stx2], function(msg2){
                            display.innerHTML = msg
                                .concat("<br>")
                                .concat(msg2);
                        });
                    });
                });
            });
        });
    };

    return({
        height: function(x){oracle_height.value = x},
        oracle: function(x){oracle_question.value = x},
        price: function(x){max_price.value = x},
        final_price: function(x){final_price.value = x},
        resolve: resolve
    });
})();
