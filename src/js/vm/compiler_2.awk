function escape_characters(name){
    gsub("\[", "\\\[", name)
    gsub("\]", "\\\]", name)
    gsub("\(", "\\\(", name)
    gsub("\)", "\\\)", name)
    gsub("\{", "\\\}", name)
    gsub("\{", "\\\}", name)
    gsub("\\", "\\\\", name)
    gsub("\/", "\\\/", name)
    gsub("\|", "\\\|", name)
    gsub("\.", "\\\.", name)
    gsub("\+", "\\\+", name)
    gsub("\*", "\\\*", name)
    gsub("\'", "\\\'", name)
    gsub("\"", "\\\"", name)
    gsub("\?", "\\\?", name)
    gsub("\^", "\\\^", name)
    gsub("\$", "\\\$", name)
}

function do_macros(x){
    while(match(x, macro_format)){
        macro = substr(x, RSTART+1, RLENGTH-2)
        sub(/macro[[:space:]]+/, "", macro)
        match(macro, name_format)
        name = substr(macro, RSTART, RLENGTH)
        escape_characters(name)
#        r = name_format "[[:space:]]+;"
        #sub(r, "", macro)
        sub(name_format, "", macro)
        sub(/[[:space:]]+;/, "", macro)
        def = macro
        sub(macro_format, "", x)
        name_regex = "[ |^|\n]" name "[ |$|\n]"
        gsub(name_regex,  def " ", x)
    }
    return(x)
}
function sys(cmd){
    while((cmd | getline result)){
        r = result;
    }
    return(r)
}

function hash(code){
    cmd = "echo \"" code "\" | sha256sum"
    r = sys(cmd)
    match(r, /[0-9a-f]+/)
    r = substr(r, RSTART, RLENGTH)
    return(sys(cmd))
}
function encode(x){
    cmd = "echo -n \"" x "\" | base64"
    return(sys(cmd))
}
function decode(x){
    gsub(/[\n ]/, "", x)
    cmd = "echo -n \"" x "\" | base64 -d "
    return(sys(cmd))
}


function get_funs(x, funs){
    while(match(x, funs_regex)){
        fun = substr(x, RSTART+1, RLENGTH-1)
        match(fun, name_format)
        name = substr(fun, RSTART, RLENGTH)
        sub(name_format, "", fun)
        def = fun
        gsub(/\n/, " ", def)
        gsub(/\t/, " ", def)
        gsub(/  /, " ", def)
        gsub(/^ /, "", def)
        gsub(/ $/, "", def)
        code = to_opcodes(def, funs)
        signature = hash(code)
        funs[name] = signature
        sub(":", "$", x)
    }
    gsub("$", ":", x)
}

