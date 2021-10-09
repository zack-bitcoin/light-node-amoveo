var simplified_resolve_scalar_contract = (function(){
    var div = document.getElementById("simplified_resolve_scalar_contract");
    var display = document.createElement("p");
    div.appendChild(display);

    var MaxMeasurable = 4294967295;
    
    var cid_input = text_input("contract id: ", div);
    cid_input.value = "dD76riHgEABZxODlZHgy74/3V8In7gk+xoPjUieUB2M=";
    div.appendChild(br());
    
    var oid_input = text_input("oracle id: ", div);
    oid_input.value = "ue+zjAleNWlqlGABLT5mvQC7Ggk0EiC24AksomSNo0o=";
    div.appendChild(br());

    var button = button_maker2("resolve", doit);
    div.appendChild(button);
    div.appendChild(br());
    async function doit(){
        var cid = cid_input.value;
        var oid = oid_input.value;
        var contract = await rpc.apost(["read", 3, cid], get_ip(), 8090);
        var oracle_question = atob(contract[1]);
        var max_price = contract[3];
        var oracle = await rpc.apost(["oracles", oid]);
        var oracle_height = oracle[4];
        var question_hash = oracle[3];
        var text = await rpc.apost(["oracle", 2, question_hash]);
        console.log(oracle_question);
        console.log(atob(text));
        var is = atob(text).match(/max.0, min.MaxVal, .B . MaxVal . MaxPrice.. is \d*/)[0].match(/\d*$/)[0];
        var final_price = parseInt(is, 10);
        final_price = Math.round(is*max_price/MaxMeasurable);
        return(resolve(
            oracle_question, oracle_height,
            max_price, final_price, oid));
        return(0);
    }
    async function resolve(Text, Start, MP, FP, oid0){
        var FullText =
            scalar_oracle_creation.fulltext(
                FP.toString(),
                MP.toString(),
                Text);
        var oid = id_maker(Start,
                           0,0, FullText);
        if(!(oid === oid0)){
            console.log("OIDs do not match!");
            return(0);
        };
        var contract = scalar_derivative.maker(
            Text, MP, Start);
        var CH = scalar_derivative.hash(contract);
        var cid = merkle.contract_id_maker(CH, 2);
        var c = await merkle.arequest_proof("contracts", cid);
        if(c=="empty"){
            display.innerHTML = "that contract does not exist ".concat(cid);
            return(0);
        };
        var oracle = await merkle.arequest_proof("oracles", oid);
        if(oracle == "empty"){
            display.innerHTML = "oracle does not exist";
            console.log(oid);
            return(0);
            };
        var Acc = await rpc.apost(["account", keys.pub()]);
        var Nonce = Acc[2] + 1;
        var fee = 152050;
        var tx0 = ["oracle_close", keys.pub(), Nonce, fee, oid];
        var stx0 = keys.sign(tx0);
        var evidence =
            ([0])
            .concat(integer_to_array(Math.round(MaxMeasurable*FP/MP), 4))
            .concat([0])
            .concat(integer_to_array(Start, 4));
        var evidence = btoa(array_to_string(evidence));
        var tx1 = ["contract_evidence_tx",
                   keys.pub(), Nonce+1, fee*2, contract,
                   cid, evidence,//"AJmZmZk=",
                   [-6, ["oracles", oid]]];
        var stx1 = keys.sign(tx1);
        var tx2 = ["contract_timeout_tx2",
                   keys.pub(), Nonce+2, fee,
                   cid, 0, 0, 0, 0];
        var stx2 = keys.sign(tx2);
        var msg0 = await apost_txs([stx0]);
        display.innerHTML = msg0;
        var msg = await apost_txs([stx1]);
        display.innerHTML = msg0
            .concat("<br>")
            .concat(msg);
        var msg2 = await apost_txs([stx2]);
        display.innerHTML = msg0
            .concat("<br>")
            .concat(msg)
            .concat("<br>")
            .concat(msg2);
    };
    return({
        cid: function(x){cid_input.value = x},
        oid: function(x){oid_input.value = x}
    });
})();
