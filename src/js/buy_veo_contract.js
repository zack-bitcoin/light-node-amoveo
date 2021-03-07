var buy_veo_contract = (function(){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var fee = 200000;

    var contract1=`
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

`;

    var contract2 = `
( this allows us to use lists. )
macro [ nil ; 
macro , swap cons ; 
macro ] swap cons reverse ;

( this is the maximum value representable in chalang. )
( the payout vector that is used to divide up the money )
( from this contract, it's elements need to sum to )
( maximum )
macro maximum 4294967295 ;

( check that a conditional resulted in "true", )
( otherwise the contract should crash. )
macro or_die
  if
  else
    fail
  then ;

macro oracle_builder
  ( blockchain address amount ticker date -- oracle_text )
  >r >r >r >r >r
  ." The " r> ++
  ."  address " r> ++ ++
  ."  has received more than or equal to " r> ++ ++
  ."  of " r> ++ ++
  ."  before " r> ++ ++
;

macro oracle_id ( question_hash start_height -- oid)
 0 dup ++ ++ swap ++ hash ;

( This is the static part of the second smart contract. )
: part2
    
( variables to customize this contract )
var Address Date Ticker Amount Blockchain
  OracleStartHeight ;

  Address !
  Date !
  Ticker !
  Amount !
  Blockchain !
  OracleStartHeight !

( grab the OID from the consensus state. )
  var OID OID2 OracleResult ;
  car drop
  car swap drop
  car swap drop
  car drop
  32 split
  OID !
  ( get the one-byte result of the oracle, )
  ( convert to a 4 byte integer)
  1 split swap drop
  binary AAAA swap ++ ( 3 bytes of zeros )
  OracleResult !
  
  ( Date @ Ticker @ Amount @ Address @ Blockchain @ )
  Blockchain @ Address @ Amount @ Ticker @ Date @ 
  oracle_builder hash ( now we have the question hash )
  
  ( generate OID from oracle question )
  OracleStartHeight @ oracle_id OID2 !
  
  ( checking that the oids match )
  OID @ OID2 @ =2 or_die
  
  OracleResult @ 1 =2
  if ( result of oracle is "true" so the bitcoin arrived in time )
    ( give the money to type 2 )
    [ 0 , maximum ]
    0 1000
  else
    OracleResult @ 2 =2
    if ( result of oracle is "false" so the bitcoin did not arrive in time )
      ( give the money to type 1 )
      [ maximum , 0 ]
      0 1000
    else
      var half ;
      maximum 2 / half !
      [ half @ , maximum half @ - ]
      OracleResult @ 3 =2
      if ( bad question )
        ( split the money 50-50 )
        0 1000
      else ( oracle unresolved )
        ( keep waiting for the oracle to resolve )
        maximum 1
      then
    then
  then
;
`
    function settings(
        reusable_settings, address_timeout,
        trade_nonce, TID
    ){
        var s = ` AT RS TN binary TID `;
        s = s.replace("AT", address_timeout)
            .replace("RS", reusable_settings)
            .replace("TN", trade_nonce)
            .replace("TID", TID);
        return(s);
    };
    function reusable_settings(
        oracle_start_height, blockchain, amount,
        ticker, date
    ){
        var s = ` int4 OSH ." B" ." AM" ." TIC" ." DA"  `;
        s = s.replace("OSH", oracle_start_height)
            .replace("B", blockchain)
            .replace("AM", amount)
            .replace("TIC", ticker)
            .replace("DA", date);
        return(s);
    };
    function contract2bytes(
        reusable_settings, bitcoin_address
    ){
        var s = ` ." AD" binary ID2 call `;
        s = s.replace("AD", bitcoin_address)
            .replace("ID2", part2id());
        s = reusable_settings.concat(s);
        s = chalang_compiler.doit(s);
        return(s);
    };
    function part2id(){
        var code = contract2.concat(` part2 `);
        //console.log(code);
        var bytes = chalang_compiler.doit(code);
        //console.log(btoa(array_to_string(bytes)));
        return(run(bytes)[0]);
    };
    function part1static_bytes(){
        var s = ` macro part2 `
            .concat(part2id())
            .concat(` ; `)
            .concat(contract1);
        s = chalang_compiler.doit(s);
        return(s);
    };
    function contract1bytes(settings){
        var s = chalang_compiler.doit(settings);
        //console.log(settings);
        //console.log(JSON.stringify(s));
        var r = s.concat(part1static_bytes());
        return(r);
    };
    function run(code){
        var d = chalang_object.data_maker(
            10000, 10000, 10000, 10000, [], [],
            chalang_object.new_state(0, 0));
        var result = chalang_object.run5(code, d);
        return(result.stack);
    };
    function new_contract_tx(contract_bytes) {
        var ch = scalar_derivative.hash(
            contract_bytes);
        //var cid = binary_derivatives.id_maker(
        //    ch, 2, ZERO, 0);
        var tx = ["contract_new_tx", keys.pub(),
                  ch, fee, 2, ZERO, 0];
        return(tx);
    };

    function buy_veo_offer(
        blocks_till_offer_expires, security_lockup,
        amount_to_buy, cid, salt
    ) {
        //needs to send settings, and ability to make the reusable settings, to p2p_derivatives_explorer.
        var offer = {};
        var block_height = headers_object.top()[1];
        offer.salt = salt;
        offer.start_limit = block_height - 1;
        offer.end_limit = block_height + blocks_till_offer_expires;
        offer.amount1 = security_lockup;
        offer.cid1 = ZERO;
        offer.type1 = 0;
        offer.amount2 = security_lockup + amount_to_buy;
        offer.cid2 = cid;
        offer.type2 = 2;
        offer.acc1 = keys.pub();
        offer.partial_match = false;
        //console.log(JSON.stringify(offer));
        var signed_offer = swaps.pack(offer);
        return(signed_offer);
    };

    function rid_maker(trade_id, their_pub){
        //receipt id maker:
        //HEI = 32,
        //hash:doit(<<T/binary, P/binary, N:HEI>>).
        //assume swap nonce is 1
        var rid = btoa(array_to_string(hash(
            string_to_array(atob(trade_id))
                .concat(string_to_array(atob(their_pub)))
                .concat(integer_to_array(1, 4)))));
        return(rid);
    };
    function evidence_of_no_deposit_address(
        contract1bytes, nonce
    ){
        var cid = make_cid(contract1bytes, 2, ZERO, 0);
        var tx = ["contract_evidence_tx", keys.pub(),
                  nonce, fee, contract1bytes, cid,
                  "", []];
        var timeout_tx =
            ["contract_timeout_tx", keys.pub(),
             nonce+1, fee, cid, 0, 0, 0];
        return([tx, timeout_tx]);
    };
    function make_txs_to_choose_deposit_address(
        deposit_address, contract1bytes, their_pub,
        reusable_settings, trade_id, nonce
    ){
        var contract2bytesv = contract2bytes(
            reusable_settings, deposit_address);
        var ch2 = scalar_derivative.hash(contract2bytesv);
        var cid = make_cid(contract1bytes, 2, ZERO, 0);
        //var ch = scalar_derivative.hash(contract1bytes);
        //var cid = binary_derivatives.id_maker(
        //    ch, 2, ZERO, 0);
        var rid = rid_maker(trade_id, their_pub);
        var sig = keys.raw_sign(string_to_array(deposit_address));
        var evidence = ` binary `
            .concat(sig)
            .concat(` ." `)
            .concat(deposit_address)
            .concat(`" `);
        evidence = chalang_compiler.doit(evidence);
        var new_tx = new_contract_tx(
            contract_2bytesv);
        var tx = ["contract_evidence_tx", keys.pub(),
                  nonce, fee, contract1bytes, cid,
                  evidence, [-6, ["receipts", rid]]];
        var timeout_tx = first_timeout(cid, ch2, nonce+1);
        return([new_tx, tx, timeout_tx]);
    };

    function make_oracle_question(reusable_settings, bitcoin_address){
        //get the deposit address by looking up the contract in the contract_explorer, and looking up the evidence tx from that, and run the evidence in a chalang vm to find out their bitcoin address.
        var s = ` ." BA" Address! Date! Ticker! Amount ! Blockchain ! drop Blockchain @ Address @  Amount @ Ticker @ Date @ oracle_builder `;
        s = reusable_settings
            .concat(contract2)
            .concat(s);
        var s = s.replace("BA", bitcoin_address);
        var bytes = chalang_compiler.doit(s);
        return(run(bytes)[0]);
    };
    function make_cid(bytes, type, Source, SourceType) {
        var ch = scalar_derivative.hash(btoa(array_to_string(bytes)));
        var cid = binary_derivative.id_maker(
            ch, type, Source, SourceType);
        return(cid);
    };
    function resolve_evidence_tx(
        oid, contract2bytes,
        cid1, result, nonce
    ) {
        //get the oid by making the oracle question.
        //providing evidence the second time
        var cid2 = make_cid(contract2bytes, 2, ZERO, 0);
        var evidence2 = chalang_compiler(contract2);
        var prove
        var evidence_tx = [
            "contract_evidence_tx", keys.pub(),
            nonce, fee, contract2bytes, cid2,
            evidence2, [-6 ["oracles", oid]]
        ];
        var timeout_tx = [
            "contract_timeout_tx",keys.pub(),
            nonce+1, fee, cid2, 0, 0, 0];
        var simplify_tx = simplify_tx(cid1, cid2, result, nonce+2);
        return([evidence_tx, timeout_tx, simplify_tx]);
    };
    function matrix(){
        var full = integer_to_array(4294967295, 4);
        var empty = integer_to_array(0, 4);
        var matrix =
            [[full, empty],
             [empty, full]];
        return(matrix);
    };
    function vector(Matrix, result){
        var vector;
        if(result){ vector = Matrix[1];
        } else {    vector = Matrix[2];
        }
    };
    function simplify_tx(CID, CID2, result, nonce) {
        //Tx11 = contract_simplify_tx:make_dict(MP, CID, CID2, 0, Matrix, [Empty, Full], Fee),
        var Matrix = matrix();
        var Vector = vector(Matrix, result);
        var tx = ["contract_simplify_tx", keys.pub(),
                  nonce, fee, CID, CID2,
                  0, Matrix, Vector];
        return(tx);
    };
    function winnings_tx(cid, result, callback){
        var Vector = vector(matrix(), result);
        var result2;
        if(result){  result2 = 1;
        } else {     result2 = 2;
        };
        var sub_account = sub_accounts.normal_key(
            keys.pub(), cid, result2);
        rpc.post(["sub_accounts", sub_account], function(sa) {
            rpc.post(["accounts", keys.pub()], function(acc) {
                var nonce = acc[2] + 1;
                var amount = sa[1];
                var tx = [
                    "contract_winnings_tx", keys.pub(),
                    nonce, fee, cid, amount, sub_account,
                    keys.pub(), Vector, 0];
                return(callback(tx));
            });
        });
    };
    function contract_evidence_proof(Matrix) {
        var v1 = Matrix[0][0];
        return([-7,"DuuMB6kmlzrtq7xvpJZC01BrGSojmrRIiQH+n9oU2cM=","cqT6NUTkOoNv/LJozgbM28VdRNXmsbHBkhalPqmDAf0=",[-6,[-7,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","69C/42A2nzhjBR3hE6PxPhdn/FY060N1dMOt2RIVMVo=","/0URezACy63B5htZN80FCOUC1ZyUPvbLaCwqIV3LP80=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="]]]);
    };
    function first_timeout(CID, CH2, nonce) {
        var Matrix = matrix();
        var proofs = contract_evidence_proof(Matrix);
        var tx = ["contract_timeout_tx", keys.pub(),
                  nonce, fee, CID, proofs, CH2,
                  Matrix[0]];
        return(tx);
    };
                      
    function test(){
        var bytes1 = chalang_compiler.doit(contract1);
        //var bytes2 = chalang_compiler.doit(contract2);
        console.log(JSON.stringify(bytes1));
        return([bytes1.length]);//should be 337, 104.
        //is 215, 264
    };


    return({
        set_fee: function(x) { fee = x; },
        test: test,

        settings: settings,
        reusable_settings: reusable_settings,
        contract2bytes: contract2bytes,
        contract1bytes: contract1bytes,
        
        buy_veo_offer: buy_veo_offer,
        choose_deposit_address_tx: make_txs_to_choose_deposit_address,
        evidence_of_no_deposit_address: evidence_of_no_deposit_address,
        oracle_question: make_oracle_question,
        resolve_evidence_tx: resolve_evidence_tx,
        winnings_tx: winnings_tx,
        make_cid: make_cid
    });
})();