function unused_remove_functions(x){
    #removes the name from each function definition
    gsub(/\n/, " ", x)
    gsub(/\t/, " ", x)
    gsub(/  /, " ", x)
    r = ":[[:space:]]+[a-zA-Z0-9_-]+"
    gsub(r, ":- ", x)
    gsub(":- ", ": ", x)
    return(x)
}
function n_bytes(n, w){
    if(n < 1){return ""}
    b = w % 256;
    w2 = int(w / 256);
    return(n_bytes(n-1, w2) " " b " ")
}
function four_bytes(w){
    return(n_bytes(4, w))
}
function code2letter(n){
    return(sprintf("%c", n))
}
function string_to_array(s){
    gsub(" ", "", s)
    if(s == ""){return ""}
    letter = substr(s, 1, 1)
    rest = substr(s, 1, length(s)-1)
    number = letter2code[letter]
    return(number string_to_array(rest))
}
function to_opcodes(x, funs2){
    #todo. working here.
    ops = ""
    while(match(x, name_format)){
        word = substr(x, RSTART, RLENGTH)
        sub(word, "", x)
        op = word2op(word)
        fun = funs2[word]
        if(word=="binary"){
            match(x, name_format)
            b = substr(x, RSTART, RLENGTH)
            bin = encode(b)
            s = length(bin)
            four = four_bytes(s)
            a = string_to_array(bin)
            ops = ops "2 " four a 
            sub(b, "", x)
        } else if(word=="int4"){
            match(x, name_format)
            n = substr(x, RSTART, RLENGTH)
            four = four_bytes(n)
            ops = ops "0" four
        } else if(word=="int1"){
            n = substr(x, RSTART, RLENGTH)
            n = n % 256
            ops = ops "3 " n
        } else if(word=="int2"){
            n = substr(x, RSTART, RLENGTH)
            n2 = n_bytes(2, n)
            ops = ops "4 " n2 
        } else if(!(op == false)){
            ops = ops op " "
        } else if(!(fun == "")) {
            ops = ops "2 0 0 0 32 " fun 
        } else if (word ~ /[0-9]+/){
            ops = ops num2bytes(word) " "
        } else {
            print("undefined word")
            print(word)
            print(fun)
            exit
        }
    }
    return(ops)
}
function print_array(abc){
    print("printing an array")
    for(key in abc){
        if(abc[key]){
            print key ", " abc[key]
        }
    }
    print("done printing an array")
}
function num2bytes(w){
    if(w<36){
        return(140+2)
    }else if(w<256){
        return("3 " w)
    }else if(w < 65536){
        a = int(w/256)
        b = w%256
        return("4 " a " " b)
    } else {
        f = four_bytes(w)
        return("0" f)
    }
}
function word2op(word){
    if(word == "int4"){ return(0)}
    if(word == "binary"){return(2)}
    if(word == "int1"){return(3)}
    if(word == "int2"){return(4)}
    if(word == "int0"){return(12)}
    if(word == "print"){return(10)}
    if(word == "return"){return(11)}
    if(word == "nop"){return(12)}
    if(word == "fail"){return(13)}
    if(word == "drop"){return(20)}
    if(word == "dup"){return(21)}
    if(word == "swap"){return(22)}
    if(word == "tuck"){return(23)}
    if(word == "rot"){return(24)}
    if(word == "ddup"){return(25)}
    if(word == "tuckn"){return(26)}
    if(word == "pickn"){return(27)}
    if(word == ">r"){return(30)}
    if(word == "r>"){return(31)}
    if(word == "r@"){return(32)}
    if(word == "hash"){return(40)}
    if(word == "verify_sig"){return(41)}
    if(word == "verify_account_sig"){return(42)}
    if(word == "+"){return(50)}
    if(word == "-"){return(51)}
    if(word == "*"){return(52)}
    if(word == "/"){return(53)}
    if(word == ">"){return(54)}
    if(word == "<"){return(55)}
    if(word == "^"){return(56)}
    if(word == "rem"){return(57)}
    if(word == "=="){return(58)}
    if(word == "=2"){return(59)}
    if(word == "if"){return(70)}
    if(word == "else"){return(71)}
    if(word == "then"){return(72)}
    if(word == "not"){return(80)}
    if(word == "and"){return(81)}
    if(word == "or"){return(82)}
    if(word == "xor"){return(83)}
    if(word == "band"){return(84)}
    if(word == "bor"){return(85)}
    if(word == "bxor"){return(86)}
    if(word == "stack_size"){return(90)}
    if(word == "id2balance"){return(91)}
    if(word == "pub2addr"){return(92)}
    if(word == "total_coins"){return(93)}
    if(word == "height"){return(94)}
    if(word == "slash"){return(95)}
    if(word == "gas"){return(96)}
    if(word == "ram"){return(97)}
    if(word == "id2pub"){return(98)}
    if(word == "oracle"){return(99)}
    if(word == "many_vars"){return(100)}
    if(word == "many_funs"){return(101)}
    if(word == ":"){return(110)}
    if(word == "def"){return(114)}
    if(word == ";"){return(111)}
    if(word == "recurse"){return(112)}
    if(word == "call"){return(113)}
    if(word == "!"){return(120)}
    if(word == "@"){return(121)}
    if(word == "cons"){return(130)}
    if(word == "car"){return(131)}
    if(word == "nil"){return(132)}
    if(word == "++"){return(134)}
    if(word == "split"){return(135)}
    if(word == "reverse"){return(136)}
    if(word == "is_list"){return(137)}
#    print("undefined opcode")
#    print(word)
    return(false)
}
function remove_comments(x){
    #remove erlang style comments %comment
    gsub(/%[^\n]*(\n|$)/, "\n", x)
    #remove ( forth style comments )
    gsub(/\([^\)]*\)/, "", x)
    #remove single line forth ; style comments
    gsub(/\;[^\n][^\n]*(\n|$)/, ";", x)
    return x
}
function remove_functions(x){
    #in each function definition, remove the name of the function.
    r = ":[[:space:]]" name_format
    #print(r)
    while(match(x, r)){
        s = substr(x, RSTART, RLENGTH)
        sub(s, ":-", x)
    }
    gsub(":-", ":", x)
    return(x)
}
function get_vars(x){
    n = 0
    while(match(x, /var([[:space:]]+[a-zA-Z0-9]+)+[[:space:]]*;/)){
        n += 1
        a = substr(x, RSTART+3, RLENGTH-3)
        match(a, /[a-zA-Z0-9]+/)
        b = substr(a, RSTART, RLENGTH)
        #v[b] = n
        v[n] = b
        sub(b, "", x)
    }
    gsub(/var[[:space:]]*;/, "", x)
    for(i=1; i<=n; i++){
        b = v[i]
        gsub(b, i, x)
    }
    return(x)
}
function parse_strings(x){
    while(match(x, /\.\" [^\"]*\"/)){
        r = substr(x, RSTART, RLENGTH)
        a = substr(x, RSTART+3, RLENGTH-4)
        sub(r, encode(a), x)
    }
    return(x)
}
function clean_whitespace(x){
    gsub(/(\n|\t| )+/, " ", x)
    return(x)
}
function add_spaces(x){
    gsub(/\[/, " [ ", x)
    gsub(/\]/, " ] ", x)
    gsub(/\:/, " : ", x)
    gsub(/\;/, " ; ", x)
    gsub(/\,/, " , ", x)
    return(x)
}   


BEGIN {
    name_format = "[a-zA-Z0-9_-\[\],\@\<\>]+"
    word_format = "[a-z0-9_+-*\/=<>^:;@]+",
    macro_format = "[ |^|\n]macro[[:space:]]+[^\;]*;"
    funs_regex = ":[[:space:]]+[^\;]*"
    RS = "abcdefghijklmnopqrstuvwxyz only one record."

    for(n=0;n<256;n++){
        letter = code2letter(n)
        letter2code[letter] = n
    }
    word2op_data = "int4 0# binary 2# int1 3# int2 4# int0 12# print 10# return 11# nop 12# fail 13# drop 20# dup 21# swap 22# tuck 23# rot 24# ddup 25# tuckn 26# pickn 27# >r 30# r> 31# r@ 32# hash 40# verify_sig 41# verify_account_sig 42# + 50# - 51# * 52# / 53# > 54# < 55# ^ 56# rem 57# == 58# =2 59# if 70# else 71# then 72# not 80# and 81# or 82# xor 83# band 84# bor 85# bxor 86# stack_size 90# id2balance 91# pub2addr 92# total_coins 93# height 94# slash 95# gas 96# ram 97# id2pub 98# oracle 99# many_vars 100# many_funs 101# : 110# def 114# ; 111# recurse 112# call 113# !120# @ 121# cons 130# car 131# nil 132# ++ 134# split 135# reverse 136# is_list 137"
    pair_format = word2op_data " [0-9]+#"
    while(match(word2op_data, pair_format)){
        a = substr(word2op_data, RSTART, RLENGTH)
        sub(a, "", word2op_data)
        match(word2op_data, word_format)
        word = substr(word2op_data, RSTART, RLENGTH)
        sub(word, "", word2op_data)
        match(word2op_data, /[0-9]+#/)
        num = substr(word2op_data, RSTART, RLENGTH-1)
        sub(num, "", word2op_data)
        words2ops[word] = num
        ops2words[num] = word
    }

{
    print(words2ops[dup])
    print(ops2words2ops[52])
    x = $0 "\n"
    x = remove_comments(x)
    x = add_spaces(x)
    x = clean_whitespace(x)
    x = parse_strings(x)
    x = get_vars(x)
    x = do_macros(x)
    get_funs(x, funs)
    x = remove_functions(x)
    x = to_opcodes(x, funs)
    print(x)
}
