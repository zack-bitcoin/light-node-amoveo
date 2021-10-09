function br() {
    return document.createElement("br");
};
function button_maker2(val, fun) {
    var button = document.createElement("input");
    button.type = "button";
    button.value = val;
    button.onclick = fun;
    return button;
};
function text(a) {
    var x2 = document.createElement("h8");
    x2.innerHTML = a;
    return x2;
};
function text_input(query, div) {
    var x = document.createElement("INPUT");
    x.type = "text";
    var q = text(query);
    div.appendChild(q);
    div.appendChild(x);
    return x;
};
function token_units() { return 100000000 }; // VEO
function s2c(x) { return x / token_units(); }
function c2s(x) {
    return Math.floor(parseFloat(x.value, 10) * token_units());
}
/*
function oracle_limit(oid, callback) {
    return rpc.post(["oracle", oid], function(x) {
        console.log(atob(x[1][4]));
        var question = atob(x[1][4]);
        //console.log(question);
        //measured_upper.value = (largest_number(question, 0, 0)).toString();
        return callback(oracle_limit_grabber(question));
    });
    function oracle_limit_grabber(question) {
        //console.log("oracle limit grabber");
        if (question.length < 4) {
            return "";
        }
        var f = question.slice(0, 4);
        if (f == "from") {
            return olg2(question.slice(4));
        }
        return oracle_limit_grabber(question.slice(1));
    }
    function olg2(question) {
        //console.log("olg2");
        //console.log(question);
        if (question.length < 2) {
            return "";
        }
        var f = question.slice(0, 2);
        if (f == "to") {
            //console.log("calling olg3 ");
            return olg3(question.slice(2), "");
        }
        return olg2(question.slice(1));
    }
    function olg3(question, n) {
        //console.log(n);
        if (question.length < 1) { return n; }
        var l = question[0];
        if (((l >= "0") && (l <= "9")) || (l == ".")) {
            var n2 = n.concat(l);
            return olg3(question.slice(1), n2);
        } else if (n == "") {
            return olg3(question.slice(1), n);
        } else {
            return n;
        }
    };
};
*/
