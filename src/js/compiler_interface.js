(function() {
    var div = document.createElement("div");
    document.body.appendChild(div);
    div.appendChild(br());

    var result = document.createElement("div");

    load_examples(5, [
        ["case", `
( case test )
0 1 =2 if 4 else 5 then
`],
        ["hashlock", `
% hashlock test

binary qfPbi+pbLu+SN+VICd2kPwwhj4DQ0yijP1tM//8zSOY= hash
 binary Q+s3EEGaJrywFpYUNhG2Sv9X5/H+7H6xHZKVmehJUMw= =2

% this is a comment.

( this
  is 
a 
multiline
comment )

% =2 compares 2 things, and deletes the 2 things from the stack. use "==" if you don't want to delete the two things from the stack.

% returns a "1", because the result of the comparison is "true".
`],
        ["macro", `
% macro test

macro square dup * ; 
 2 square 4 =2 
`],
        ["variables", `
% variables test

var X Y ; % declare the variables

12 X ! % store a 12 in X
11 Y !
X @ X @ % read the variable X onto the stack twice.
12 =2 >r % This is checking that X wrote a 12 onto the stack.
12 =2 >r % 
10 X !
X @ 
10 =2 >r
Y @
11 =2 >r
r> r> r> r> and and and
`],
        ["verify signature", `
% signature test

macro sig binary MEUCIHCR1svp7NnNkzRmjLPTftw99QeufJPQjdQUtBNViaiJAiEAhnjHz31DEkSar4QeQsSk8iIDn+18xk00aEhLCK1kbJg= ;

 macro pub binary BLDdkEzI6L8qmIFcSdnH5pfNAjEU11S9pHXFzY4U0JMgfvIMnwMxDOA85t6DKArhzbPJ1QaNBFHO7nRguf3El3I= ;

macro data binary AQID ;

sig data pub verify_sig 

`],
        ["function", `
% function test

: square dup * ;
: quad square call square call ;

 2 quad call 16 == 
`],
        ["anonymous function", `
% anonymous function

def dup * ;
var square ;
square ! ( storing a function inside a variable )
def dup + ;
>r ( storing a pointer to a function on the r-stack )

def 5 ;
call ( calling the anonymous function. )
drop

  3 square @ call ( calling the named function )
  r@ call ( calling the function being pointed to by the top of the r-stack )
  18 =2
`],
        ["map", `
% map

% macros to allow for lists.
macro [ nil ;
macro , swap cons ;
macro ] swap cons reverse ;

: square dup * ;

: map2 ( NewList OldList -- List2 )
  car swap r@ call rot cons swap
  nil ==
  if
    drop drop reverse
  else
    drop recurse call
  then ;
macro map ( List Fun -- NewList )
  >r nil swap map2 call r> drop
;

[ 5, 6, 7]
square map
[ 25, 36, 49]
=2 

`],
        ["primes", `
% calculate a list of prime numbers

macro [ nil ;
macro , swap cons ;
macro ] swap cons reverse ;

: divisible_in_list ( x l -- b )
  nil == if
    drop drop drop 0
  else
    drop
    car >r swap dup tuck swap rem not 
    if
      r> drop drop 1
    else
      r> recurse call
    then
  then
;

: append_if_not_divisible ( x l -- b )
  ddup divisible_in_list call
  if
    swap drop
  else
    cons
  then
;

: get_primes ( list start end -- list2 )
  == if
    drop drop
  else
    >r dup >r swap append_if_not_divisible call
    r> 1 + r> recurse call
  then
;

 [ 2 ] 3 200 get_primes call reverse

`],
        ["filter", `
% filter a list

var check filter2 ;
macro [ nil ;
macro , swap cons ;
macro ] swap cons reverse ;

def ( Int -- Bool )
  27 >
;
check !

def ( NewList OldList -- List2 )
  nil ==
  if
    drop drop reverse
  else
    drop car swap dup r@ call
    if
      rot cons swap
    else
      drop
    then
    recurse call
  then
;
filter2 !
macro filter ( List Fun -- NewList )
  >r nil swap filter2 @ call r> drop
;

[20, 30, 40, 10] check @ filter
[30, 40]
=2

`],
        ["merge sort", `
( mergesort )

( helper macros for making lists. )
macro [ nil ;
macro , swap cons ;
macro ] , reverse ;

var sort2 merge2 merge_setup2 map2 ;

% higher order function "map". applies a function to every element of a list. [A, B, B] -> [f(A), f(B), f(C)] 
def ( NewList OldList -- List2 )
  car swap r@ call rot cons swap
  nil ==
  if
    drop drop reverse
  else
    drop recurse call
  then ;
map2 !
macro map ( List Fun -- NewList )
  >r nil swap map2 @ call r> drop
;


( merge two sorted lists into one sorted list. )
def ( L1 L2 Accumulator -- L3 )
  >r
  nil == if ( if L1 is [] )
    drop drop r> reverse swap ++
  else
    drop swap nil ==
    if ( if L2 is [] )
      drop drop r> reverse swap ++
    else ( jumping from this else to wrong then )
      ( add bigger element to list in r stack )
      drop
      car swap rot car swap rot ddup
      < if
        swap r> cons >r rot
      else
        r> cons >r swap
      then
      cons r> recurse call
    then
  then
;
merge2 !
macro merge ( L1 L2 -- L3 )
  nil merge2 @ call
;


( example: [A, B, C] -> [[A], [B], [C]]. )
def ( X -- [X] )
  nil cons ;
merge_setup2 !
macro merge_setup ( List -- ListOfLengthOneLists )
  merge_setup2 @ map
;


( sort a list )
def ( ListOfSortedLists -- SortedList )
  car nil == ( if there is only 1 sorted list left, return it. )
  if
    drop drop
  else
    ( sort the first 2 lists, and append the result to the listofsortedlists. )
    drop car tuck merge nil cons ++ recurse call
  then
;
sort2 !
macro sort ( UnsortedList -- SortedList )
  merge_setup sort2 @ call
;

  [ 10, 2, 13, 4, 5 ] sort
  [ 2, 4, 5, 10, 13 ]
  =2

`],
        ["contract that returns a different contract", `
macro empty_string 4 0 split swap drop ;

macro int_op binary AA== ;
macro bin_op binary Ag== ;
macro call_op binary cQ== ;

( for measuring the length of a binary in bytes )
def ( bin accumulator -- length )
  swap
  dup empty_string =2
  if
    drop
  else
    1 split drop
    swap 1 +
    recurse call
  then ;
var bin_length_fun ;
bin_length_fun !
macro bin_length ( bin -- length )
  0 bin_length_fun @ call ;

( converts a binary value into the chalang
code for loading that same value onto the 
stack )
def
  @ >r bin_op r@ bin_length ++ r> ++ ++
;
var bin_code_fun ;
bin_code_fun !

macro bin_code bin_code_fun @ call ;

var hello ;
binary aGVsbG8gd29ybGQ= hello !

: func1 int4 5 binary aGVsbG8gd29ybGQ= ;

( building a binary representation of func1 )
int_op 5 ++ 
hello bin_code
hash

( hash of the binary representation should be
 the same as 'func1' )
func1 =2

`]
    ]);
    div.appendChild(br());

    var text = document.createElement("textarea");
    text.rows = 20;
    text.cols = 60;

    div.appendChild(text);
    div.appendChild(br());

    
    var compile = button_maker2(
        "compile and run",
        function(){
            var code = text.value;
            var s = chalang_compiler.doit(code);
            result.innerHTML = run(s);
        });
    div.appendChild(compile);
    div.appendChild(br());
    
    div.appendChild(result);
    div.appendChild(br());



    function run(code){
        var d = chalang_object.data_maker(
            1000000000, 1000000000, 100, 100, [], [],
            chalang_object.new_state(0, 0));
        var result = chalang_object.run5(code, d);
        return(result.stack);
    };

    function load_examples(cols, pairs){
        return(load_examples2(cols, cols, pairs));
    }
    function load_examples2(n, cols, pairs){
        if(pairs.length === 0){
            return(0);
        };
        var pair = pairs[0];
        var button = button_maker2(
            pair[0],
            function(){
                result.innerHTML = "";
                text.value = pair[1];
            });
        div.appendChild(button);
        var n2;
        if(n === 1){
            n2 = cols;
            div.appendChild(br());
        } else {
            n2 = n-1;
        }
        return(load_examples2(n2, cols, pairs.slice(1)));
    };

        


})();
