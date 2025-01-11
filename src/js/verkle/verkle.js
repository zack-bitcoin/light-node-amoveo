var verkle = (function(){
    var Extended = nobleEd25519.ExtendedPoint;
    //from get2.erl
    function compressed_points_list(x){
        var is_array = (x instanceof Array);
        if(is_array){
            if((x.length === 2)&&
               (typeof(x[0]) === 'number')&&
               (typeof(x[1]) === 'string')){
                //console.log(x);
                //a leaf
                return([x[1]]);
            };
            if((x.length === 2) &&
               (typeof(x[0]) === 'number')){
                return([]);
            };
            if(x.length === 0){
                return([]);
            };
            var h = compressed_points_list(x[0]);
            var t = compressed_points_list(x.slice(1));
            return(h.concat(t));
        };
        var is_string = (typeof(x) === 'string');
        if(is_string){
            var s = atob(x);
            var a = verkle_binary.string_to_array(s);
            if(a.length === 32){
                return([x]);
            } else {
                return([]);
            }
        };
        return([]);
    };
    //from get2.erl
    function index2domain(zs){
        var r = [];
        for(var i = 0; i<zs.length; i++){
            r.push(BigInt(zs[i]) + 1n);
        };
        return(r);
    };
    //get2
    function split3parts(l){
        var a = [];
        var b = [];
        var c = [];
        for(var i = 0; i < l.length; i++){
            a.push(l[i][0]);
            b.push(l[i][1]);
            c.push(l[i][2]);
        };
        return([a, b, c]);
    };
    //verify2
    function fill_points(pts, tree, result){
        //console.log("fill points\n");
        //console.log(pts);
        if(tree.length === 0){
            //console.log("finished filling points");
            return([result.reverse(), pts]);
        };
        if((tree[0] instanceof Array)&&
           (tree[0].length === 2)&&
           (tree[0][1] instanceof Array)&&
           (tree[0][1].length === 2)&&
           (typeof(tree[0][0]) === 'number')
          ){
            return(fill_points(
                pts, tree.slice(1),
                [tree[0]].concat(result)));
        }
//        if((pts.length === 0)){
//            console.log("ran out of points");
//            console.log([tree, result]);
//            1+1n;
//        };
           
        if((tree[0] instanceof Array)&&
           (tree[0].length === 2)&&
           (typeof(tree[0][0]) === 'number')&&
           (typeof(tree[0][1]) === 'string')
          ){
            if((pts.length === 0)){
                console.log("ran out of points");
                console.log([tree, result]);
                1+1n;
            };
            return(fill_points(
                pts.slice(1), tree.slice(1),
                [[tree[0][0], pts[0]]]
                    .concat(result)));
        };
        if(tree[0] instanceof Array){
            var [t2, ps2] = fill_points(
                pts, tree[0], []);
            return(fill_points(ps2, tree.slice(1),
                               t2.concat(result)));
        };
        if(typeof(tree[0]) === 'string'){
            if((pts.length === 0)){
                console.log("ran out of points");
                console.log([tree, result]);
                1+1n;
            };
            var s = atob(tree[0]);
            var a = verkle_binary.string_to_array(s);
            return(fill_points(
                pts.slice(1),
                tree.slice(1),
                [pts[0]].concat(result)));
        };
        return(fill_points(pts, tree.slice(1),
                           [tree[0]].concat(result)));
    };
    function leaf_hash(key, val){
        if(!((typeof(key) === "string"))){
            1+1n;
        };
        if(!((typeof(val) === "string"))){
            1+1n;
        };
        //var key2 = verkle_binary.string_to_array(atob(key));
        //var val2 = verkle_binary.string_to_array(atob(val));
        var key2 = key;
        var val2 = val;
        var leaf = key2.concat(val2);
        var h = verkle_hash(leaf);
        var n = verkle_binary.array_to_int(h);
        var result = (n % fr.order());
        return(result);
    };
    function unfold(root, rest, r){
        if(!(rest)){
            console.log("error, rest does not exist.");
            1+1n;
            return(0);
        }
        //empty case
        if((rest instanceof Array) &&
           (rest.length === 2) &&
           ((rest[1] === 0n)||
            (rest[1] === 0))){
            console.log("empty case");
            var result = [[root, rest[0], 0n]]
                .concat(r);
            return(result.reverse());
        };
        //leaf case
        if((rest instanceof Array) &&
           (rest.length === 2) &&
           (typeof(rest[0]) === 'number') &&
           (rest[1] instanceof Array) &&
           (rest[1].length === 2)){
            var key = rest[1][0];
            var val = rest[1][1];
            var lh = leaf_hash(key, val);
            var result = [[root, rest[0], lh]]
                .concat(r);
            return(result.reverse());
        };
        //stem case
        if((rest instanceof Array) &&
           (rest[0] instanceof Array) &&
           (rest[0].length === 2) &&
           (rest[0][1] instanceof Extended)
          ){
            var p = rest[0][1];
            var sh = points.hash(p);
            return(unfold(p, rest.slice(1),
                          [[root, rest[0][0], sh]]
                          .concat(r)));
        };
        //finished this sub-branch case.
        if((rest instanceof Array) &&
           (rest.length === 0)){
            return([]);
        };
        //2 sub-branches to unfold case.
        if((rest instanceof Array)){
            var h = rest[0];
            var j = rest.slice(1);
            var first = unfold(root, h, r);
            var second = unfold(root, j, []);
            return(first.concat(second));
        };
        console.log("unfold failure. unhandled case");
        console.log(rest);
        return("error");
    };
    function decompress_proof(open0, tree0, commitg0){
        //verify_verkle:decompress_proof
        var cpl = compressed_points_list(tree0);
        if(cpl.length === 0){
            console.log("error, nothing to prove");
            1+u1;
            return("error");
        };
        var list = [commitg0].concat(cpl);
        //console.log(list);
        //console.log(points.compressed2affine_batch([commitg0]));
        var list1 = points.compressed2affine_batch(list);
        //console.log(list1);
        if(list1[0][0] === "error"){
            console.log("error, invalid commit point in proof");
            console.log(commitg0);
            console.log(list1[0]);
            console.log(points.compressed2affine(commitg0));
            console.log(points.compressed2affine_batch([commitg0]));
            1+u1;
            return("error");
        };
        var list2 = points.affine2extended(list1);
        var commitg = list2[0];
        var decompressed = list2.slice(1);
        var tree;
        if(decompressed.length === 0) {
            tree = tree0;
        } else {
            tree = fill_points(
                decompressed, tree0, [])[0];
        }
        var root1 = decompressed[0];
        var open = open0.map(function(x){
            return(verkle_binary.array_to_int(
                verkle_binary.string_to_array(x)));
        });
        return([tree, open, root1, commitg]);
    };
    function trees2_to_keys(l) {
        return(l.map(function(x){return(trees2_key(x))}));
    };
    function a2as(x){
        //byte array to ascii
        return(btoa(verkle_binary.array_to_string(x)));
    };
    function as2a(x){
        //ascii to byte array
        return(verkle_binary.string_to_array(atob(x)));
    };
    function whash(x){
        //byte array to ascii
        return(a2as(verkle_hash(x)));
    };
        
    function trees2_key(x) {
        //todo, other keys besides acc.
        var key;
        if(x.length === 2){
            return(x[1]);
        };
        if(x[0] === "acc"){
            var pub = x[3];
            var pub2 = trees2_compress_pub(pub);
            //return(verkle_hash(string_to_array(atob(pub2))));
            return(whash(pub2));
        };
        if(x[0] === "oracle"){
            var id = x[1];
            var s = as2a(id).concat([0]);
            return(whash(s));
        };
        if(x[0] === "matched"){
            var acc = x[1];
            var acc2 = trees2_compress_pub(acc);
            var oracle = x[2];
            var s = as2a(acc2)
            var s = acc2.concat(as2a(oracle)).concat([1]);
            return(whash(s));
        };
        if(x[0] === "unmatched_head"){
            //var head = x[1];
            //var many = x[2];
            var oid = x[3];
            var s = as2a(oid).concat([2]);
            return(whash(s));
        };
        if(x[0] === "unmatched"){
            var acc = x[1];
            var oracle = x[2];
            var acc2 = trees2_compress_pub(acc);
            if(JSON.stringify(acc2) === JSON.stringify([
                0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,1])){
                var s = as2a(oracle).concat([2]);
                return(whash(s));
            }
            var s = acc2.concat(as2a(oracle)).concat([3]);
            return(whash(s));
        };
/*        if(x[0] === "oracle_bets"){
            //var t = x[1];
            //var f = x[2];
            //var b = x[3];
            var id = x[4];
            var s = as2a(id);
            return(whash(s));
        };
        if(x[0] === "orders"){
            var aid = x[1];
            var s = as2a(aid);
            return(whash(s));
        };
*/
        //if(x[0] === "sub_acc"){
        if(x[0] === "sub_acc"){
            //sub_accounts:make_key(P, CID, T);%65+32+32 = 129 bytes
            var pubkey = x[3];
            var type = x[5];
            var cid = x[4];
            
            var s = as2a(pubkey).concat(as2a(cid)).concat(integer_to_array(type, 32));
            return(whash(s));
        };
        if(x[0] === "contract"){
            var code = x[1];
            var many_types = x[2];
            var source = x[8];
            var source_type = x[9];
            var s = as2a(code)
                .concat(as2a(source))
                .concat(integer_to_array(many_types, 2))
                .concat(integer_to_array(source_type, 2));
            return(whash(s));
    //contracts:make_id(C, MT, S, ST);%32+32+2+2 = 68 bytes.
        };
        if(x[0] === "trade"){
            var value = x[2];
            var s = as2a(value).concat([6]);
            return(whash(s));
        };
        if(x[0] === "market"){
            var id = x[1];
            var s = as2a(id).concat([7]);
            return(whash(s));
        };
        if(x[0] === "receipt"){
            var id = x[1];
            var s = as2a(id).concat([8]);
            return(whash(s));
        };
        console.log(x);
        1+u1;
    };
    function trees2_compress_pub(pub){
        //ascii -> array of bytes.
        var p_1_264 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB";
        var p_1_520 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE=";
        var p_0_520 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
        var p_0_264 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        if((pub === p_1_264) || (pub === p_1_520)){
            return p_1_264;
        };
        if((pub === p_0_264) || (pub === p_0_520)){
            return p_0_264;
        };
        var pub2 = string_to_array(atob(pub));
        if((pub2.length == 65) && (pub2[0] === 4)){
            var x = pub2.slice(1, 33);
            //var y = array_to_int(pub2.slice(33));
            var y = array_to_int(pub2.slice(64));
            var positive = y % 2;
            return([(6+positive)].concat(x));
        }
        1+u1;
    };
    function trees2_serialize(x) {
            //returns an array of bytes
        if(x[0] === "acc"){
            //need pubkey, nonce, and balance.
            var balance = integer_to_array(x[1], 8);
            var nonce = integer_to_array(x[2], 4);
            var pub = x[3];
            var pub2 = trees2_compress_pub(pub);
            //console.log(pub2);
            //var pub3 = string_to_array(atob(pub2));
    //<<Pub2/binary, Balance:64, Nonce:32>>;
            return(pub2.concat(balance).concat(nonce));
        };
        if(x[0] === "oracle"){
            var id = x[1];
            var result = x[2];
            var question = x[3];
            var starts = x[4];
            var type = x[5];
            var creator = x[8];
            var done_timer = x[9];
            var orders_hash = x[7];

            var creator2 = trees2_compress_pub(creator);
            var s = as2a(id)
                .concat([result])
                .concat([type])
                .concat(verkle_binary.integer_to_array(starts, 4))
                .concat(verkle_binary.integer_to_array(done_timer, 4))
                .concat(creator2)
                .concat(as2a(question))
                .concat(as2a(orders_hash));
            return(s);
        };
        if(x[0] === "matched"){
            var account = x[1];
            var oracle = x[2];
            var t = x[3];
            var f = x[4];
            var bad = x[5];

            var a2 = trees2_compress_pub(account);
            var s = a2
                .concat(as2a(oracle))
                .concat(verkle_binary.integer_to_array(t, 8))
                .concat(verkle_binary.integer_to_array(f, 8))
                .concat(verkle_binary.integer_to_array(bad, 8));
            return(s);
        };
        if(x[0] === "unmatched"){
            var account = x[1];
            var oracle = x[2];
            var amount = x[3];
            var pointer = x[4];

            var a2 = trees2_compress_pub(account);
            var p2 = trees2_compress_pub(pointer);
            var s = a2
                .concat(as2a(oracle))
                .concat(verkle_binary.integer_to_array(amount, 8))
                .concat(p2);
            return(s);
        };
        if(x[0] === "unmatched_head"){
            var head = x[1];
            var many = x[2];
            var oid = x[3];

            var zero8 = [0,0,0,0,0,0,0,0];
            var zero16 = zero8.concat(zero8);
            var zero32 = zero16.concat(zero16);
            var zero64 = zero32.concat(zero32);
            var zero65 = zero64.concat([0]);

            var head2 = trees2_compress_pub(head);

            var s = zero65
                .concat(as2a(oid))
                .concat(verkle_binary.integer_to_array(many, 8))
                .concat(head2);
            return(s);
        };
        if(x[0] === "sub_acc"){
            var balance = x[1];
            var nonce = x[2];
            var pubkey = x[3];
            var cid = x[4];
            var type = x[5];

            var p2 = trees2_compress_pub(pubkey);
            var s = verkle_binary.integer_to_array(balance, 8)
                .concat(verkle_binary.integer_to_array(nonce, 4))
                .concat(verkle_binary.integer_to_array(type, 4))
                .concat(p2)
                .concat(as2a(cid));
            return(s);
        };
        if(x[0] === "contract"){
            var code = x[1];
            var many_types = x[2];
            var nonce = x[3];
            var lm = x[4];
            var delay = x[5];
            var closed = x[6];
            var result = x[7];
            var source = x[8];
            var source_type = x[9];
            var sink = x[10];
            var volume = x[11];

            var s = as2a(code)
                .concat(as2a(result))
                .concat(as2a(source))
                .concat(as2a(sink))
                .concat(verkle_binary.integer_to_array(source_type, 2))
                .concat(verkle_binary.integer_to_array(many_types, 2))
                .concat(verkle_binary.integer_to_array(nonce, 4))
                .concat(verkle_binary.integer_to_array(delay, 4))
                .concat([closed])
                .concat(verkle_binary.integer_to_array(volume,8));
            return(s);
        };
        if(x[0] === "trade"){
            var height = x[1];
            var value = x[2];

            var s = as2a(value)
                .concat(verkle_binary.integer_to_array(height,4));
            return(s);
        };
        if(x[0] === "market"){
            var id = x[1];
            var c1 = x[2];
            var t1 = x[3];
            var a1 = x[4];
            var c2 = x[5];
            var t2 = x[6];
            var a2 = x[7];
            var shares = x[8];
            var s = as2a(id)
                .concat(as2a(c1))
                .concat(as2a(c2))
                .concat(verkle_binary.integer_to_array(t1, 2))
                .concat(verkle_binary.integer_to_array(t2, 2))
                .concat(verkle_binary.integer_to_array(a1, 8))
                .concat(verkle_binary.integer_to_array(a2, 8))
                .concat(verkle_binary.integer_to_array(shares, 8));
            return(s);
        };
        if(x[0] === "receipt"){
            var tid = x[2];
            var pub = x[3];
            var nonce = x[4];

            var p2 = trees2_compress_pub(pub);
            var s = as2a(tid)
                .concat(p2)
                .concat(verkle_binary.integer_to_array(nonce, 4));
            return(s);
        };
        1+1n;
    };
    function restore_leaves_proof(proofs, leaves) {
        //a clone of the function from trees2.erl

//restore_leaves_proof([], T) -> {[], T};
        if((proofs instanceof Array) &&
           ((proofs.length) === 0)) {
            //console.log("restore leaves case 1");
            return([[], leaves]);
        };
//restore_leaves_proof([{I, 0}], T) -> 
//    {[{I, 0}], T};
        if((proofs instanceof Array) &&
           ((proofs.length) === 1) &&
           ((proofs[0] instanceof Array)) &&
           ((proofs[0].length === 2)) &&
           ((proofs[0][1] === 0))){
            //console.log("restore leaves case 2");
            return([[proofs[0][0], 0], leaves]);
        };
//restore_leaves_proof(X, [{Tree, K}|T]) ->
//% skip empty slot
//    restore_leaves_proof(X, T);
        if((leaves instanceof Array) &&
           (leaves[0] instanceof Array) &&
           (leaves[0].length === 2)){
            //console.log("restore leaves case 3 - skip empty slot");
            //console.log(proofs);
            //console.log(leaves);
            //console.log(leaves[0]);
            return(restore_leaves_proof(proofs, leaves.slice(1)));
        };
//restore_leaves_proof(X, L) when is_integer(X) ->
//    {X, L}.
        if(Number.isInteger(proofs)){
            //console.log("restore leaves case 7");
            return([proofs, leaves]);
        };
        /*
restore_leaves_proof([{I, 1}], [L|T]) -> 
    case L of
        {Tree, Key} -> 
            {[{I, 0}], T};
        _ -> 
            V = hash:doit(serialize(L)),
            K = key(L),
            {[{I, {K, V}}], T}
    end;
        */
        if(//(leaves.length > 0) &&
           (proofs instanceof Array) &&
           ((proofs.length) === 1) &&
           ((proofs[0] instanceof Array)) &&
           ((proofs[0].length === 2)) &&
                ((proofs[0][1] === 1))){
            if(leaves.length === 0){
                //console.log(proofs);
                1+1n;
            };
            var l = leaves[0];
            var t = leaves.slice(1);
            if((l instanceof Array) &&
               (l.length === 2)){
                //console.log("restore leaves case 4");
                return([[[proofs[0][0], 0]], t]);
            };
            //console.log("restore leaves case 5");
            var v = btoa(verkle_binary.array_to_string(verkle_hash(trees2_serialize(l))));
            var k = trees2_key(l);
            var i = proofs[0][0];
            //console.log([i, k, v]);
            return([[[i, [k, v]]], t]);
        };
        
        /*
restore_leaves_proof(Proofs, Leaves) 
  when is_tuple(Proofs) -> 
    {Proofs2, Leaves2} = 
        restore_leaves_proof(
          tuple_to_list(Proofs), Leaves),
    {list_to_tuple(Proofs2), Leaves2};
restore_leaves_proof([H|T], L) -> 
    {H2, L2} = restore_leaves_proof(H, L),
    {T2, L3} = restore_leaves_proof(T, L2),
    {[H2|T2], L3};
        */
        if((proofs instanceof Array) &&
           (proofs.length > 0)) {
            //console.log("restore leaves case 6");
            //console.log(proofs);
            var [h2, leaves2] =
                restore_leaves_proof(
                    proofs[0], leaves);
            var [t2, leaves3] =
                restore_leaves_proof(
                    proofs.slice(1), leaves2);
            return([([h2]).concat(t2), leaves3]);
        };
        /*
restore_leaves_proof(<<X:256>>, L) ->
    {<<X:256>>, L};
        */
        if(typeof(proofs) === "string"){
            //console.log("restore leaves case 8");
            return([proofs, leaves]);
        }
        return(0);
    };
    function verify(root0, proof, things){
        //trees2:verify_proof
        var proof2 = restore_leaves_proof(proof, things)[0];
        //console.log(proof);
        //console.log("after restore leaves proof");
        //console.log(things);
        //console.log(proof2[0]);
        var bool = verkle_verify(root0, proof2);

        if(!(bool[0] === true)){
            console.log("invalid verkle proof.");
            1+u1;
        };
        var leaves = bool[1];
        var proof_tree = bool[2];
        var ks = trees2_to_keys(things);

        var hs = things.map(function(a){
            if((a instanceof Array) &&
               (a.length === 2) &&
               (typeof(a[0]) === "string")){
                return(0);
            } else {
                return(verkle_hash(trees2_serialize(a)));
            };
        });

        var khs = ks.map(function(e, i){return([e, btoa(verkle_binary.array_to_string(hs[i]))])});
        //console.log("about to merge same khs leaves");
        //console.log(ks);
        //console.log(khs);//[ "6h7+94mc26FqSZo8RSBePvAq+xAIbUMNNXHe7+0WfQE=", "wVzPc8b2RYTElEJKvIn/bFLIJxJ2GM0edU2l5doba4E=" ] //comes from the input of the expected output. This is the part that is broken.
        //console.log(leaves);//[ 135, [ "4LIGFLcXPe9xpULOZa/bQL4v8PKjFeVS2pH3BaYZh6U=", "4Iw4u+HBpcGeQH1Pr5zKnwhbyB7aXAKqwj/DWo0/wks=" ] //comes from verkle_verify

        /*
          example normal
[
  "okdweey0xMzUYFiC5WCiPM8xY77bpKZy5F/sC0umFI4=",
  "Uher0xi6fGO9Mzy6fQ635tUCH953fyZ09ayPShbBA1M="
]
[20, [
"okdweey0xMzUYFiC5WCiPM8xY77bpKZy5F/sC0umFI4=",
"Uher0xi6fGO9Mzy6fQ635tUCH953fyZ09ayPShbBA1M="
]
]
         */
        var is_valid = merge_same(khs, leaves);
        return([is_valid, proof_tree]);
    };
    function merge_same_unfinished(need, got){
        if((need.length === 0) &&
           (got.length === 0)){
            //console.log("merge same done");
            return(true);
        }
        const D_is_num = Number.is_integer(D);
        const X = need[0];
        const Dpair = got[0];
        const D = Dpair[0];
        const X2 = Dpair[1];
        if((X === X2) && (D_is_num)){
            //merge same case 1
            return(merge_same(need.slice(1),
                              got.slice(1)))
        };
        const KeyCheck = X[1];
        if((KeyCheck === 0) && (X2 === 0)){
            //merge same case 3
            const Key = X;
            const Key2 = leaf_verkle_path_maker(Key);
            const Branch = D;
            if(typeof(Branch) === 'number'){
                Branch = [Branch];
            };
            var bool = starts_same(
                Key2.slice().reverse(), branch.slice());
            if(bool){
                return(merge_same(
                    need.slice(1),
                    [[branch, 0]].concat(t2)));
            } else {
                return(merge_same(
                    [[Key, 0]].concat(need.slice(1)),
                    got.slice(1)));
            }
            ///
        };
        const Key = X[0];
        const LKey = X2[0];
        const Val = X2[1];
        if(D_is_num && (KeyCheck === 0)){
            //case 2
            const LKey = D;
            const Val = X2


            ////

        };
        if(X2 === 0){
            //case 4. nothing left to match on this branch
            return(merge_same(need, got.slice(1)));
        };
        if(D_is_num && is_string(X2[0]) && is_string(X2[1])){
            // case 5.
            //nothing left to match with this leaf. maybe it was from an empty branch.
            return(merge_same(need, got.slice(1)));
        }

        print("merge same failed")
        u1 + 0;

    };
    function merge_same(need, got){
        //from trees2
        //need and got are Arrays.
        if((need.length === 0) //&&
         //  (got.length === 0)
          ){
            return(true);
        };
        //console.log("verkle merge same");
        //console.log(need);
        //console.log(got);
        //([X|T1], T2 = [{D, X}|_]) when is_integer(D)
        if(!(got[0])){
            console.log("dont' got got!");
            console.log(need);
            console.log(got);
            return(-1);
        }
        if((need[0][0] === got[0][1][0]) &&
           Number.isInteger(got[0][0])){
            //console.log("merge same case 1");
            return(merge_same(need.slice(1), got));
        };
//[{Key, 0}|T1],[{D, {LKey, Val}}|T2] when is_integer(D)
        if((need[0][1] === 0) &&
           (got[0].length === 2) &&
           (got[0][1].length === 2) &&
           (Number.isInteger(got[0][0]))){
            //console.log("merge same case 2");
            var key = need[0][0];
            var d = got[0][0];
            var lkey = got[0][1][0];
            var val = got[0][1][1];
            var t2 = got.slice(1);

            var key2 = leaf_verkle_path_maker(key);
            var lkey2 = leaf_verkle_path_maker(lkey);

            if(key === lkey){
                console.log("can't double store in a batch");
                1 + u1;
            };
            var ssd = starts_same_depth(
                key2.slice().reverse(), lkey2.slice().reverse(), d);
            if(ssd === true){
                return(merge_same(
                    need.slice(1),
                    ([[d, [lkey, val]]]).concat(t2)));
            };
            if(ssd === "skip"){
                return(merge_same([[key, 0]].concat(t1), t2));
            };
            if(ssd === false){
                1 + u1;
            }
            1+ 1n;
        };
//[{Key, 0}|T1], [{Branch, 0}|T2]
        if(((need[0][1] === 0) || (need[0][1] === "")) &&
           (got[0][1] === 0)){
            //console.log("merge same case 3");
            //console.log(need);
            //console.log(got);
            var key = need[0][0];
            var key2 = leaf_verkle_path_maker(key);
            var branch = got[0][0];
            if(typeof(branch) === 'number'){
                branch = [branch];
            };
            //console.log(key2);
            //console.log(branch);
            var bool = starts_same(
                //key2, branch.slice().reverse());
                key2.slice().reverse(), branch.slice());
            if(bool){
                //console.log("started same");
                return(merge_same(
                    need.slice(1),
                    [[branch, 0]].concat(t2)));
            } else {
                //console.log("did not start same");
                return(merge_same(
                    [[key, 0]].concat(need.slice(1)),
                    got.slice(1)));
            }
        };
        if(got[0][1] === 0){
            //nothing left to match on this branch.
            //console.log("merge same case 4");
            merge_same(need, got.slice(1));
        };
        if((got[0][1].length === 2) &&
           (Number.isInteger(got[0][0])) &&
           (typeof(got[0][1][0]) === "string") &&
           (typeof(got[0][1][1]) === "string")){
               //nothing left to match on this leaf
            //console.log("merge same case 5");
            merge_same(need, got.slice(1));
        };
        console.log("merge same uncaught situation");
        console.log([need, got]);
    };
    function starts_same(key, branch){
        //check that the first part of key completely matches branch, one byte at a time.
        //return true or false
        if(branch.length === 0){
            return(true);
        };
        if(branch[0] === key[0]){
            return(starts_same(key.slice(1), branch.slice(1)));
        };
        return(false);
    };
    function starts_same_depth(key1, key2, d){
        //check that the first part of key1 completely matches the first part of key2. check d many bytes.
        //return true or false or skip.
        // when a mismatch is found within D, if key2 has a lower valued byte than key1, return skip. if key1 is lower, then return false. if they match up to d, then return true.
        if(d < 1){
            return(true);
        };
        if(key1[0] === key2[0]){
            return(starts_same_depth(key1.slice(1),key2.slice(1), d-1));
        };
        if(key2[0] < key1[0]){
            return("skip");
        };
        return(false);
    };
    function leaf_verkle_path_maker(s) {
        if(Number.isInteger(s)){
            var a = verkle_binary.integer_to_array(s, 32);
        //the erlang version had a list of bytes, this is a list of integers.
            return(a);
        };
        return(verkle_binary.string_to_array(atob(s)));
    };
    function verkle_verify(root0, proof){
        //this is like verify in the verkle repository.
        var [tree0, commitg0, open0] = proof;
        //console.log("verkle verify");
        //console.log(commitg0);
        var [tree, open, root1, commitg] =
            decompress_proof(open0, tree0, commitg0);
        //1 + 1n;
        //console.log("tree is");
        //console.log(tree);
        //console.log(tree0);
        //tree should be [rootpoint, {0, pt},[{186, pt},{115, l}], [{187, pt}, {115, l}],[{188, pt}, {115, l}]]
        var root = tree[0];
        var rest = tree.slice(1);//rest has lists of bytes, when it should have base64 encoded strings.

        //var proof2 = restore_leaves_proof(rest, leaves)[0];

        var domain = precomputes.domain();
        if(!((points.hash2(root)) === root0)){
            console.log([root, root0]);
            console.log(points.hash2(root));
            console.log("verify fail unequal roots 0");
            return([false]);
        };
        if(!(points.eq(root1, root))){
            console.log("verify fail unequal roots 1");
            return([false]);
        };
            //rest should be [{0, pt},[{186, pt},{115, l}], [{187, pt}, {115, l}],[{188, pt}, {115, l}]]
        //return(0);
        console.log("verify about to unfold");
        var tree2 = unfold(root, rest, []);
        //console.log(tree2);//[[pt, int, bigint], ...]
        //1 + 1n;
        //var tree2 = unfold(root, proof2, []);
        var [commits, zs0, ys] = split3parts(tree2);
        var zs1 = index2domain(zs0);
        var zs = zs1.map(function(x){
            return(fr.encode(x));});
        //console.log(zs[0]);
        //console.log([commitg, open, commits, zs, ys]);
        // point, 256 ints, 6 points, 6 ints, 6 ints
        //1+1n;
        var b2 = multiproof.verify(
            //[commitg, open0], commits, zs1, ys);
            [commitg, open], commits, zs, ys);
        if(!(b2)){
            console.log("verify fail, multiproof verify");
            return([false]);
        };
        return([true, leaves(rest), tree]);

    };
    function leaves(r){
        if(!(r instanceof Array)){
            console.log("leaves error");
            console.log(r);
            1+1n;
            return("error");
        };
        //all done
        if((r.length === 0)){
            return([]);
        };
        //empty leaf
        if((r.length === 2) &&
           (r[1] === 0)
        ){
            return([r]);
        };
        //ignore a stem
        if((r.length === 2) &&
           (r[1] instanceof Extended)
           //(typeof(r[1]) === 'string')
          ){
            return([]);
        };
        //normal leaf
        if((r.length === 2) &&
           (typeof(r[0]) === 'number') &&
           (r[1] instanceof Array) &&
           (r[1].length === 2) &&
           (typeof(r[1][0]) === 'string') &&
           (typeof(r[1][1]) === 'string')){
            return([r]);
        };
        return(leaves(r[0]).concat(
            leaves(r.slice(1))));
    };
    function test(){
        var root = "kw9EIb+hCX0VL5MAcv4tdLq7UyPEF/wHBV2Nj6FCSGptCA6y0RKWgk7crzvXtKDW9FLFEA6emxCChsCcSShbVSYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZ3mYcSRygmoZh/CTWUvnknDXH9wrz7Cp4K3AuoCP/jk=";
        var proof = [["6khCoY+NXQUH/BfEI1O7unQt/nIAky8VfQmhvyFED5M=",
  [0,
   "bmkaBeVcbgVo0pEwQphowH7zVBP2ZbNDrJQVUElr1AM="],
  [[186,
    "yq6FSYjTIHWv6lB4wo73mZQHpzXhtpxKoBusn0PnPvY="],
   [115,
    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADtzugA=",
     "AAE="]]],
  [[187,
    "OMeg/wTnTkwDgA2Ul0GYYmMndn4ImqAc8cLE1qr2HtM="],
   [115,
    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADtzuwA=",
     "AAI="]]],
  [[188,
    "3tjsZzfLExuaGc4atk8XA0Ff2rVv5syWOcMnYU5rPR0="],
   [115,
    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADtzvAA=",
     "AAM="]]]],
 "HyEcbL5HYPlPIFZn60FMst7JpcRnmLYPfQlFLGwIX50=",
 ["VKCjUVkN2uQeE9SNsI0Bo+/FoYIMpwnAiio4RKTAJgU=",
  "HJBJAkPRpYGIhAaTKxhF7z4zQ06pyWK5AQDgqXptSAM=",
  "DGagIKUinSwQOBhOVjGMGLoZoe6DtXGhlZ5Dm6KxxwY=",
  "O5oDCZT61wVYm0SRzALgHYwss5uciy7cLs6ZGKIpqA4=",
  "HYNokg6iVqH/6vVCHQJPD+UIv7+RPO+aCdK7jF/1dA8=",
  "SGQTE520td6FnU7BhaYXz3G9lK7AdSyAxXAtvWQ7PgM=",
  "x3uGL6JC454ojEGqkH+O3VlMsaoicHbePnQuV7zDxAI=",
  "VFYqShhrZwA1F+OJNTuPlAzOW4i0lMuckZTi7m/5YAE=",
  "1zJIB2B2LI5z9OZn+s0ztiOvCYQ+Ld8ibsxf40BYIQs=",
  "x4tYZWLWxyQmC4MoMwhfZ4q37eEtlhpAW9m/m8k+Sw8=",
  "x9H6KfuLz4tryl5hnGp3pdVajgCIEg53g7WH1VimPwg=",
  "kf9DaGUOdE3uM3E4pVLD1enkXxnAHhYfAhc0gw/Nyg8=",
  "oykHZ/Fhwcjs0qWrLmAl5hbfJX7L2eaLqELy/Q07mg0=",
  "cBjPgjCw9C0D8dxtjgSo5Q1DptYualAVR3gHsQ8YHQE=",
  "l9JrSUCGH3NCm0grYhQn/OBtEH2sFH3cuw8a6Nn2zQk=",
  "eFdEbNpbrtxqOD349KZMsd/d7HDpyyJGdF3AiEqLFQo=",
  "Le3q+1wQfTNzAAflvMhkDvAB8IiPsGLzp2pi8fJ8ywE=",
  "EVgCiSJqKZ4wTSBDpgMEo+Edbf3od/+A+TwlX65aaAQ=",
  "LeD6zI98Zk0hX3EiwIBjlpkQFbZKkv9ODvR6d5YGrgs=",
  "AoTrtSVvt+im3IEn7yRdPYd58UNCo/aYlJfdJlYUuwQ=",
  "VTyAj61tRpGUfwLk7OXZgiSQqWV2ZkunnZ0pn7MS/w8=",
  "DxCv1L8qfbaamkR7Sz3IduGKD7YexlaLFG4lzeLOIw4=",
  "XsliEI49I4EPidQ0ZbR080WvGdnJ8vIJLShpr0TwwwY=",
  "2CdXGkOyrYphYniQlT8pOH+d9d4tDbkxSIWdBPebJwc=",
  "wc89YSiW+n7sXmasfaMGvzmHnGaaWr4Z2QdMezeHaws=",
  "OX3SBaTIG10qypJ1jmHvkn7c9H866CRSNJv9XHZ69gs=",
  "mnITS5k3qSPs95Cy8JwTjflU10c+Ia4HGY3QbSS3dwI=",
  "Fg+b54Wzr72WbTxHXVHyq3DmDqa3wVU/UthQrCYf2wk=",
  "Fx0JGq1GKqYPehbW5sXSVIlpCVkiIrp5THr5zagS6gw=",
  "FEbVU/77aB0PRMap02WW3NyuUCwyzsXEJIAwEYgligU=",
  "eB7h1ZZ94PxhWPOO2O4FGdSvTHj9QjlzHZFQNwi7bww=",
  "fn8tYsxBVtnKJ5E9D72pIhr32wru7+IKJzfPVjPOLgo=",
  "pCz8ZmOQ15BrORKnUNUmcGEp5rt9oibpJ6Cy5Oe8tQU=",
  "YfPg4OqIn777RPqAVeJ6al20Fod3c3O3muHkeUwN7As=",
  "6/MzqRHnLyx/ujoI0J2VvhD3YLAg0BAPWyhLKPGgCwg=",
  "554ehca5ZJDmABC7Y+cwS7Gxq3GYnV1cWmE38KBo6wI=",
  "V8N0O4EjFwjN/cscwL+1u9AyjePuhn/HSKSG3MUQ5A0=",
  "KWagqtG3vVUrJIcLaXqJlyBwryY0r4q75eSuWQHKxAk=",
  "HfaaclqwA+qAMCelB4epJsfnSZ68Mtd6M8SxYwwu9wE=",
  "emw6x9PHzk+bIYABgHTop9cchhFlV3leclNZkh9YjQY=",
  "tmMqzGl7G57GK1ocBKIZ70QY2S1AiUU3ZtQz+urF5g4=",
  "lTq/xulnFCF2efWY+kmEUI9yeZ4dpQXthvrQ4RPWdgQ=",
  "vzJPIdP0DgMvmBYBJbjDgSLGwIS+q9Hzx83sJm//0Q0=",
  "ye6bteJDSi2t1FJBxGF6+KxXT/AYKmU89VhXcBBaTQw=",
  "NZEJ0/nW9tLRL72Q2ZmvwSnrGAPqwh46sZurU72riwk=",
  "2TtHgv5Rdw/SgVOGdfQ2wThmytpfQSFDDCrmQnxuTQU=",
  "9IoY/tYb+OZlxTVXzoXQWaMCIg3/yFk/KEModgR2xQE=",
  "iUnOfuOUhCCxOCFzE5O1MDBPBspfOoNnV5MzKKhmvAA=",
  "A3oXPrHP7P+egJTw/yHhatafaemB1yOfeR5BfeJRxQY=",
  "mVZ77MBUUBcCTqY/jjnbIVaqM0tWSWzXXPuNxkyiyws=",
  "XXhIYlCC5jEObs7oPwRZHNad2qFOZbkrGXgODnmczAc=",
  "Wpjy1O5Cu53s/BhO9Wy9TO5EzKgmNSnYU2M+bPIXegU=",
  "Lzxa51t5+icQeuZLt7UjSUhMjD8bbDBKC1717+W5+g0=",
  "WlEkMlV9blxVQuxQz9O2kO7X9e9b76pWR0uNFQ39vQA=",
  "yw93Bz/ow34F/Pd4J1UuNGRm+1xLQOeDV3RcBJ4QjQc=",
  "/eYq17MHXj5N5JsWL4Ui3NQGVRZqtH14dgnIYX8K2AM=",
  "nDXT3rqbyJVOXIMmYi34urxs3T2Mkdwf4lwgITIkMAA=",
  "KVaPd1yO686/putnUizxLwIrucudryOBC63MEwUmNws=",
  "d+XyWN1XMlGDTkpAnqKZit5obD60+gZwtWen74md6Qk=",
  "jXGbgtzWMz67V9pC5d/FRn9sBPRMBXcaThwVQZPqBgo=",
  "ivKGf5j4LqFaUYNF+LgKl7bD8gmrjyZLsJ9ACpE/VQQ=",
  "XpLInJwCfPnXy2V0+gv+AThrzanii7zImH2pCuaOMwU=",
  "G31ZFDgdWBahSq9W7izSbKmdO7etdmnnGwSMUcNxqwU=",
  "fcdBxEMCbY9/CzqLSJrowRHtWIhHqmvdggDU5LMzUgk=",
  "LWzK8biFY063gfPlr9XIgJwyeSrmr7fnj8HdN+T61Qc=",
  "rAlR4o2hiaoID4Jpolux8Ark+3AsLeqTJqQ3sO+vKgs=",
  "/Br71+kuNSv9h9JpFe7rFzhV2B1UrGIL2MuI68AJMQQ=",
  "E/T42L1UepQKexUKenaqKkFuW8NXorwplozYGBOvwQ8=",
  "iEiVBLTNAGKopGo4zOo4+f1Byq+JXH7TQRAinZPLZQY=",
  "vk9o7hPxlDmYNM2r+aX9Ic+qTscuNTLjqvENQUJaSwg=",
  "sTByPyuRD+iIZVZJ3LZhOQKk42EDYfvhFVG56wV/ywc=",
  "t99VKyToN3l73i/TtF4pSGD1ddutLzitXgMHou4lowI=",
  "asdR3QUlqnL9DWU+cJU8y5cyutn8JQ7Xkm4i3Rx8zgY=",
  "8lE1qU70ndjisFYzqImLba3Sl1Hip9YQslL6VHapygA=",
  "uH6lPgV4pRMPHLTkDb5a0fbjhJ9T5ADQf1eCPLPYHAw=",
  "pF6/0QYZ9vKaFvfR1q6aJFIDAaCRVE/jBuhwjTWpRAA=",
  "Vf03dCqt5w88+NXx2HY0vvljmuEGqRUYu4P/DJ07WgE=",
  "66qrZcdEy/10JOp+l/mb+XovixgDyD0rgBw/i/prjAA=",
  "e2oJSBBMOy859QNtPKa1Rvm9BNXgU1YCR5/660/1Rg8=",
  "qgFzF8UerFBTq/4l2Me6t94LU/RgPnUHNsOk6t4WjgQ=",
  "uvf+V9T3SogHRCGAoSxsT/pszlZiQ6kS+WzQ1sYsNwo=",
  "NeI+ayhdsNpRsk9NzKXUt2BmQ2OKQC6lSvKzUm+3ggQ=",
  "RLcaJGfRLBKwf2VbChgakRIr/0RhN7UIIJ9agtM4wAk=",
  "LmK8KHLWr/U+k6UePKuh1sEsR5q0N05jwQGFj6l9UwA=",
  "4rZKimpi64pLhyfZO6pMVBomfvdgt4b5iNfQyQtJ/AI=",
  "oHg9Jz7yYJ3987SJ8gdxcBUwAWZ0F4jay4e6y+I1Lwo=",
  "R2SKnVAy/5T1CRQ+Ctr4CNe7Mcp2ho/KUpkySiTGRwc=",
  "E9w6l3dk2C5HaHYAcBN30HVU8S9nLjp0it+sB3ETSwI=",
  "8cbxziEeWeOK3wVr8NYZbyJMsAz+v6d5fqFbj/DvuAc=",
  "D68ds+QKLY0GK3wG2a42kHHi+shiAoe1RsumxIjOkw4=",
  "G1ZWeXz+ZxZsykogP5thFkHTk+ouB+phCTDLXmbMQgg=",
  "GXFSIsPcJ8DaAAZiA0HUS0klERTlD4pPfqyCY5raHQI=",
  "sDJ8UMHDrQRZA3BZvvfMqPuLqIqE5mlnWJooZ4+FKQU=",
  "o2TpgAX7xROwW2+fr5cgz4HoBgVt4dwHbZEJ60tNBg8=",
  "uagqFSpfmxNApAQ57DLLXoZgQdH1ui64wgYKp2xhOgI=",
  "ehgFJVPiQu52FyusGfpm6CAVhEWya7ZCz9LRZeRVfgM=",
  "xYUnM8aqyZDDszGSh8Yy36sU9cGn8okoDXYk8iq/jAo=",
  "JFOhIPFCPXr0PHAWiUB1wFxqc3f361aQEJO+EoLxBAM=",
  "+RV4qoaIte2QL2oqCeuld5mu/761aDdhoZsGRHuqJQ0=",
  "6cqrReiyf7YiNlkZ6jQZzI7DhIXIlIFzK6EUzujLzgM=",
  "viZnwluqADBAa42cXnKFEtQzmhZFdDojRB+lxNvCZgw=",
  "dk5EagDbbb/E7D21oIn98VbdHfq75jsHrBtO5UVPkQw=",
  "Onn7K/UyNFhIA9BKAAjk8EDoMAZ+E6wT+78yUCBtjQc=",
  "KIqi8vERKtLWdKLr2hJSGMl2gxXRT5RCKXwjRvswfwY=",
  "qm91WtWeeAA6hED3oRmKK+HePu85J0v2bxdGMgDBKws=",
  "5WmwIVuSYRJg/8rpEDbnsnxGsYv6lzXX8gwIQWJEpg4=",
  "zIXlVBk1r6pW7Vz5taRp8xAevXJDu9XKpj2rOscqGAA=",
  "kQmD/EIKHV+L0Ctxi9foV89J84Wd216PmTHgFXJNvQY=",
  "uycl3c8QRIuPYXOnwUMBx/EMg2bnQdvMt2q9CrWOawk=",
  "XeYwgzn8Fy+AnIWVZmAjY54BML/aYnQlqVmIjzXLAAQ=",
  "J26MY4fxldj094xLblMZjEDedIgc5tpFn4Nc4cfZbQ0=",
  "fguDfYT9sYznawwbDTbSfz//Bw+MoNvZolfEcCh7/gQ=",
  "WNMZ0NoFwMRMQrB9OvRQkYoqtfJKLOg0XTPrq6JIUQE=",
  "ekIKL7tZdz3b6N2nIpVIGtvZFFET+AVnMUvDjyztPAc=",
  "Kcw4TdrSYQtfjl+G33hdfEd9uKV6a+/gYXZW9uyFPgo=",
  "DbKlMH+hCMf0ry13itjjx1Kn5rkFwtJGja6yyYrArgQ=",
  "t8T9AQh8LtoCyM+YV/GDkpwbOSJdWCBu7ebJciaFZAI=",
  "+9//PvuxTjMI7+r6/XT7sOP7atEUO50Cu7wAUPvzUQs=",
  "rREmC82n/8DvoACR9rjyn4SfqQmnZxrqlZP13CMbnww=",
  "uXtNQKSGl8BkuAAglzU5OCRTdFoHnem8rFhuRGcN+ww=",
  "6Gske/ZyA5L7Ogfi6d9bWrPqbIg3ungZle3U8hxY3As=",
  "O9cIHi2MwoxkxroNJlZpPk0lx3/i5ttTOvNnS5x0vgQ=",
  "kUgGwWHu0P6JDG+Fb5yIGrIX0KEw/ad25wUZcAzqbgU=",
  "1bLK4RDH5wOl5rLwexuXLT+06cvu89X76Ph08KylCQ4=",
  "VjAV0fMzbsdUWDmLqbkn45+DWMg4D9aTHKmQ0yMzswE=",
  "nUq+D6UYL3ZMlFwMQh7RyJWL1GmfcvABonoK7LQotAY=",
  "NklGJjYyaliKetaHWmj79dFiZphB0eZx96BgIBacJQ0=",
  "WfJa5dqfcykxeg916DKGhaMoT35IKdMxxBpCdUg5Iwc=",
  "Wkinvx56IOjSU4Xi7FpA/dwnDHH3dmCjOYX9B2Ix1w0=",
  "K/AJ1lJKWyHMUlTH/PE79235FhpVJTQcvq0/CZjC3w4=",
  "+iWw0Zpjppc0No8zRjV+sSkKN5sI1ByXMbilHyAJoQc=",
  "JiSWJf8iDUJzjCGZQCq4Fqwk9LPghCdcXmtAyfe5fgY=",
  "FKSYZwFriGo3jgd4cgfC8x/RL4EnMdl21/hJXNZ9FAs=",
  "y6V1CRfM6oTjHgBain3xyE6tzSDUPWN5bSfnfHfAlwI=",
  "SW98wVmGNPMB0a0+CkGBmMK6EExFa+uDy00CRkmQeww=",
  "1heWxHcIB4J37dvfEkTUqmUye729Vz4Nz8y8tDndew8=",
  "3MZ1NPyPT6drZqBXrw7yjZzvBzotc8eaplAIFXgjgwQ=",
  "qu1q8BlCLKN0F9F3GqZebVA/AkZXpBljx5AaBacewAg=",
  "2x2hDA/gVPzbameKYomzU3uutU/F+Cmm7l7nR19hTw8=",
  "FgGH1PH2Wt3RM2+Jben+YpHw4UUAauSV6qaAX+IiRg8=",
  "aco1IdHCGQihf2Cu4gpsaXFtDdgT/fvUzOi1gYKSwQ0=",
  "FLg+jy2xdaYnd7MKO9KE4qd7qVR2x5I7VhXFdBPCTws=",
  "l9MkdqJLeI4/DKBl2sZxeo6m+ec3pClcTtwLc5fMHA4=",
  "puVredpm6Jv+3LzgxsC2gcTWu5RaT//+T8KxEzMZtA4=",
  "0sdn9DgVe3biOXW2RSGaNSa3NdCBsSHTyTtKqEjdagA=",
  "zeQ0oI0tfD1eUREgQi4D2LJXTWnyUpYtFA0irQco7g8=",
  "5b3zFqx7RiBoDtbX+nq5vdNPuy/Gg/7NJ9HyHxJK0wQ=",
  "3eqM5VPBMldbkK7uMvg0qGQELKg86oABDxYRj0WaNgk=",
  "X/gwCQXd0wW2z13xbBKh9ycWOlxEh5Jz327ZY8XpcAA=",
  "bmyJe9TtvxcKKmVXXDv9f/4Ne0K/zC4Ox5FmRhHRhgI=",
  "tqsF3RVsUdVnK9LoqQ54xZ1C+QXTCcIl5v8OVxcl8wI=",
  "O6pbe1zexKdvUg4TbxV+ZZ3ygkgoe7JtzsVDBByc6g8=",
  "7IeL485JDr5hzlGuJCToxJB+U2E8DO19yx5+HSTzQQE=",
  "8N6dzVUV3/k5P1WNTBae6aDuLN1YQ9ab+1+LI7WDwQU=",
  "3+gpkS/qD9knIgybdnLFDKJ2TTIf/WbQ+5KUl5OfMg8=",
  "57Uo8itxXVRnycVKZe+zkrOE3EYXAYuXq0W6R+1sNAM=",
  "v8ZNXLIl4ec1IYPmPqimTFQr3e8rGZSO9ppqQAxP+Ac=",
  "0FGdhHJA1dO63HNyNrLUUl/6vrGNGMQ7ZzkRBU+Nags=",
  "H0Fdh3cAqYV65QIr+bctlRYoTPDlpv3zmxII9GMg0gA=",
  "LvAxH+hJNSBuThqFf3xFMWfNLMWzNzYKY08q+hH/Nw0=",
  "R92gg5li0Ld9xUov+tGyQLFS+nPMOghLnwx1920yFQE=",
  "ESl0KKXC5Zf+6cx4iwtghnzENf+8OzVGlHFkmujs2gI=",
  "gPN+dlBpxUfmRGfv7gebRniprN+J+NWlj7RfRwVWLQI=",
  "8BPKdgRHXI+KxBBbCxscu1W4GyC1Q5F4iyK6sBeRDQQ=",
  "YA3Zw8swv/xG9swBleCsgRXkHA2Rkb7C9xKd3i3gTgw=",
  "e94U+Z0QNYsFlnc0UwYdVE8jBsuJzxO1GumbhCaPQAk=",
  "NZ1G6IAfyG4ACmMf/1QIoOlkUQOkEBeqsEPf7fzvcQU=",
  "Hd4DcjMaY7GfG+cEHQRCkmxYQCo0sK2tBGclUriJwQM=",
  "Ifg1y+3ffcpa+ut7bzHtkwYB57VvkdEXNG7tPD9aew8=",
  "ExqXdht4vUZwvK3bnIeCI862dLVd2bX0bPCFtuxxUwM=",
  "KYfKV6hnfl40hGM7j0+ih/fpdMX7+4gpQ5TiZc5eTgA=",
  "hrytskjjhrMtMI5+tF0rBmNuowFNWxJ2euNbfJN9+A4=",
  "vTDBQ9i8j5FEs2ZpWCtucA6h5+ksYdAK1t5j6CK5VA8=",
  "cphtQUuC7OfjpINcF/9+W1wSBXSJX7tQ/Pxfix3vuAI=",
  "uVY0Oh+IUqAPIWHlQs4mXjD6L22V7QBAJvBP7A+Fmgg=",
  "O4OiphIfGtpbDAt8YIXmwkHHrXE6xHANsFBP8m6dvQY=",
  "ftqVr+eo6EtCqMqiB6p0NOd7dSfiNUtPNKHV6mQlWwo=",
  "I82ryyYs49N/TuK93oGJQ+BI98qHvCHOaGtYTRQnmw4=",
  "L/xv5mfI6YgyHCLNqerb/qcFn2ROIyrkmgW+2AMq5w4=",
  "ASlr5Kt8nxxgA5BC+a10u2/laUanBwu7IYkyGZXkrwY=",
  "RmZTvZYxM8K12onzuf4qleDAwF+/1sQfqEPpoSaIVAw=",
  "RuOONM39VXPpBSKemnflxvIkAFdekx/O2e0i0v48gwc=",
  "4UUC/6qzeriLnDEDCl2aYH8gcH4H/w9vfeZ92GNASQs=",
  "x2g2i5LYts4F5Luh1WrP9Is4Z/C8HShwt0UweIBhngI=",
  "m5w3K+3FThDbb7+ultA/yW3cOwS8ROWFET9UrEqNngM=",
  "Tu3bxROIakyA+uaCXEvN7zxlUhtK7OwViI55yD9sewQ=",
  "9WbXFqH+h2db4UpfWpkZCfvPuftPZktb6OS+2eEmfAo=",
  "RXD3hFfo5GMdmqQvGngszR+UYAsMFeQukFVs2jFqvww=",
  "yfGnQyxUu4pAZ2FQ7RBjt1nOoy4KsDaLl+/fk0JCZAs=",
  "UUFo1VOk7DN1urV+AYk+ZE5tWS4mc6ROqwMNVqhYAQ8=",
  "kfvDkT4r2RmWJwJeJVKAW9N3JxT/T/RaKgakph8vCAc=",
  "D+WNxcYqH2GfSalBjk62r5Mm7CvKQRgXr74IRqzYeQc=",
  "bH1dfvqo+8HhYsBPmm+na1s3MDVGLTTHfrocYunwFgg=",
  "k0FEcwMgW8hAp4yno7BaJQkReXiorfAJBsNgAePmPAg=",
  "oinl7CWq03moxbFkZ+N8VU5aTuiq94CrVCR35mZKzwE=",
  "C/AxNv3vs8ppWAKgshYnwaQQEiLQbfur+8CmoMdlnwU=",
  "wsImzb3ViVlpvKuxTalPgAZe4aUJgnFBXjSESTWcCwY=",
  "UP+mKHi3pe8acaqCiaT1cs3IMDJrfzg2eLSDfs5xjgs=",
  "tWLlj3ap8/ateDqQrVqPx7kT7Gu2EGDyMKOB+Fw3HAw=",
  "cKO/Ei2AVWSU+cubtV6k/oNXVfCGc1MvNYP7Uc1m7QY=",
  "pW3i766CMw7me7BmS0h0ckwPfOI3N41NQGhrRzeFOg0=",
  "PiaC8EhoBifdAYc+lb9W/TDochsYj+SRXVvFY+I/EAw=",
  "ZWD5Y35elSDPSGGS+ckCOU1Kns5J1yHr/t9uwjqzawE=",
  "49DMME6I8TNvMxg5I5QmOgfo8tDfqTrO3GMg4W4+0Q8=",
  "05naz5u/jeQzk2/x6PRHqtUPAn7UOnAhrvaObSM3PQQ=",
  "C1rLf8E2e8xLdvVGlbtSbZDm5p2aAz7fR5qobP5hjAg=",
  "kGtv0+O/ylGHhxkTX4isOYlmgLHME/AIPSZo4DMlQw0=",
  "uxAV0VdTMUfEH0O+k7pC4HUU9ywKa+hh/89JvBAgUwc=",
  "mkeCsZvRmR0mz8gcUnw0swToD+UW3wslqeonaYobaQM=",
  "mI7OCX9OILGRq32Fz9IYyGV4Dhp6Dp3kqiqhV6g53gM=",
  "OsAeIz9DLcLKZ1uO7Y75cRfGS2o5hlM6dAKYNHG/JAM=",
  "qb5sayw4OwGi7VDJNOmbNkvHFtiwh37zucisjz/b1Ak=",
  "rVURAWuRBlnGhxkKBPkFl6Deo5d4dYbWlyERJ+CtVA4=",
  "TUio9A2fsLEyHm5+EbVcMZFrYtNUCrEgZqtmsE4dXgk=",
  "AmFEp+2DNOLMU2gHt66H3GGFJ7aMSt1r4u9cvuWdFwo=",
  "hGWIGlSPt/j+D8ej1dJHlv7XzgayUO3MVCK7n6GLlg0=",
  "M//+ycWLnfU+1PL8A+jkF/N+tMW2dz6GYoh+K2sIAA8=",
  "fItwfw6siH67Py6igLYBP5TOVNdAv78eDQ1fsSHd7gA=",
  "nP9gLLINrKlb7DWyuT0FkvQPbmcEEg3ItOPZjlh8rA0=",
  "CaTWd2KAeMzkwSfViSxMHeK5pVh1aiItNQSiMAzLhAg=",
  "2A3ds3yHhdexp1vpGsxITKYwq8LHPrbpeLsKeKSexg4=",
  "mm30Yxu1wQgejHACPALxpdSb5ulGT6s9The/W7JPAgE=",
  "CxSk+gbm9bHd2jKV4dfIfBs6KzCEfjShj7v+C1LOYgU=",
  "sI7Vd6pAe2kViztAy0Q+6MjE+I0uwVkkPUtdiCBzHAs=",
  "XfyCGZfBauTqb/VAjmoIGKLl/EnMKD8XCHT0wYQrag4=",
  "J1xOA7MimOnBDOi5nvCKlgZKtwPR/kwk4oW2gQVWUQQ=",
  "N68bny6O2+Fp0XmwwBQw9s1M4NptJkWvKUArP6WSpwI=",
  "icpzx5u377vBoD+GdryWu9DZnzEeiErm7aVVeQCvogk=",
  "pkBkbY5DDuBS24WwfIclMdVma/jUJPaoAYFof0SJqgc=",
  "Ylf4iPybHZZnNF5RuM8UZFAFNCppE4tm0Z7RjsU+NQE=",
  "sHmV6DCbuJc4g8MaSfx5dqfZY/AxzDACBblkL3/vCQU=",
  "81SkqSv+vaEJHbp1O9Ku8r7xjWgDX6J+pcffCsPOsww=",
  "WobsrIWW4dHWvP5BcWuI7ATGCj8FHfsBGkhF6lqMDAE=",
  "IQpSZBUdNTr18gclJTgexEXWH/1uuWuksk+f7aaX0Qw=",
  "Sc/sgoKWtN/9HMyOYNkByLcw76VoT+zgLfsQ5CI3DA4=",
  "X/Vx4oKVme4L1NtdyQmpONXlP/K/6vad3hBpCW66EAc=",
  "ikQLev4w7UJK9KnhANsw+yhbZGM1LN3hXfGZswbcGAU=",
  "72h4zFNRHD9vM4zLkJZoBsY1jueQ3JIUsr5sOJFu9gs=",
  "RmNL2ybdVFBE5EhuqR3zC9AKnU2dGx7ZE+2a6r3Z2gk=",
  "uU4UANUrsRHnVzn04/1bwRn/Fdjq2i/YPV36UqhdTwo=",
  "RcrKrG7BzhSAyDH5m0HDGwUU/Q6xe6N8cNEO7nawCQk=",
  "jLf5HViYZz0ZbAsepN1sNa2LQb20Ml4A+Sh65Z6AvQw=",
  "YX08rAwOnUpL3WgMw/YZjg4+tdRGKW1Shh1HYGQ43wY=",
  "pGk/aegL4Dbv9HkxqsWCf6Z6BR/CZGUQPZVt8XYxogk=",
  "efZQzkGJ7ryd4e2XzobwMAbsBfWTvBZ9nV6Mko0BBgg=",
  "bqjnTwZ21Z60PQ5z0RyZzDbdC/R6OiGWagkzkOrL8Q0=",
  "pksEyfDNQnVVMcg+legwSuYQgAO/Xc3s02JQ3PO64QM=",
  "Igepgr5TdUYzpK/i3U8Xl0Z9WtAUntmNAbJm5cBfzQg=",
  "cSQI+0BSlREdBBNWFlYe+VYMu8uAuTKxN/jUmPLMZwY=",
  "GupNYyFhPw7TQRdwI/frNHd8vpU2CYkQXPiHOTGjJgI=",
  "zhcuzS4DBV9tKM9IahWPs0fJEXxJjzjpB76/dK8hzQA=",
  "Ls8YnUXiYan1kc6j7grzgYToZ5n76DRZ4xyRNiC7BQg=",
  "JnbUpKwlVe3tNFS+7Es9QKxZ9Jtr+q7Sc790bz8+fwE=",
  "cvRY9sHWDQo7JIAa99jslquHGWd+NKS4Ih6osAPergM=",
  "A8or/AD3+82mIUTPjEyoDN36gU2WY1dZsPU1PlOiEQY=",
  "oc7KG5r9pAOSeAypV+sMv4mpY6eZb/FlwRqoIcw9+QA="]];
        var opening =
            multiproof.decode_helper(proof[2]);
        root = "78xQJBcuSQGEioAqZK2Njt4h69FISZ6ZzobeW+CqQQk=";
        return(verkle_verify(root, [proof[0], proof[1], opening]));
        //return(verify([proof[0], proof[1], opening]));

    };
    return({
        verify: verify,
        test: test
    });
})();
