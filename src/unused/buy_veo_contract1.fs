( this allows us to use lists. )
macro [ nil ; 
macro , swap cons ; 
macro ] swap cons reverse ;

( this is the maximum value representable in chalang. 
 the payout vector that is used to divide up the money 
 from this contract, it's elements need to sum to 
 maximum )
macro maximum 4294967295 ;
( check that a conditional resulted in 'true', )
( otherwise the contract should crash. )
macro or_die
  if
  else
    fail
  then ;

( We need an empty string to end our recursion )
macro empty_string 4 0 split swap drop ;

( variables to customize this contract )
var TradeID TradeNonce Date Ticker 
 Amount Blockchain OracleStartHeight 
 ProvideAddressTimeout ;

TradeID !
TradeNonce !
Date !
Ticker !
Amount !
Blockchain !
OracleStartHeight !
ProvideAddressTimeout !


( if they don't provide a bitcoin address in time, )
( then give the veo to type 2. )
ProvideAddressTimeout @ height <
if
  [ 0, maximum ]
  0 1000
  return
else
then

( evidence to end this contract )
var Address AddressSig ;
swap Address !
swap AddressSig !

( loading the trade receipt from consensus state, )
( because only the person who accepted this swap )
( request can choose the address to receive their )
( cryptocurrency on the other blockchain. )
var Acc2 ;
car drop
car swap drop
car swap drop
car drop
32 split TradeID @ =2 or_die
65 split Acc2 !
TradeNonce @ =2 or_die

( check that Acc2 signed over Address where they want )
( to receive their BTC or whatever )
AddressSig @ Address @ Acc2 @ verify_sig or_die


( type 1 of first contract pays out to type 1 of second )
( contract. type 2 of first contract pays out to type 2 )
( of second contract )
[ [ maximum , 0 ] ,
[ 0 , maximum ] ]

( generating the root hash of the second smart contract )
( OracleStartHeight Blockchain Amount 
Ticker Date Address part2 call )
macro int_op binary AA== ;
macro bin_op binary Ag== ;
macro call_op binary cQ== ;


( for measuring the number of bytes in a binary )
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

( this anonymous function converts a binary value into
 chalang code for loading that same binary 
value into a different chalang VM instance. 
This is how we write a chalang contract in 
this contract. )
def
  @ >r bin_op r@ bin_length ++ r> ++ ++
;
var bin_code_fun ;
bin_code_fun !

macro bin_code bin_code_fun @ call ;

var part2 ;

int_op OracleStartHeight @ ++
Blockchain bin_code
Amount bin_code
Ticker bin_code
Date bin_code
Address bin_code
bin_op ++ 32 ++ part2 ++ call_op ++
( print )
hash

( part2 print print drop)

0 1000
