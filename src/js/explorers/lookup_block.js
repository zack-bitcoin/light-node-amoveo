(function(){
    var lookup_block_height = document.createElement("INPUT");
    lookup_block_height.setAttribute("type", "text"); 
    var input_info = document.createElement("h8");
    input_info.innerHTML = "block number: ";
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(input_info);
    document.body.appendChild(lookup_block_height);
    
    var lookup_block_button = document.createElement("BUTTON");
    lookup_block_button.id = "lookup block number";
    var lookup_block_button_text = document.createTextNode("lookup block");
    lookup_block_button.appendChild(lookup_block_button_text);
    lookup_block_button.onclick = async function() {
	var num = parseInt(lookup_block_height.value, 10);
	var x = await rpc.apost(["block", num]);
        lookup_block2(x);
    };
    document.body.appendChild(lookup_block_button);
    var current_block = document.createElement("div");
    current_block.id = "block div";
    document.body.appendChild(current_block);

    function to_now(t) {
        var start_time = 15192951759;
        var n = (t + start_time);//10 * seconds since jan 1 1970
        var curdate = new Date(null);
        curdate.setTime(n*100);
        var final_now = curdate.toLocaleString();
        console.log(final_now);
        return final_now;
    }
    function exponent(a, b) {//a is type bigint. b is an int.
        if (b == 0) { return BigInt(1); }
        else if (b == 1) { return a; }
        //else if ((b % 2) == 0) {return exponent(a.times(a), Math.floor(b / 2)); }
        else if ((b % 2) == 0) {return exponent(a * a, b / 2); }
        //else {return a.times(exponent(a, b-1)); }
        else {return a * (exponent(a, b-1)); }
    }
    function sci2int(x) {
        function pair2int(l) {
            var b = l.pop();
            var a = l.pop();
            var c = exponent(BigInt(2), a);//c is a bigint
	    //return c.times((256 + b)).divide(256);
	    return c * ((256n + BigInt(b))) / 256n;
        }
        function sci2pair(i) {
            var a = Math.floor(i / 256);
            var b = i % 256;
            return [a, b];
        }
        return pair2int(sci2pair(x));
    }
    function lookup_block2(block) {
        block2 = block[1];
        var diff = sci2int(block[5]);
        console.log("lookup block 2");
        console.log(diff);
        var current_block = document.getElementById("block div");
        if (block == "empty") {
	    current_block.innerHTML = "this block doesn't exist.";
        } else {
	    var miner = block[10][1][1];
	    var time0 = block[4];
            var prev_hash = toHex(atob(block[2]));
	    var time = to_now(time0);
	    //acc, number, hash, txs, power, nonce, total_coins, db_root
	    current_block.innerHTML = "block: ".concat(block[1]).concat("<br />was mined by: ").concat(miner).concat("<br />has timestamp: ").concat(time).concat("<br />prev hash: ").concat(prev_hash).concat("<br /> difficulty: ").concat(diff / 1000000000000n);
        }
    }
}
)();
