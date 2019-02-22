(function(){
    //interfaces for scalar and binary oracles.
    //OID = api:new_question_oracle(Start, Question).
    //OID = api:new_governance_oracle(GovName, GovAmount).
    //OID = api:new_scalar_oracle(Start, Question, 10).
    //["oracle_new", from, nonce, fee, question, start, id, difficulty, governance, governance_amount] //difficulty unused
    var fee = 152050;
    var div = document.createElement("div");
    document.body.appendChild(div);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    var starts = text_input("starts: ", div);
    div.appendChild(br());
    var question = text_input("question: ", div);
    div.appendChild(br());
    var binary = button_maker2("binary oracle", function(){
        return new_question_oracle(parseInt(starts.value), question.value);
    });
    div.appendChild(binary);
    var scalar = button_maker2("scalar oracle", function(){
        return new_scalar_oracle(parseInt(starts.value), question.value);
    });
    div.appendChild(scalar);
    function new_scalar_oracle(start, question) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            var nonce = acc[2]+1;
            var id = random_cid(32);
            var txs = new_scalar_oracle2(start, question, nonce, id, 10);

            return variable_public_get(["txs", [-6].concat(txs)], function(x) {
                status.innerHTML = "status: <font color=\"green\">successfully attempted to make a scalar oracle with id: ".concat(btoa(id)).concat("</font>");
                return 0;
            //var tx = ["oracle_new", keys.pub(), nonce, fee, btoa(question), start, id, 0, 0, 0];
            });
        });
    };
    function new_scalar_oracle2(start, question, nonce, id, many) {
        if (many == 0) { return 0;}
        var question2 = question.concat(" bit number ").concat((9-many).toString());
        var tx = ["oracle_new", keys.pub(), nonce, fee, btoa(question2), start, btoa(id), 0, 0, 0];
        var stx = keys.sign(tx);
        return ([stx]).concat(new_scalar_oracle2(start, question, nonce+1, next_oid(id), many - 1));
    };
    function new_question_oracle(start, question) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            var nonce = acc[2]+1;
            var id = random_cid(32);
            var tx = ["oracle_new", keys.pub(), nonce, fee, btoa(question), start, btoa(id), 0, 0, 0];
            var stx = keys.sign(tx);
            console.log(JSON.stringify(stx));
            return variable_public_get(["txs", [-6, stx]], function(x) {
                status.innerHTML = "status: <font color=\"green\">successfully attempted to make a binary oracle".concat(btoa(id)).concat("</font>");
                return 0;
            });
        });
    };
    //console.log(JSON.stringify(next_oid(r)));
})();
