var chalang_compiler = (function() {
    var w2o = {
        "int": 0,
        binary: 2,
        int1: 3,
        int2: 4,
        int0: 12,
        print: 10,
        "return": 11,
        nop: 12,
        fail: 13,
        drop: 20,
        dup: 21,
        swap: 22,
        tuck: 23,
        rot: 24,
        ddup: 25,
        tuckn: 26,
        pickn: 27,
        ">r": 30,
        "r>": 31,
        "r@": 32,
        hash: 40,
        verify_sig: 41,
        verify_account_sig: 42,
        "+": 50,
        "-": 51,
        "*": 52,
        "/": 53,
        ">": 54,
        "<": 55,
        "^": 56,
        rem: 57,
        "==": 58,
        "=2": 59,
        "if": 70,
        "else": 71,
        then: 72,
        not: 80,
        and: 81,
        or: 82,
        xor: 83,
        band: 84,
        bor: 85,
        bxor: 86,
        stack_size: 90,
        id2balance: 91,
        pub2addr: 92,
        total_coins: 93,
        height: 94,
        slash: 95,
        gas: 96,
        ram: 97,
        id2pub: 98,
        oracle: 99,
        many_vars: 100,
        many_funs: 101,
        ":": 110,
        def: 114,
        ";": 111,
        recurse: 112,
        call: 113,
        "!":120,
        "@": 121,
        cons: 130,
        car: 131,
        nil: 132,
        "++": 134,
        split: 135,
        reverse: 136,
        is_list: 137
    };
    function remove_comments(s) {
        // single-line erlang style comments % comment
        s = s.replace(
                /%[^\n]*(\n|$)/g,
            "\n");
        // multi-line ( forth style comments )
        s = s.replace(
                /\([^)]*(\n|$|\))/g,
            "");
        // single-line forth style comments ; comment
        s = s.replace(
                /\;[^\n]*(\n|$)/g,
            ";\n");
        return(s);
    };
    function clean_whitespace(page){
        return(page.replace(/\s+/g, " "));
    };
    function add_spaces(page){
        //add spaces to either side of the 7 special characters.
        page = page.replace(
                /[\(\)\[\]\:\;\,]/g,
            function(x){
                return(" "+x+" ")});
        return(page);
    };
    var vars_regex = /var(\s+[^\s\;]+)+\s*;/g;
    function get_vars(page){
        var vars = {};
        var n = 1;
        //grab between "var" and ";"
        page.match(vars_regex)[0]
        //convert to list of words
            .match(/[^\s]+/g)
        //remove "var" and ";" from the ends
            .slice(1, -1)
            .map(function(x){
                vars[x] = n;
                n += 1;
            });
        return(vars);
    };
    function remove_vars(page){
        return(page.replace(vars_regex, ""));
    };
    function doit(s){
        var page0 = remove_comments(s);
        var page1 = add_spaces(page0);
        var vars = get_vars(page1);
        page1 = remove_vars(page1);
        var page2 = clean_whitespace(page1);
        //console.log(vars);
        var page3 = do_macros(page2);
        var db = {many:0,vars:vars,funs:{}};
        var fv = get_funs(page3, db);
        var page4 = remove_functions(page3);
        var ops = to_opcodes(page4, fv);
        return(ops.code);
    };
    function remove_functions(page){
        var words = page.match(/[^\s]+/g);
        for(var i = 0; i<words.length; i++){
            if(words[i] == ":"){
                words[i+1] = "";
            };
        };
        return(words.join(" "));
    };
    function to_opcodes(code, db){
        var words = code.match(/[^\s]+/g);
        var bytes = [];
        var vars2 = db.vars;
        for(var i = 0; i<words.length; i++){
            var w = words[i];
            var b = w2o[w];
            var fun = db.funs[w];
            var is_var = db.vars[w];
            if(b){
                bytes = bytes.concat([b]);
            } else if(fun){
                bytes = bytes.concat([2,0,0,0,32])
                    .concat(fun);
//            } else if(is_var){//require variables to start with a letter.
                //TODO,
                //maybe it would be better if variables were declared.
            } else if (!(isNaN(w))){
                w = parseInt(w);
                if(w<0){
                    console.log("no negatives.");
                    return(0);
                } else if(w<36){
                    bytes = bytes.concat([140+w]);
                } else if(w<256){
                    bytes = bytes.concat([3, w]);
                } else if(w<65536){
                    var w1 = Math.round(w / 256);
                    var w2 = w % 256;
                    bytes = bytes.concat([4, w1, w2]);
                } else if(w<4294967296){
                    var four = four_bytes(w);
                    bytes = bytes.concat([0]).concat(four);
                } else {
                    console.log("number too big");
                    return(0);
                };
            } else if(w == "binary") {
                var b = words[i+1];
                var bin = atob(b);
                var s = bin.length;
                var four = four_bytes(s);
                bytes = bytes.concat([2])
                    .concat(four)
                    .concat(string_to_array(bin));
            } else if(!(vars2[w] === undefined)){
                //existing variable.
                var four = four_bytes(vars2[w]);
                bytes = bytes.concat([0])
                    .concat(four);
            }  else {
                console.log("undefined variable");
                console.log(w);
                return(0);
                //new variable then.
                //vars2[w] = db.many;
                //var four = four_bytes(db.many);
                //db.many += 1;
                //bytes = bytes.concat([0])
                //    .concat(four);
            };
        };
        return({vars: vars2, code: bytes, many: db.many});
    };
    function four_bytes(w){
        var w4 = w%256;
        w = Math.round(w/256);
        var w3 = w%256;
        w = Math.round(w/256);
        var w2 = w%256;
        w = Math.round(w/256);
        var w1 = w;
        return([w1, w2, w3, w4]);
    };
    var macro_name = /[^\s]+/;
    function parse_macro(macro){
        macro = macro.replace(/^macro\s+/, "");
        var nr = macro_name;
        var name = macro.match(nr)[0];
        var def = macro.replace(nr, "").trim();
        return({name: name, def: def});
    };
    var funs_regex = /:\s+[^\;]*/g;
    function get_funs(page, db){
        var funs = page.match(funs_regex);
        if(!(funs)){
            return(db);
        };
        for(var i = 0; i<funs.length; i++){
            var f = funs[i].slice(1);
            var name = (f).match(macro_name);
            var def = (f).replace(macro_name, "").trim();
            var ops = to_opcodes(def, db);
            db.vars = ops.vars;
            db.many = ops.many;
            var code = ops.code;
            var signature = hash(code)
            db.funs[name] = signature;
        };
        return(db);
    };
    var first_macro = /macro\s+[^\;]*/;
//    function escapeRegExp(string) {
//        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//    }
    function do_macros(page){
        var macro = page.match(first_macro);
        if(macro){
            macro = parse_macro(macro[0]);
            //console.log(macro);
            page = page.replace(/macro\s+[^\;]*;/, "");
            var words = page.match(/[^\s]+/g);
            words = words.map(function(word){
                if(word === macro.name){
                    return(macro.def);
                };
                return(word);
            });
            page = words.join(" ");
            return(do_macros(page));
            
        } else {
            return(page);
        };
    };
    function test0(){
        var map_code = `
( a b c 
multiline comment
)
var foo bar; %variable declaration
foo 4 ! %storing a value in the variable
macro [ nil ; forth style comments
macro , swap cons ;
macro ] , reverse ;
: square dup * ;
: map2
  car swap r@ call rot cons swap
  nil ==
  if
    drop drop reverse 
  else 
    drop recurse call 
  then ; 
macro map 
  >r nil swap map2 call r> drop 

; 
macro test 
[ 5,6, 7] 
square print print print map 
[25, 36, 49] 
== >r drop drop r> 
;
test
`;
        return(test(map_code));
    }
    function test(code){
        var s = doit(code);
        console.log(JSON.stringify(s));
        var d = chalang_object.data_maker(1000, 1000, 50, 1000, [], [], chalang_object.new_state(0, 0));
        var x = chalang_object.run5(s, d);
        console.log(JSON.stringify(x.stack));
        return(x.stack);
    };
    return({
        test0: test0,
        test: test,
        doit: doit
    });
})();
