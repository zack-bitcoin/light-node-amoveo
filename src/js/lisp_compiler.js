var lisp_compiler = (function(){
    var ops = {
        "true": {code: ["1"], ins:0},
        "false": {code: ["0"], ins:0},
        print: {code: ["print"], ins:"any"},
        "return": {code: ["return"], ins: 3},
        nop: {code: ["nop"], ins: 0},
        fail: {code: ["fail"], ins: 0},
        "list": {code: [], ins: "any"},
        drop: {code:["drop"], ins: 1},
        dup: {code: ["dup"], ins: 1},
        swap: {code: ["swap"], ins: 2},
        tuck: {code: ["tuck"], ins: 3},
        rot: {code: ["rot"], ins: 3},
        ddup: {code: ["ddup"], ins: 2},
        tuckn: {code: ["tuckn"], ins: 1},
        pickn: {code: ["pickn"], ins: 1},
        ">r": {code: [">r"], ins: 1},
        "r>": {code: ["r>"], ins: 0},
        "r@": {code: ["r@"], ins: 0},
        hash: {code: ["hash"], ins: 1},
        verify_sig: {code: ["verify_sig"], ins: 3},
        "+": {code: ["+"], ins: 2},
        "-": {code: ["-"], ins: 2},
        "*": {code: ["*"], ins: 2},
        "/": {code: ["/"], ins: 2},
        ">": {code: [">"], ins: 2},
        "<": {code: ["<"], ins: 2},
        "^": {code: ["^"], ins: 2},
        rem: {code: ["rem"], ins: 2},
        "==": {code: ["=="], ins: 2},
        "=2": {code: ["=2"], ins: 2},
        "if": {code: ["if"], ins: 1},
        "else": {code: ["else"], ins: 0},
        then: {code: ["then"], ins: 0},
        not: {code: ["not"], ins: 1},
        and: {code: ["and"], ins: 2},
        or: {code: ["or"], ins: 2},
        xor: {code: ["xor"], ins: 2},
        band: {code: ["band"], ins: 2},
        bor: {code: ["bor"], ins: 2},
        bxor: {code: ["bxor"], ins: 2},
        stack_size: {code: ["stack_size"], ins: 0},
        height: {code: ["height"], ins: 0},
        gas: {code: ["gas"], ins: 0},
        ram: {code: ["ram"], ins: 0},
        many_vars: {code: ["many_vars"], ins: 0},
        many_funs: {code: ["many_funs"], ins: 0},
        ":": {code: [":"], ins: 3},
        def: {code: ["def"], ins: 3},
        ";": {code: [";"], ins: 0},
        recurse: {code: ["recurse", "call"], ins: "any"},
        call: {code: ["call"], ins: 1},
        "!":{code:["!"], ins: 2},
        "set!":{code:["swap", "!"], ins: 2},
        "@": {code: ["@"], ins: 1},
        cons: {code: ["cons"], ins: 2},
        "car@": {code: ["car"], ins: 2},
        car: {code: ["car", "drop"], ins: 1},
        cdr: {code: ["car", "swap", "drop"], ins: 1},
        nil: {code: ["nil"], ins: 0},
        "++": {code: ["++"], ins: 2},
        split: {code: ["slit"], ins: 2},
        reverse: {code: ["reverse"], ins: 1},
        is_list: {code: ["is_list", "swap", "drop"], ins: 1}
    };
    function remove_comments(page){
        //from ; till newline.
        page = page.replace(
                /;[^\n]*/g, "");
        return(page);
    };
    function add_spaces(page) {
        //either side of open and close parenths ()
        page = page.replace(
                /[\(\)]/g,
            function(x){
                return(" "+x+" ")});
        return(page);
    };
    function parse_integers(list){
        var r = list.map(function(x){
            if(!(isNaN(x))){
                return(parseInt(x));
            } else {
                return(x);
            };
        });
        return(r);
    };
    function to_words(page) {
        return(page.match(/\S+/g));
    };
    function to_lists(words){
        return(to_lists2(words, [], 0));
    };
    function to_lists2(words, r, n){
        if((words.length < 1)&&
           (n===0)) {
            return(r);
        };
        if(words.length < 1){
            //console.log(n);
            //console.log("not enough close parenthesis");
            errors = errors.concat([{type: "not enough close parenthesis"}]);
            return("error");
        };
        var w = words[0];
        if(w === "("){
            var x = to_lists2(words.slice(1), [], n+1);
            return(to_lists2(
                x.list,
                r.concat([x.rest]),
                n));
        };
        if((w === ")")&&
           (n == 0)){
            errors = errors.concat([{type: "too many close parenthesis"}]);
            return("error");
        };
        if(w === ")"){
            return({
                rest: r,
                list: words.slice(1)
            })
        };
        return(to_lists2(
            words.slice(1),
            r.concat([w]),
            n));
    };
    function is_64(str) {
        if(!(typeof(str) === "string")){
            return(false);
        };
        if (str ==='' || str.trim() ===''){
            return(false);
        };
        try {
            return(btoa(atob(str)) === str);
        } catch(e) {
            return(false);
        };
    };
    var var_regex = /\(\s*var\s+[^\)]+\)/g;
    // this regex is for if we had wanted pairs, and if we gave initial definitions to variables.
    //var var_regex = /\(\s*var\s*\(\s*(\s*\(\s*\S+\s+\S+\s*\)\s*)*\)\s*\)/g;
    function remove_vars(s){
        var m = s.match(var_regex);
        if(!(m)){
            m = [];
        };
        s = s.replace(var_regex, "");
        return({s:s, vars:m});
    }
    function get_vars(s) {
        var l = s.match(var_regex);
        if(!l){ l = [];};
        l = l.map(function(var_string){
            var words = to_words(var_string);
            words = words.slice(2, words.length-1);
            return(words);
        });
        l = l.reduce(function(a, b){
            return(a.concat(b));
        }, []);
        var r = {};
        l.map(function(x){r[x] = [x]});
        return(r);
    };
    function update_vars(key, val, dict) {
        if(key == "_"){
            return(dict);
        };
        //if(dict[key]){
            //console.log("no re-defining variables");
        //};
        dict[key] = val;
        return(dict);
    };
    function fip(inputs, depth, vars_db){
        var d = depth;
        for(var i = 0; i<inputs.length; i++){
            vars_db = update_vars(
                inputs[i],
                //["r@", depth, "+", "@"],
                ["r@", d, "+", "@"],
                vars_db);
            d += 1;
        };
        return(vars_db);
    };
    function lisp2forth(s, vars, funs, depth){
        console.log(s);
        if(!(depth)){depth = 0};
        if(!(funs)){funs = {}};
        if(s.length < 1){return([])};
        if(!(isNaN(s))){return([s])};
        if(vars[s]){return(vars[s])};
        if(funs[s]){
            //console.log("is fun 1");
            return([s])};
        if(is_64(s)){return([s])};
        if(is_op(s)){return([s])};

        var start = s[0];
        if(Array.isArray(start)){
            word = s[0][0];
            if((word === "define") &&
               (s[0].length === 3) &&
               (Array.isArray(s[0][1])) &&
               (s[0][1].length > 0) &&
               (!(funs[s[0][1][0]])))
            {
                var name = s[0][1][0];
                var inputs = s[0][1].slice(1);
                var code = s[0][2];
                if(funs[name]){
                    errors = errors.concat([{type: "cannot re-define a function", name: name}]);
                    return("error");
                };
                var lv = inputs.length;
                funs[name] = lv;
                vars = fip(inputs.reverse(), depth, vars);
                var l1 = lisp2forth(code, vars, funs, lv);
                var x2 = load_inputs(lv, 0)
                    .concat(l1);
                console.log(load_inputs(lv, 0));
                //console.log(JSON.stringify(s[0]));
                //console.log(JSON.stringify(s[1]));
                var l2  = lisp2forth(s.slice(1), vars, funs, depth);
                var l3 = ["def"]
                    .concat(x2)
                    .concat([";", "var", name, ";", name, "!"])
                    .concat(l2);
                return(l3);
            } else if(word === "define"){
                errors = errors.concat([{
                    type: "badly formed define",
                    name: s[0],
                    code: s,
                    "length check":(s[0].length === 3),
                    "is array check":(Array.isArray(s[0][1])),
                    "is named check":(s[0][1].length > 0),
                    "cannot re-define function check":(!(funs[s[0][1][0]]))
                }]);
                return("error");
            } else {
                var l1 = lisp2forth(s[0], vars, funs, depth);
                var l2 = lisp2forth(s.slice(1), vars, depth);
                return(l1.concat(l2));
            };
        } else {
            var word = s[0];
            if(word === "var"){
                errors = errors.concat([{type: "badly formed var", name: s[0]}]);
                return("error");
            } else if((word === "let") &&
                      (s.length === 3)){
                var pairs = s[1];
                var code = s[2];
                //var l1 = let_setup_inputs(pairs, vars, funs, depth);
                //var l2 = let_setup_env(pairs, code, vars, funs, depth);
                //return(L1 + L2);
                var r = [];
                var depth0 = depth;
                for(var i = 0; i < pairs.length; i++){
                    var v = pairs[i][0];
                    var c = pairs[i][1];
                    if(!Array.isArray(v)){
                        var l1 = lisp2forth(c, vars, funs, depth+1);
                        var l3 = ["r@", depth, "+", "!"];
                        depth += 1;
                        r = r.concat(l1)
                            .concat(l3);
                    } else {
                        //matching from a function with multiple outputs.
                        //console.log("doesn't yet support functions with multiple outputs in a let statement.");
                        errors = errors.concat([{type: "unsupported use of let. we don't support matching the output of a function that returns more than one result"}]);
                        return("error");
                        //var l1 = let_setup_inputs(
                    }
                };
                return(r.concat(lisp2forth(code, vars, funs, depth)));
                //return(let_internal(pairs, code, vars, funs, depth));
            } else if((word === "let")){
                errors = errors.concat([{type: "badly formed let statement"}]);
                return("error");
            } else if((word === "=") &&
                      (s.length === 3)){
                var l1 = lisp2forth(s[1], vars, funs, depth);
                var l2 = lisp2forth(s[2], vars, funs, depth);
                console.log(JSON.stringify(s[1]));
                console.log(JSON.stringify(l1));
                return(l1
                       .concat(l2)
                       .concat(["==", "tuck", "drop", "drop"]));
            } else if (word === "="){
                errors = errors.concat([{type: "bad equals statment. equality is between 2 things."}]);
                return("error");
            } else if(word === "cond"){
                var r = [];
                var r2 = [];
                for(var i = 1; i<s.length; i++){
                    var q = s[i][0];
                    var a = s[i][1];
                    var l2 = lisp2forth(a, vars, funs, depth);
                    if(q === "true"){
                        r = r
                            .concat(l2);
                        i += s.length;
                    } else {
                        var l1 = lisp2forth(q, vars, funs, depth);
                        r = r
                            .concat(l1)
                            .concat(["if"])
                            .concat(l2)
                            .concat(["else"]);
                        r2 = r2
                            .concat(["then"]);
                    }
                };
                return(r.concat(r2));
            } else if((word === "apply")){
                var f = lisp2forth(s[1], vars, funs, depth);
                var rand = s.slice(2);
                return(do_fun(f, depth, rand, vars, funs));
            } else if(funs[word]) {
                var rand = s.slice(1);
                var ins = funs[word];
                if(ins === rand.length){
                    //var m = [word, "@", "call"];
                    //if(depth > 0) {
                    return(do_fun([word, "@"], depth, rand, vars, funs));
                } else {
                    errors = errors.concat([{type: "wrong number of inputs to function"}]);
                    return("error");
                }
            } else if(word === "list") {
                var rand = s.slice(1);
                var l1 = rand.map(function(x){
                    return(lisp2forth(x, vars, funs, depth))});
                l1 = l1.reduce(function(a, b){
                    return(a.concat(b));
                }, []);
                return(l1);
            } else if((is_op(word))) {
                var rand = s.slice(1);
                var op = ops[word];
                if((op.ins === "any") ||
                   (rand.length === op.ins)){
                    var l1 = rand.map(function(x){
                        return(lisp2forth(x, vars, funs, depth))});
                    l1 = l1.reduce(function(a, b){
                        return(a.concat(b));
                    }, []);
                    //return(l1.concat([word]));
                    return(l1.concat(op.code));
                } else {
                    errors = errors.concat([{type: "wrong number of inputs to opcode", word: word, "should be": op.ins, "is": rand.length}]);
                    return("error");
                };
            } else {
                errors = errors.concat([{type: "undefined word", word: word}]);
                return("error");
            };
        };
    };
    function do_fun(word, depth, rand, vars, funs) {
        var m = word.concat(["r@", depth, "+", ">r", "call", "r>", "drop"]);
        var l1 = rand.map(function(r){
            return(lisp2forth(r, vars, funs, depth));
        });
        l1 = l1.reduce(function(a, b){
            return(a.concat(b));
        }, []);
        return(l1.concat(m));
    };
    function is_op(word) {
        //if(chalang_compiler.ops[word]){
        if(ops[word]){
            return(true);
        } else {
            return(false);
        };
    };
    function let_setup_inputs(pairs, vars, funs, depth) {
        var r = [];
        for(var i = 0; i<pairs.length; i++){
            var a = pairs[i][0];
            var v = pairs[i][1];
            r = r.concat(lisp2forth(v, vars, funs, depth+1));
            r = r.concat(let_setup_inputs2(a, depth));
        };
        return(r);
    };
    function load_inputs(many0, depth0){
        var many = many0;
        var depth = depth0;
        var r = [];
        if(many === 0){
            return([]);
        };
        if(depth === 0){
            r = ["r@", "!"];
            many -= 1;
            depth = 1;
        };
        for(var i = many; i > 0; i--){
            r = r.concat(["r@", depth, "+", "!"]);
            depth += 1;
        };
        return(r);
    };
    function let_setup_inputs2(many, n) {
        var r = [];
        for(var i = many; i > -1; i--){
            r = r.concat(["r@", n, "+", "!"]);
            n += 1;
        };
        return(r);
    };
    function constants_internal(pairs, vars, funs, depth){
        var code = [];
        for(var i = 0; i<pairs.length; i++){
            var val = pairs[i][1];
            var name = pairs[i][0];
            var l1 = lisp2forth(val, vars, funs, depth);
            var l2 = l1.concat([name, "!"]);
            code = ["var", name, ";"].concat(code).concat(l2);
            vars = update_vars(name, [name], vars);
        };
        return({code: code, vars: vars});
    };
    //function lisp2forth2
    var errors;
    function doit(page){
        errors = [];
        var s = remove_comments(page);
        s = add_spaces(s);
        var vars = get_vars(s);
        console.log(JSON.stringify(vars));
        //console.log(JSON.stringify(s));
        x = remove_vars(s);
        s = x.s;
        //console.log(JSON.stringify(s));
        s = to_words(s);
        //console.log(JSON.stringify(s));
        s = parse_integers(s);
        //console.log(JSON.stringify(s));
        s = to_lists(s);
        console.log(JSON.stringify(s));
        s = lisp2forth(s, vars);
        console.log(JSON.stringify(s));
        s = s.join(" ");
        s = " 100 >r ".concat(s);
        s = s.replaceAll(";", ";\n");
        var more_vars = x.vars.map(
            function(y){//"( var doop )"
                y = to_words(y);
                y = y.slice(2, y.length-1);
                y = ["var"].concat(y).concat([";"]);
                return(y);
            });
        more_vars = more_vars.reduce(function(a, b) {return(a.concat(b))}, [], more_vars);
        more_vars = more_vars.join(" ");
        more_vars = more_vars.replaceAll(";", ";\n");
        s = more_vars.concat(s);
                                              
        //console.log(JSON.stringify(x.vars));
        //console.log(JSON.stringify(more_vars));
        //console.log(JSON.stringify(vars));
        //console.log(more_vars.concat(s));
        if(errors.length === 0){
            return(s);
        } else {
            console.log(JSON.stringify(errors));
            return("error");
        };
    };
    function run(page){
        page = doit(page);
        return(run2(page));
    }
    function run2(page){
        if(page === "error"){
            return(0);
        };
        var bytecode =
            chalang_compiler.doit(page);
        var d = chalang_object.data_maker(10000, 10000, 50, 1000, [], [], chalang_object.new_state(0, 0));
        var x = chalang_object.run5(bytecode, d);
        return(x.stack);
        
    };
    function test(){
        var s = "(a b ; comment \n c)";
        var s2 = remove_comments(s);
        //console.log(s2);
        var s = "(a (b c) ())";
        var s2 = add_spaces(s);
        var s2 = to_words(s2);
        var s2 = to_lists(s2);
        console.log(JSON.stringify(s2));
        var s = `
(define (square x) 
  (* x x)) 
(define (unused x)
 (- x x))
(var foo) 
(list
(! 5 foo ) 
      (@ foo ) 
      (square (@ foo)) )
`;
        var s = `
(define (square x) (* x x))
(define (quad x) (square (square x)))
(quad 3)
`;
        //console.log(run(s));
        var s = `
; factorial with a global variable to store the intermediate value.
(var sum)
(define (f x)
  (cond ((= x 0) (@ sum))
        (true (list 
           (! (* (@ sum) x) sum)
           (drop (@ sum))
           (recurse (- x 1))))))

; purely functional factorial that stores intermediate values in the callstack.
(define (f2 x)
  (cond ((= x 0) 1)
        (true 
          (* x (recurse (- x 1))))))

; factorial with tail-call optimization
(define (f32 x a)
  (cond ((= x 0) a)
        (true
          (recurse (- x 1) (* a x)))))
(define (f3 x) (f32 x 1))


(list
 (! 1 sum)
 (f 4)
 (f2 4) 
 (f3 4)
 (print)
)
`;
        var s = `
(define (square x) (* x x))
(define (sum a b) (+ a b))
(define (odd? x) (rem x 2))
(define (map f l)
  (cond 
    ((= l nil) nil)
    (true 
      (cons 
       (apply f (car l))
       (recurse f (cdr l))))))

(define (fold f a l)
  (cond ((= l nil) a)
        (true (recurse f 
                       (apply f (car l) a) 
                       (cdr l)))))
(define (filter f l)
  (cond ((= l nil) nil)
        ((apply f (car l))
         (cons (car l)
               (recurse f (cdr l))))
        (true (filter f (cdr l)))))


(list
  (fold (@ sum) 0 (cons 5 (cons 4 (cons 3 nil))))
  (map (@ square) (cons 4 (cons 3 (cons 2 nil))))
  (filter (@ odd?) (cons 7 (cons 3 (cons 2 nil))))
;  (apply (print (@ square)) 4)
;  (odd? 4)
)
`;
/*        
        var s =`
(define (one x) (+ x 1))
(define (two f)
  (list (car (cons 4 nil)) (call f)))
(two (@ one))
`;
*/

        //var unoptimized = doit(s);
        //var optimized = chalang_jit.doit(unoptimized);
        //console.log(unoptimized);
        //console.log(optimized);
        //run2(unoptimized);
        //run2(optimized);
        console.log(JSON.stringify(run(s)));
        //console.log(JSON.stringify(chalang_jit.doit(doit(s))));
        //console.log(JSON.stringify(run(s)));
        //console.log(JSON.stringify(run2(chalang_jit.doit(doit(s)))));
        return("ok");
    };
    return({
        test: test,
        run: run,
        compile: doit
    });
    })();
