function protect_characters(name){
    chars = "\[\]\(\)\{\}\\\/\|\.\+\*\'\"\?\^\$"
    while(chars != "" ){
        x = substr(chars, 0, 1)
        chars = substr(chars, 1, length(chars) - 1)
        gsub(x, "\\" x, name)
    }
    return(name)
}
function do_macros(x){
    while(match(x, macro_format)){
        macro = substr(x, RSTART+1, RLENGTH-2)
        sub(/macro[[:space:]]+/, "", macro)
        match(macro, name_format)
        name = substr(macro, RSTART, RLENGTH)
        name = protect_characters(name)
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
function numbers2bytes(x){
    bytes = ""
    while(match(x, /[0-9]+/)){
        n = substr(x, RSTART, RLENGTH)
        sub(/ *[0-9]+ */, "", x)
        #bytes = bytes "\\\\x" byte_number2hex(n)
        bytes = bytes byte_number2hex(n)
    }
    return(bytes)
}
function hash(code){
    #print(code)
    code = numbers2bytes(code)
    #print(code)
    cmd = "echo -n '" code "' | xxd -r -p | sha256sum "
    #print(cmd)
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
        gsub(/  /, " ", def)#repeated spaces
        gsub(/^ /, "", def)#leading spaces
        gsub(/ $/, "", def)#trailing spaces
        code = to_opcodes(def, funs)
        signature = hash(code)
        funs[name] = signature
        sub(":", "$", x)
    }
    gsub("$", ":", x)
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
    ops = ""
    while(match(x, word_format)){
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
            ops = ops "2 " four a " "
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
            h2b = hex2bytes(fun)
            ops = ops "2 0 0 0 32 " h2b " "
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
function hex2bytes(h){
    result = ""
    while(!(h == "")){
        a = substr(h, 1, 1)
        b = substr(h, 2, 1)
        h = substr(h, 3, length(h) - 2)
        b1 = hex2byte(a, b)
        result = result " " b1
    }
    return(result)
}
function byte_number2hex(n){
    a = n % 16
    b = int(n / 16)
    return(num2hex(b) num2hex(a))
}
function num2hex(a){
    if(a < 10){return(a "")}
    if(a == 10){return("a")}
    if(a == 11){return("b")}
    if(a == 12){return("c")}
    if(a == 13){return("d")}
    if(a == 14){return("e")}
    if(a == 15){return("f")}
    else{print("num2hex failure!! error!!!!")}
}
function hex2byte(a, b){
    return((hex2num(a)*16) + hex2num(b))
}
function hex2num(a){
    if(a == "a") {return(10)}
    if(a == "b") {return(11)}
    if(a == "c") {return(12)}
    if(a == "d") {return(13)}
    if(a == "e") {return(14)}
    if(a == "f") {return(15)}
    return(a+0)
}
function num2bytes(w){
    if(w<36){
        return(140+w)
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
    op = words2ops[word]
    if(op){ return(op) }
    return(false)
}
function op2word(op){
    word = words2ops[word]
    if(word){ return(word) }
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
    while(match(x, r)){
        s = substr(x, RSTART, RLENGTH)
        sub(r, ":-", x)
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
    gsub(/[\[\]\:\;\,]/, " & ", x)
    return(x)
}
function decompile(program, ops2words){
    out = ""
    while(match(program, /[0-9]+/)){
        byte = substr(program, RSTART, RLENGTH)
        word = ops2words[byte]
        if(word){
            out = out " " word
        } else {
            out = out " " byte
        }
        sub(/ *[0-9]+/, "", program)
    }
    return(out)
}
BEGIN {
    name_format = "[a-zA-Z0-9_-\[\],\@\<\>]+"
    word_format = "[a-z0-9+_-*=!\<\>\/^\@\:\;]+"
    macro_format = "[ |^|\n]macro[[:space:]]+[^\;]*;"
    funs_regex = ":[[:space:]]+[^\;]*"
    RS = "abcdefghijklmnopqrstuvwxyz only one record."

    for(n=0;n<256;n++){
        letter = code2letter(n)
        letter2code[letter] = n
    }
    word2op_data = "int4 0# binary 2# int1 3# int2 4# int0 12# print 10# return 11# nop 12# fail 13# drop 20# dup 21# swap 22# tuck 23# rot 24# ddup 25# tuckn 26# pickn 27# >r 30# r> 31# r@ 32# hash 40# verify_sig 41# verify_account_sig 42# + 50# - 51# * 52# / 53# > 54# < 55# ^ 56# rem 57# == 58# =2 59# if 70# else 71# then 72# not 80# and 81# or 82# xor 83# band 84# bor 85# bxor 86# stack_size 90# id2balance 91# pub2addr 92# total_coins 93# height 94# slash 95# gas 96# ram 97# id2pub 98# oracle 99# many_vars 100# many_funs 101# : 110# def 114# ; 111# recurse 112# call 113# ! 120# @ 121# cons 130# car 131# nil 132# ++ 134# split 135# reverse 136# is_list 137#"
    pair_format = word_format " [0-9]+#"
    while(match(word2op_data, pair_format)){
        a = substr(word2op_data, RSTART, RLENGTH)
        sub(pair_format, "", word2op_data)
        match(a, word_format)
        word = substr(a, RSTART, RLENGTH)
        sub(word_format, "", a)
        match(a, /[0-9]+#/)
        num = substr(a, RSTART, RLENGTH-1)
        sub(num, "", a)
        words2ops[word] = num
        ops2words[num] = word
    }
}
{
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
