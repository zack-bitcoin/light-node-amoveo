
function hash2integer(h) {
    function hash2integer2(h, i, n) {
        var x = h[i];
        if  ( x == 0 ) {
            return hash2integer2(h, i+1, n+(256*8));
        } else {
            return n + hash2integer3(x, h[i+1]);
        }
    }
    function dec2bin(dec){
        n = (dec).toString(2);
        n="00000000".substr(n.length)+n;
        return n;
    }
    function hash2integer3(byte1, byte2) {
        var x = dec2bin(byte1).concat(dec2bin(byte2));
        return hash2integer4(x, 0, 0);
    }
    function hash2integer4(binary, i, n) {
        var x = binary[i];
        if ( x == "0" ) { return hash2integer4(binary, i+1, n+256) }
        else {
            var b2 = binary.slice(i, i+8);
            var y = hash2integer5(b2) + n;
            return y;
        }
    }
    function hash2integer5(bin) {
        var x = 0;
        for (var i=0; i < bin.length; i++) {
            var y = bin[i];
            if ( y == "0" ) { x = x * 2; }
            else { x = 1 + (x * 2) }
        }
        return x;
    }
    return hash2integer2(h.concat([255]), 0, 0);
}
function newhash2integer(h) {
    function hash2integer2(h, i, n) {
        var x = h[i];
        if  ( x == 0 ) {
            return hash2integer2(h, i+1, n+(256*8));
        } else {
            return n + hash2integer3(x, h[i+1]);
        }
    }
    function dec2bin(dec){
        n = (dec).toString(2);
        n="00000000".substr(n.length)+n;
        return n;
    }
    function hash2integer3(byte1, byte2) {
        var x = dec2bin(byte1).concat(dec2bin(byte2));
        return hash2integer4(x, 0, 0);
    }
    function hash2integer4(binary, i, n) {
        var x = binary[i];
        if ( x == "0" ) { return hash2integer4(binary, i+1, n+256) }
        else {
            var b2 = binary.slice(i+1, i+9);//this is the only line that is different between hash2integer and newhash2integer
            var y = hash2integer5(b2) + n;
            return y;
        }
    }
    function hash2integer5(bin) {
        var x = 0;
        for (var i=0; i < bin.length; i++) {
            var y = bin[i];
            if ( y == "0" ) { x = x * 2; }
            else { x = 1 + (x * 2) }
        }
        return x;
    }
    
    return hash2integer2(h.concat([255]), 0, 0);
}
