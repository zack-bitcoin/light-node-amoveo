(function(){
    //interfaces for scalar and binary oracles.
    //OID = api:new_question_oracle(Start, Question).
    //OID = api:new_governance_oracle(GovName, GovAmount).
    //OID = api:new_scalar_oracle(Start, Question, 10).
    //["oracle_new", from, nonce, fee, question, start, id, difficulty, governance, governance_amount] //difficulty unused
    function new_scalar_oracle(start, question) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            var nonce = acc[2]+1;
            var id = random_cid(32);
            return new_scalar_oracle2(start, question, nonce, id, 10);
            //var tx = ["oracle_new", keys.pub(), nonce, fee, btoa(question), start, id, 0, 0, 0];
        });
    };
    function new_scalar_oracle2(start, question, nonce, id, many) {
        return 0;
    };
    function new_question_oracle(start, question) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            var nonce = acc[2]+1;
            var id = random_cid(32);
            var tx = ["oracle_new", keys.pub(), nonce, fee, btoa(question), start, id, 0, 0, 0];
            var stx = keys.sign(tx);
            console.log(JSON.stringify(stx));
            return variable_public_get(["txs", [-6, stx]], function(x) {
                return 0;
            });
        });
    };
    //console.log(JSON.stringify(next_oid(r)));
})();
