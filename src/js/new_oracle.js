(function(){
    //interfaces for scalar and binary oracles.
    //OID = api:new_question_oracle(Start, Question).
    //OID = api:new_governance_oracle(GovName, GovAmount).
    //OID = api:new_scalar_oracle(Start, Question, 10).
    //["oracle_new", from, nonce, fee, question, start, id, difficulty, governance, governance_amount] //difficulty unused
    var fee = 152050;
    var div = document.createElement("div");
    document.body.appendChild(div);
    var sb_title = document.createElement("h3");
    sb_title.innerHTML = "scalar/binary oracle";
    div.appendChild(sb_title);
    var explanation = document.createElement("p");
    div.append(explanation);
    explanation.innerHTML = "If you want to make a stablecoin, you need to ask for the price of X in VEO. Asking for the price of VEO in X does not work. Scalar oracles cost as much as 10 binary oracles.";
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"green\">ready</font>";
    div.appendChild(status);
    var starts = text_input("the result that this oracle should have will be knowable by block height: ", div);
    glossary.link(div, "oracle_starts");
    div.appendChild(br());
    var question = text_input("question: ", div);
    glossary.link(div, "oracle_question");
    div.appendChild(br());
    var binary = button_maker2("binary oracle", function(){
        return new_question_oracle(parseInt(starts.value), question.value);
    });
    div.appendChild(binary);
    glossary.link(div, "binary_oracle");
    div.appendChild(br());
    var scalar = button_maker2("scalar oracle", function(){
        return new_scalar_oracle(parseInt(starts.value), question.value, 1, function(){return 0;});
    });
    div.appendChild(scalar);
    glossary.link(div, "scalar_oracle");
    div.appendChild(br());
    var amoveo_futarchy_title = document.createElement("h3");
    amoveo_futarchy_title.innerHTML = "amoveo governance futarchy oracle";
    div.appendChild(amoveo_futarchy_title);
    div.appendChild(br());
    var futarchy_starts = text_input("futarchy outcome is decided by block: ", div);
    div.appendChild(br());
    var futarchy_bets_resolve = text_input("measure impact of futarchy decision on price at block: ", div);
    div.appendChild(br());
    var futarchy_price = text_input("the price of VEO in USD half-way between where it would be if we make each of the alternative futarchy decisions:", div);
    div.appendChild(br());
    var futarchy_goal = text_input("the futarchy decision being made. example: 'the block reward is more than 0.1 veo'", div);
    div.appendChild(br());
    var futarchy_button = button_maker2("amoveo governance futarchy oracle", governance_futarchy_oracle);
    div.appendChild(futarchy_button);
    div.appendChild(br());
    
    function governance_futarchy_oracle() {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            var nonce = acc[2]+1;
            //var id = random_cid(32);
            var start = parseInt(futarchy_bets_resolve.value);
            var fs = parseInt(futarchy_starts.value);
            var fg = futarchy_goal.value;
            var p = Math.floor((1 / parseFloat(futarchy_price.value)) * token_units());
            var p2 = p*2;
            //if the block reward on 21 July at noon GMT is above 0.15 return 'bad', else { A = the price of USD in VEO from 0 to 0.3 on 21 July at noon GMT; B = the price of USD in Veo from 0 to 0.3 on 21 August at noon GMT; return ((0.15 - A + B) * 1024 / 0.3)}
            var common = ", else { A = the price of USD in VEO-satoshis from 0 to ".concat(p2.toString()).concat(" at block ").concat(fs.toString()).concat("; B = the price of USD in VEO-satoshis from 0 to ").concat(p2.toString()).concat(" at block ").concat(start.toString()).concat("; return ((").concat(p.toString()).concat(" - A + B) * 1024 / ").concat(p2.toString()).concat(")}");
            var question1 = "if ".concat(fg).concat(" return 'bad'").concat(common);
            var question2 = "if it is not the case that ".concat(fg).concat(" return 'bad'").concat(common);;
            console.log(start);
            new_scalar_oracle(start, question1, 1, function(){
                return new_scalar_oracle(start, question2, 11, function(){return 0;});
            })
        });
    };

    function new_scalar_oracle(start, question, n, callback) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            
            var id = id_maker(start, 0, 0, question);
            var nonce = acc[2]+n;
            var ks = scalar_keys(id, start).reverse();
            console.log(question);
            var txs = new_scalar_oracle2(question, start, ks, nonce, id, 9);
            console.log(JSON.stringify(txs));

            return variable_public_get(["txs", [-6].concat(txs)], function(x) {
                status.innerHTML = "status: <font color=\"green\">successfully attempted to make a scalar oracle with id: ".concat(id).concat("</font>");
                return callback();
            });
        });
    };
    function new_scalar_oracle2(question, start, ks, nonce, id, many) {
        if (ks.length == 0) {return [];}
        //var x2;
        var s;
        if (many == 0) {
            s = question;
            x2 = id;
        } else {
            s = question_maker(id, many);
            console.log("question maker");
            console.log(JSON.stringify(s));
            x2 = id_maker(start, 0, 0, s);
        }
        var x = ks[0];

        if (!(x == x2)) {
            console.log(btoa(x));
            console.log(btoa(x2));
            console.log("fail");
            return 0;
        }

        var tx = ["oracle_new", keys.pub(), nonce, fee, btoa(s), start, x, 0, 0, 0];
        console.log(tx);
        var stx = keys.sign(tx);
        return ([stx]).concat(new_scalar_oracle2(question, start, ks.slice(1), nonce+1, id, many-1));
    }
    function new_question_oracle(start, question) {
        merkle.request_proof("accounts", keys.pub(), function (acc) {
            var nonce = acc[2]+1;
            //var id = random_cid(32);
            var id = id_maker(start, 0, 0, question);
            var tx = ["oracle_new", keys.pub(), nonce, fee, btoa(question), start, id, 0, 0, 0];
            var stx = keys.sign(tx);
            console.log(JSON.stringify(stx));
            return variable_public_get(["txs", [-6, stx]], function(x) {
                status.innerHTML = "status: <font color=\"green\">successfully attempted to make a binary oracle with OID: ".concat(id).concat("</font>");
                return 0;
            });
        });
    };
    //console.log(JSON.stringify(next_oid(r)));
    })();
