/*
  The chalang just in time compiler.
  This program does pattern matching on chalang programs to generate a contract that has identical function, but uses less gas and bytes.
*/

var chalang_jit = (function(){
    var ops = chalang_compiler.ops;
    var commutative_op = /[/+/*(==)(=2)(and)(or)(xor)(band)(bor)(bxor)]/g;
    var gain1_op = /[(true)(false)(r>)(r@)(height)(nil)]/g;
    var lose1_op = /[(>r)]/g;
    var change1_op = /[(hash)(not)@(car)(cdr)(reverse)]/g;
    var change2_op = /[(swap)(car@)(split)]/g;
    var combine2_op = /[-//<>(rem)(cons)(/+/+)/+/*(=2)(and)(or)(xor)(band)(bor)(bxor)]/g;
    //var arithmetic_op = /[\+\*(==)(=2)\/(rem)(and)(or)]/g;
    function op_to_ints(op) {
        if(!(isNaN(op))){
            return([0, 1]);
        } else if(op.match(/\d+/g)){
            return([0, 1]);
        } else if(op.match(commutative_op)){
            return([2, 1]);
        } else if(op.match(gain1_op)){
            return([0, 1]);
        } else if(op.match(lose1_op)){
            return([1, 0]);
        } else if(op.match(change1_op)){
            return([1, 1]);
        } else if(op.match(change2_op)){
            return([2, 2]);
        } else if(op.match(combine2_op)){
            return([2, 1]);
        } else {
            console.log("unknown op cannot be converted to ints format");
            console.log(op);
            return("error");
        };
    };
    function ops_to_ints(x, a, b) {
        if(!(a)){ a = 0};
        if(!(b)){ b = 0};
        for(var i = 0; i<x.length; i++){
            var d = op_to_ints(x[i]);
            var a1 = d[0];
            var b1 = d[1];
            var c = b - a1;
            if(c > -1){
                b = b1 + c;
            } else {
                a = a - c;
            };
        };
        return([a, b]);
    };
    function sorted_op(op) {
        return((!(isNaN(op))) ||
               (op.match(commutative_op)) ||
               (op.match(gain1_op)) ||
               (op.match(lose1_op)) ||
               (op.match(change1_op)) ||
               (op.match(change2_op)) ||
               (op.match(combine2_op)));
    };
    function cancel_ops(page) {
        //common combinations of opcodes that cancel to nothing
        page = page.replace(/\brot\s+tuck\b/g, "");
        page = page.replace(/\btuck\s+rot\b/g, "");
        page = page.replace(/\bswap\s+swap\b/g, "");
        page = page.replace(/\bdup\s+drop\b/g, "");
        page = page.replace(/\b>r\s+r>\b/g, "");
        page = page.replace(/\br>\s+>r\b/g, "");
        page = page.replace(/\bnop\b/g, " ");
        page = page.replace(
                /\bswap\s+\S+/g,
            function(s0) {
                var s = s0.match(/[^\s]+/g);
                if(s[1].match(commutative_op)){
                    return(s[1]);
                } else {
                    return(s0);
                }
            });
        page = page.replace(
                /((tuck)|(rot))\s+\S+\s+\S+/g,
            function(s0) {
                var s = s0.match(/[^\s]+/g);
                if((s[1] === s[2]) &&
                   (s[1].match(commutative_op))){
                    return(s.slice(1).join(" "));
                } else {
                    return(s);
                };
            });
        return(page);
    };
    function var_reuse_optimization(page){
        /*
        page = page.replace(
          /r@\s+@\s+r@\s+@\s+r@\s+@/g,
            "r@ @ dup dup");
        page = page.replace(
          /r@\s+@\s+r@\s+@/g,
            "r@ @ dup");
        */
        page = page.replace(
          /\br@\s+\S+\s+\+\s+@\s+r@\s+\S+\s+\+\s+@\s+r@\s+\S+\s+\+\s+@\b/g,
            function(s){
                var words = page.match(/\S+/g);
                var n1 = words[1];
                var n2 = words[5];
                var n3 = words[9];
                if((n1 === n2) && (n1 === n3)){
                    return("r@ "
                           .concat(n1)
                           .concat(" + @ dup dup"));
                } else {
                    return(s);
                };
            });
        page = page.replace(
          /\br@\s+\S+\s+\+\s+@\s+r@\s+\S+\s+\+\s+@\b/g,
            function(s){
                var words = page.match(/\S+/g);
                var n1 = words[1];
                var n2 = words[5];
                if((n1 === n2)){
                    return("r@ "
                           .concat(n1)
                           .concat(" + @ dup"));
                } else {
                    return(s);
                };
            });
        return(page);
    };
    function car_cdr_optimizations(page){
        page = page.replace(
          /\br@\s+\S+\s+\+\s+@\s+\S+\s+r@\s+\S+\+\s+@\s+\S+/g,
            function(s){
                var words = page.match(/\S+/g);
                var n1 = words[1];
                var n2 = words[6];
                var op1 = words[4];
                var op2 = words[9];
                if(!(n1 === n2)){
                    return(page);
                } else if((op1 === "car") &&
                          (op2 === "cdr")){
                    return("r@ "
                           .concat(n1)
                           .concat(" + @ car@"));
                } else if ((op1 === "cdr") &&
                           (op2 === "car")){
                    return("r@ "
                           .concat(n1)
                           .concat(" + @ car@ swap"));
                } else if ((op1 === op2) &&
                           (op1.match(change1_op))){
                    return("r@ "
                           .concat(n1)
                           .concat(" + @ ")
                           .concat(op1)
                           .concat(" dup"));
                } else {
                    return(page);
                };
            });
        return(page);
    };
    function r_optimizations(page){
        page = page.replace(/>r\s+r@/g, "dup >r");
        var words = page.match(/\S+/g);
        var words2 = [];
        for(var i = 0; i < words.length; i++){
            if(words[i] === ">r"){
                var a = fromr_drop_split(
                    words.slice(i), 0);
                var t1 = a[0];
                var t2 = a[1];
                if(t2.length < 1){
                    
                } else if(used_r(t2)){
                    words2 = words2.concat(["drop"]);
                } else {
                    words2 = words2.concat([">r"]);
                };
            } else {
                words2 = words2.concat([words[i]]);
            }
        };
        page = words2.join(" ");
        return(page);
    };
    function r_tail_optimizations(page){
        //move variable load right, to increase the odds tha we can combine it with the read
        page = page.replace(
          /\br@\s+\S+\+\s+!\s+drop\b/g,
            function(s){
                var words = s.match(/\S+/g);
                var p = words[1];
                return("swap drop r@ "
                       .concat(p)
                       .concat(" + !"));
            });
        return(page);
    };
    function tail_call_optimizations(page){
        page = page.replace(
          /\S+\s+@\s+r@\s+\d+\s+\+\s+>r\s+call\s+r>\s+drop[\s\S]*/g,
            function(s){
                var words = s.match(/\S+/g);
                var t = words.slice(9);
                if(used_r(t, 0)){
                    var index = page.indexOf(" ");
                    var rest = page.slice(index+1);
                    return(words[0]
                           .concat(" ")
                           .concat(tail_call_optimizations(rest)));
                } else {
                    return(words[0]
                           .concat(" @ call ")
                           .concat(tail_call_optimizations(t.join(" "))));
                };
            });
        page = page.replace(
          /\bcall\s+r>\s+drop\s+\S+@\s+r@\s+>r\b/g,
            function(s){
                var words = s.match(/\S+/g);
                var n = words[3];
                return("call "
                       .concat(n)
                       .concat(" @"));
            });
        return(page);
    }
    var a_ops = {
        "+": function(a, b){ return(a+b)},
        "-": function(a, b){ return(a-b)},
        "*": function(a, b){ return(a*b)},
        "/": function(a, b){ return(a/b)},
        "rem": function(a, b){ return(a%b)},
        "and": function(a, b){
            if(a === 0){
                return(0);
            } else if (b === 0) {
                return(0);
            } else {
                return(1);
            }
        },
        "or": function(a, b){
            if((a === 0) &&
               (b === 0)){
                return(0);
            } else {
                return(1);
            };
        }
    };
    function used_pth(words, p, n){
        if(words.length < 1){
            return(false);
        };
        var w = words[0];
        var w2 = words.slice(0, 2);
        var w4 = words.slice(0, 4);
        if(w === ";"){
            return(false);
        } else if (w === "def"){
            return(used_pth(skip_to(";", words),
                            p,
                            n));
        } else if(JSON.stringify(w4) ===
                  JSON.stringify([p,"r@","+","!"])){
            return(false);
        } else if(JSON.stringify(w4) ===
                  JSON.stringify([p,"r@","+","@"])){
            return(true);
        } else if(JSON.stringify(w2) ===
                  JSON.stringify(["r@", "!"])){
            return(false);
        } else if(JSON.stringify(w2) ===
                  JSON.stringify(["r@", "@"])){
            return(true);
        } else if(w === "if"){
            var i = words.findIndex(
                function(x){
                    return(x === "else");
                });
            if(i === -1){
                console.log("badly formed if statement");
                return("error");
            };
            var before = words.slice(0, i-1);
            var after = words.slice(i);
            var b = used_pth(before, p, n);
            return(b || used_pth(after, p, n));
        } else if((w === "r@") &&
                  (n === 0)){
            return(true);
        } else if((w === "r>") &&
                  (words[1] === "drop") &&
                  (n === 0)){
            return(false);
        } else if((w === "r>") &&
                  (n === 0)){
            return(true);
        } else if((w === "r>")){
            return(used_pth(words.slice(1), p, n-1));
        } else if(w === ">r"){
            return(used_pth(words.slice(1), p, n+1));
        } else {
            return(used_pth(words.slice(1), p, n));
        };
    };
    function r_combinator(words) {
        var c = ops_to_ints(words);
        var a = c[0];
        var b = c[1];
        return(r_combinator_helper(words, a, b));
    };
    function r_combinator_helper(L, M, N) {
        var before = [];
        var after = [];
        if(M === 1){
            before = ["swap"];
        } else if(M === 2){
            before = ["tuck"];
        } else if(!(M === 0)){
            console.log("bad r combinator helper");
            return("error");
        };
        if(N === 1){
            after = ["swap"];
        } else if (N === 2){
            after = ["rot"];
        } else if (!(N == 0)){
            console.log("bad r combinator helper 2");
            return("error");
        };
        return(before.concat(L).concat(after));
    }
    function hardcoded_arithmetic(page){
        page = page.replace(/\b0\s+\+\b/g, "");//adding 0
        page = page.replace(/\b1\s+\*\b/g, "");//multiplying by 1
        page = page.replace(
                /\d+\s+\d+\s+\S+/g,
            function(s0){
                var s = s0.match(/\S+/g);
                var a_op = s[2];
                if(a_ops[a_op]){
                    var d1 = parseInt(s[0]);
                    var d2 = parseInt(s[1]);
                    var d3 = a_ops[a_op](d1, d2);
                    return(d3.toString());
                } else {
                    return(s0);
                }
            });
        page = page.replace(
                /\d+\s+dup\s+\S+/g,
            function(s0){
                var s = s0.match(/\S+/g);
                var a_op = s[2];
                if(a_ops[a_op]){
                    var d1 = parseInt(s[0]);
                    var d3 = a_ops[a_op](d1, d1);
                    return(d3.toString());
                } else {
                    return(s0);
                }
            });
        return(page);
    };
    function used_r(page, n){
        var words = page.match(/\S+/g);
        return(used_r2(words, n));
    }
    function used_r2(words, n){
        if(words.length < 1){
            return(false);
        };
        var w = words[0];
        if(w === ";"){
            return(false);
        } else if(w === "if"){
            return(used_r2(skip_to("else", words), n));
        } else if(w === "else"){
            return(used_r2(skip_to("then", words), n));
        } else if((w === "r@")&&(n === 0)){
            return(true);
        } else if((w === "r>")&&(words[1] === "drop")){
            return(false);
        } else if((w === "r>")&&(n === 0)){
            return(true);
        } else if(w === "r>"){
            return(used_r2(words.slice(1), n-1));
        } else if(w === ">r"){
            return(used_r2(words.slice(1), n+1));
        } else {
            return(used_r2(words.slice(1), n));
        };
    };
    function skip_to(x, words){
        var t = words.slice(1);
        if(words.length < 1){
            return([]);
        } else if(words[0] === x){
            return(t);
        } else {
            return(skip_to_then(t));
        };
    };
    function fromr_drop_split(words, n){
        var m = words.length;
        for(var i = 0; i<m; i++){
            if(n<0){
                console.log("r underflow");
                return("error");
            }else if((words.length-i) < 2){
                //console.log("fromr drop split no fromrdrop");
                //return("error");
                return([words, []]);
            } else if ((words[i] === "r>")&&
                       (words[i+1] === "drop")&&
                       (n === 0)){
                return([words.slice(0, i), words.slice(i+2)]);
            } else if (words[i] === "r>") {
                n -= 1;
            } else if (words[i] === ">r") {
                n += 1;
            };
        };
        console.log("fromr drop split unknown error 2");
        return("error");
    };
    function constants_right_optimization(page){
        //constant and variable
        page = page.replace(
                /\d+\s+r@\s+\S+\+\s+@\S+/g,
            function(s){
                var words = page.match(/\S+/g);
                var n = words[0];
                var m = words[2];
                var f = words[5];
                if(f.match(commutative_op)){
                    return("r@ "
                           .concat(m)
                           .concat(" + @ ")
                           .concat(n)
                           .concat(" ")
                           .concat(f));
                } else {
                    return(s);
                };
            });
        //two variables
        page = page.replace(
                /\br@\s+\S+\s+\+\s+@\s+r@\s+\S+\s+\+@\S+/g,
            function(s){
                var words = page.match(/\S+/g);
                var n = words[1];
                var m = words[5];
                var f = words[8];
                if(m > n){
                    return("r@ "
                           .concat(m)
                           .concat(" + @ r@ ")
                           .concat(n)
                           .concat(" + @ ")
                           .concat(f));
                } else {
                    return(s);
                };
            });
        return(page);
    };

    function doit(page){
        page = cancel_ops(page);
        page = r_optimizations(page);
        page = r_tail_optimizations(page);
        page = tail_call_optimizations(page);
        page = car_cdr_optimizations(page);
        page = var_reuse_optimization(page);
        page = constants_right_optimization(page);
        
        page = hardcoded_arithmetic(page);
        return(page);
    };
    function test(){
        console.log("5 5 +".match(commutative_op));
        console.log("5".match(commutative_op));
        console.log("+".match(commutative_op));
        console.log(cancel_ops("rot  tuck 5 4 swap + 9 tuck + + "));
        console.log(hardcoded_arithmetic("1 2 +"));
        console.log(doit(`
5 >r r@ + 
`));
    };
    return({
        test: test,
        doit: doit
    });
})();
