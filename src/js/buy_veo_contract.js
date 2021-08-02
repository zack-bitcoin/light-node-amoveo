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
hash

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
  ." address " r> ++ ++
  ." is an invalid address for that blockchain or has received more than or equal to " r> ++ ++
  ." of " r> ++ ++
  ." before " r> ++ ++
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
  var OID OracleResult OID2 ;
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
        var s = ` int4 OSH ." BLOCKCHAIN" ." AMOUNT" ." TICKERPART" ." DATEPART"  `;
        s = s.replace("OSH", oracle_start_height)
            .replace("BLOCKCHAIN", blockchain)
            .replace("AMOUNT", amount)
            .replace("TICKERPART", ticker)
            .replace("DATEPART", date);
        return(s);
    };
    function contract2bytes(
        reusable_settings, bitcoin_address
    ){
        var s = ` ." ADDRESS" ID2 call `;
        s = s.replace("ADDRESS", bitcoin_address)
            .replace("ID2", part2id());
        s = reusable_settings.concat(s);
        s = chalang_compiler.doit(s);
        return(s);
    };
    function part2id(){
        var code = contract2.concat(` part2 `);
        var bytes = chalang_compiler.doit(code);
        //console.log(JSON.stringify(bytes));
        return(" binary ".concat(btoa(array_to_string(run(bytes)[0].slice(1)))));
    };
    function part1static_bytes(){
        //error here. it is including all of part2 instead of just the id.
        var s = ` macro part2 `
            .concat(part2id()) //currently is this: [binary,175,253,78,9,75,163,111,26,134,13,23,56,91,85,6,12,230,0,96,60,129,52,162,153,129,12,234,64,108,186,152,132].
        //needs to be changed to valid chalang code.
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
            100000, 100000, 10000, 10000, [], [],
            chalang_object.new_state(0, 0));
        var result = chalang_object.run5(code, d);
        return(result.stack);
    };
    function new_contract_tx(ch) {
        //var ch = scalar_derivative.hash(
        //    contract_bytes);
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
                  nonce, fee,
                  btoa(array_to_string(contract1bytes)), cid,
                  "", [-6]];
        var timeout_tx =
            ["contract_timeout_tx2", keys.pub(),
             nonce+1, fee, cid, 0, 0, 0, 0];
        return([tx, timeout_tx]);
    };
    function make_txs_to_choose_deposit_address(
        deposit_address, contract1bytes, their_pub,
        reusable_settings, trade_id, nonce
    ){
        var ch = btoa(array_to_string(
            hash(contract1bytes)));
        var cid = make_cid(contract1bytes, 2, ZERO, 0);
        var rid = rid_maker(trade_id, keys.pub());
        var sig = keys.raw_sign(serialize(btoa(deposit_address)));
        var evidence = ` binary `
            .concat(sig)
            .concat(` ." `)
            .concat(deposit_address)
            .concat(`" `);
        evidence = chalang_compiler.doit(evidence);
        //console.log(JSON.stringify(btoa(array_to_string(evidence))));
        var new_tx = new_contract_tx(ch);
        //contract2bytesv);
        var tx = ["contract_evidence_tx", keys.pub(),
                  nonce, fee,
                  btoa(array_to_string(contract1bytes)), cid,
                  btoa(array_to_string(evidence)),
                  //evidence,
                  [-6, ["receipts", rid]]];
        var timeout_tx = first_timeout(cid, ch, reusable_settings, deposit_address, nonce+1);
        //console.log("about to return from buy veo contract");
        return([new_tx, tx, timeout_tx]);
    };

    function make_oracle_question(reusable_settings, bitcoin_address){
        //get the deposit address by looking up the contract in the contract_explorer, and looking up the evidence tx from that, and run the evidence in a chalang vm to find out their bitcoin address.
        var s = ` ." BA" Address ! Date ! Ticker ! Amount ! Blockchain ! drop Blockchain @ Address @  Amount @ Ticker @ Date @ oracle_builder `;
        s = reusable_settings
            .concat(contract2)
            .concat(s);
        var s = s.replace("BA", bitcoin_address);
        //console.log(s);
        var bytes = chalang_compiler.doit(s);
        var b = run(bytes)[0];
        b = b.slice(1);
        b = array_to_string(b);
        return(b);
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
        var evidence2 = chalang_compiler.doit(contract2);
        var prove
        var evidence_tx = [
            "contract_evidence_tx", keys.pub(),
            nonce, fee,
            btoa(array_to_string(contract2bytes)), cid2,
            btoa(array_to_string(evidence2)),
            [-6, ["oracles", oid]]
        ];
        var timeout_tx = [
            "contract_timeout_tx2",keys.pub(),
            nonce+1, fee, cid2, 0, 0, 0, 0];
        var simplify = simplify_tx(cid1, cid2, result, nonce+2);
        return([evidence_tx, timeout_tx, simplify]);
    };
    /*
    function matrix(){
        var full = integer_to_array(4294967295, 4);
        var empty = integer_to_array(0, 4);
        var matrix =
            [[full, empty],
             [empty, full]];
        return(matrix);
    };
    */
    function vector(Matrix, result){
        var vector;
        if(result === 1){ vector = Matrix[1];
        } else {    vector = Matrix[2];
               }
        return(vector);
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
    async function both_winners(cid){
        const mat = matrix();
        const row1 = mat[1];
        const row2 = mat[2];
        const sid1 = sub_accounts.normal_key(keys.pub(), cid, 1);
        const sid2 = sub_accounts.normal_key(keys.pub(), cid, 2);
        const sa1 = await sub_accounts.arpc(sid1);
        const sa2 = await sub_accounts.arpc(sid2);
        const balance = Math.max(sa1[1], sa2[1]);
        const winnings_tx = [
            "contract_winnings_tx", 0,0,0,
            cid, balance, sid1, keys.pub(),
            proof1(), row1];
        const winnings_tx2 = [
            "contract_winnings_tx", 0,0,0,
            cid, balance, sid2, keys.pub(),
            proof2(), row2];
        return([winnings_tx, winnings_tx2]);
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
    function contract_evidence_proof() {
        return([-7,"DuuMB6kmlzrtq7xvpJZC01BrGSojmrRIiQH+n9oU2cM=","cqT6NUTkOoNv/LJozgbM28VdRNXmsbHBkhalPqmDAf0=",[-6,[-7,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","69C/42A2nzhjBR3hE6PxPhdn/FY060N1dMOt2RIVMVo=","/0URezACy63B5htZN80FCOUC1ZyUPvbLaCwqIV3LP80=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="]]]);
    };
    function first_timeout(CID, CH, reusable_settings, deposit_address, nonce) {
        var Matrix = matrix();
        //console.log(JSON.stringify(Matrix));//[[[255,255,255,255],[0,0,0,0]],[[0,0,0,0],[255,255,255,255]]]

        var proofs = contract_evidence_proof();
        var row = Matrix[1];
        //CID2 = contracts:make_id(CH2, 2, <<0:256>>, 0),
        //var child_cid = binary_derivative.id_maker(
        //    CH2, 2, ZERO, 0);
        var c2b = contract2bytes(
            reusable_settings, deposit_address);
        var CH2 = scalar_derivative.hash(btoa(array_to_string(c2b)));
        //console.log("contract 2 bytes");
        //console.log(JSON.stringify(c2b));
        var child_cid = make_cid(c2b, 2, ZERO, 0);
        var tx = ["contract_timeout_tx2", keys.pub(),
                  nonce, fee, CID, proofs, CH2,
                  row, child_cid];
        return(tx);
    };

    async function get_deposit_address(cid, txs){
        var IP = default_ip();
        var response = {};
        let consensus_state_contract =
            await rpc.apost(["contracts", cid]);
        if(consensus_state_contract === 0){
            //contract doesn't exist in consensus state space.
            //console.log("contract not in consensus space");
            return(response);
        };
        response.consensus_state_contract = consensus_state_contract;
        var result = consensus_state_contract[7];
        if(result === ZERO){
            //console.log("unfinalized contract");
            return(response);
        };
        var sink = consensus_state_contract[10];
        let contract2 = await rpc.apost(["contract", cid], IP, 8091);
        contract2 = contract2[1];
        //console.log(JSON.stringify(contract2));
        let contract_txs;
        if(contract2 === 0){
            contract_txs = [];
        } else if(!(contract2)){
            contract_txs = [];
        } else {
            contract_txs = contract2[5].slice(1);
        };
        contract_txs = await txids_to_txs(contract_txs, []);
        txs = txs.concat(contract_txs);
        //console.log(JSON.stringify(txs));
        var timeout_txs = txs.filter(function(tx){
            return((tx[1][0] === "contract_timeout_tx2") &&
                   (tx[1][4] === cid))
        });
        if((!(contract_txs)) && (txs.length === 0)){
            //console.log("no timeout tx");
            return(response);
        };
        if((timeout_txs.length === 0)){
            //console.log(JSON.stringify(cid));
            //console.log(JSON.stringify(txs));
            //console.log("no timeout tx2");
            return(response);
        };
        var sink2 = timeout_txs[0][1][8];
        if(!(sink === sink2)){
            return(response);
        };
        response.sink = sink;
        evidence_txs = txs.filter(function(tx){
            return((tx[1][0] === "contract_evidence_tx") &&
                   (tx[1][5] === cid));
        });
        var evidence_txs2 = await avalid_evidence_txs(evidence_txs, sink, cid, []);
        if(evidence_txs2.length === 0){
            return(["fail", "could not generate evidence txs"]);
        };
        var evidence_tx = evidence_txs2[0];
        var evidence = evidence_tx[1][6];
        var address = run(string_to_array(atob(evidence))).reverse()[1];
        address = array_to_string(address.slice(1));
        response.address = address;
        return(response);
    };
    async function aspk_prove_facts(prove){
        var s = `macro [ nil ;/
macro , swap cons ;/
macro ] swap cons reverse ;/
[`;
        var b = await aprove_facts2(prove, "");
        console.log(b);
        if(b[0] === "fail"){
            return b;
        };
        var f = s.concat(b);
        var compiled = chalang_compiler.doit(f);
        return(compiled);
    };
    async function aprove_facts2(prove, code){
        
        //prove is [{tree, key}|...]
        //ID = tree2id(Tree, Height),
        //grab `data` from the full node.
        var tree = prove[0][0];
        var id = tree2id(tree);
        var key = prove[0][1];
        var data;
        var dip = default_ip();
        if(dip === "0.0.0.0"){
            data = await rpc.apost([tree, key]);
        } else {
            data = await merkle.arequest_proof(tree, key);
        };
        if(data === "empty"){
            return(["fail", "cannot make a proof"]);
        }
        var data_part;
        if(data === 0){
            data_part = ", int4 0 ";
        } else {
            var SD = merkle.serialize(data);
            data_part = ", binary " + btoa(array_to_string(SD));
        }
        var type_part = "int4 ".concat(id);
        var key_part;
        if(typeof(key) === "number"){
            key_part = ", int4 " + key;
        } else {
            key = string_to_array(atob(key));
            key_part = ", binary " + btoa(array_to_string(key));
        }
        var fact = "[" + type_part + key_part + data_part + "]";
        if (prove.length > 1){
            fact = fact.concat(", ");
            return(aprove_facts2(
                prove.slice(1),
                code.concat(fact)));
        } else {
            return(code.concat(fact).concat("]"));
        }
    };
    async function avalid_evidence_txs(evidence_txs, sink, cid, keepers){
        if(evidence_txs.length === 0) {
            return(keepers);
        };
        var tx = evidence_txs[0];
        var other_txs = evidence_txs.slice(1);
        function callbackwithout(){
            return(avalid_evidence_txs(
                other_txs,
                sink,
                cid,
                keepers));
        };
        function callbackwith(){
            return(avalid_evidence_txs(
                other_txs,
                sink,
                cid,
                keepers.concat([tx])));
        };
        if(!(tx[1][0] === "contract_evidence_tx")){
            console.log("wrong tx type");
            return(callbackwithout());
        };
        if(!(tx[1][5] === cid)){
            console.log("tx for wrong contract");
            return(callbackwithout());
        };
        var contract = string_to_array(atob(tx[1][4]));
        var cid_check = make_cid(contract, 2, ZERO, 0);
        if(!(cid === cid_check)){
            console.log("invalid contract code");
            return(callbackwithout());
        };
        var evidence = string_to_array(atob(tx[1][6]));
        var prove = tx[1][7].slice(1);
        //spk_prove_facts(prove, function(prove_code){
        var prove_code = await aspk_prove_facts(prove);
        if(prove_code[0] === "fail"){
            console.log("cannot make a merkle proof for the contract");
            return(callbackwithout());
        };
        var sink_check = run(evidence.concat(prove_code).concat(contract))[2];
        sink_check2 = binary_derivative.id_maker(btoa(array_to_string(sink_check.slice(1))), 2, ZERO, 0);
        if(!(sink === sink_check2)){
            console.log("invalid contract result");
            return(callbackwithout());
        };
        return(callbackwith());
    };
    async function txids_to_txs(txids, txs){
        if(txids.length === 0){
            return(txs);
        };
        const tx = await rpc.apost(["txs", txids[0]], default_ip(), 8091);
            return(txids_to_txs(
                txids.slice(1),
                [tx[1][3]].concat(txs)));
    };
    function tree2id(name){
        if(name === "accounts"){
            return(1);
        } else if(name === "channels"){
            return(2);
        } else if(name ==="existence"){
            return(3);
        } else if(name ==="oracles"){
            return(4);
        } else if(name === "governance"){
            return(5);
        } else {
            return(0);
        };
    };
    function proof1(){
        return([-7,"DuuMB6kmlzrtq7xvpJZC01BrGSojmrRIiQH+n9oU2cM=","cqT6NUTkOoNv/LJozgbM28VdRNXmsbHBkhalPqmDAf0=",[-6,[-7,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","69C/42A2nzhjBR3hE6PxPhdn/FY060N1dMOt2RIVMVo=","/0URezACy63B5htZN80FCOUC1ZyUPvbLaCwqIV3LP80=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="]]]);
    };
    function proof2(){
        return([-7,"DuuMB6kmlzrtq7xvpJZC01BrGSojmrRIiQH+n9oU2cM=","WYFpPI34PuoW2kKg90j6yymVRmiFRKDCiH7V/78IboY=",[-6,[-7,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","69C/42A2nzhjBR3hE6PxPhdn/FY060N1dMOt2RIVMVo=","/0URezACy63B5htZN80FCOUC1ZyUPvbLaCwqIV3LP80=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="]]]);
    };
    function matrix(){
        var MAX = btoa(array_to_string(integer_to_array(-1, 4)));
        var MIN = btoa(array_to_string(integer_to_array(0, 4)));
        const matrix = [-6, [-6, MAX, MIN],[-6, MIN, MAX]];
        return(matrix);

    };
    async function contract_to_1bytes(contract){
        var address_timeout = contract[4];
        var oracle_start_height = contract[5];
        var blockchain = atob(contract[6]);
        var other_chain_amount = atob(contract[7]);
        var ticker = atob(contract[8]);
        var date = atob(contract[9]);
        var reusable_settings = buy_veo_contract.reusable_settings(oracle_start_height, blockchain, other_chain_amount, ticker, date);
        var tid = contract[10];
        var trade_nonce = 1;//otherwise get it from the swap offer?
        var settings = buy_veo_contract.settings(reusable_settings, address_timeout, trade_nonce, tid);
        var contract1bytes = buy_veo_contract.contract1bytes(settings);
        return(contract1bytes);
    };
    async function verified_p2p_contract(cid){
        //gets the contract data from the p2p derivatives server.
        //checks a merkle proof to know this data is correct.
        let p2p_contract = await rpc.apost(["read", 3, cid], default_ip(), 8090);
        if(p2p_contract === 0){
            console.log("no contract");
            return(0);
        };
        if(!(p2p_contract[0] === "contract")){
            console.log("wrong type");
            return(0);
        };
        var contract1bytes = await contract_to_1bytes(p2p_contract);
        var cid2 = make_cid(contract1bytes, 2, ZERO, 0);
        var cid3 = p2p_contract[1];
        if((!(cid === cid2)) ||
           (!(cid === cid3))){
            console.log("got bad contract data from the server");
            console.log(JSON.stringify(p2p_contract));
            console.log(cid);
            console.log(cid2);
            console.log(cid3);
            return(0);
        };
        return(p2p_contract);
    };
        

    function test(){
        var bytes1 = chalang_compiler.doit(contract1);
        //var bytes2 = chalang_compiler.doit(contract2);
        console.log(JSON.stringify(bytes1));
        return([bytes1.length]);//should be 337, 104.
        //is 215, 264
    };
    


    return({
        //exposed for testing only.
        test: test,
        run: run,
        part2id: part2id,
        part1static_bytes: part1static_bytes,
        winnings_tx: winnings_tx,
        simplify_tx: simplify_tx,

        //configuration
        set_fee: function(x) { fee = x; },

        //functions we use.
        settings: settings,
        reusable_settings: reusable_settings,
        contract2bytes: contract2bytes,
        contract1bytes: contract1bytes,
        buy_veo_offer: buy_veo_offer,
        choose_deposit_address_tx: make_txs_to_choose_deposit_address,
        evidence_of_no_deposit_address: evidence_of_no_deposit_address,
        oracle_question: make_oracle_question,
        resolve_evidence_tx: resolve_evidence_tx,
        make_cid: make_cid,
        new_contract_tx: new_contract_tx,
        get_deposit_address: get_deposit_address,
        proof1: proof1,
        proof2: proof2,
        matrix: matrix,
        contract_to_1bytes: contract_to_1bytes,
        verified_p2p_contract: verified_p2p_contract,
        both_winners: both_winners
    });
})();
