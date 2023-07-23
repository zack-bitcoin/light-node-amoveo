var precomputes = (function(){
    function range(a, b){
        //exclusive of b.
        if(a >= b){return([]);};
        return([BigInt(a)].concat(range(a+1, b)));
    };
    function calc_domain(many){
        return(range(1, many+1));
    };

    var cached_domain;
    function stringify_bigint_list(d){
        var d2 = [];
        d.map(function(x){
            d2 = d2.concat(x.toString());
        });
        return(JSON.stringify(d2));
    };
    function parse_bigint_list(d){
        var d2 = JSON.parse(d);
        return(d2.map(function(x){
            return(BigInt(x));
        }));
    };
    function domain(){
        var result = cache_helper(
            cached_domain, "precompute_domain",
            function(){return(calc_domain(256))},
            stringify_bigint_list, parse_bigint_list);
        cached_domain = result;
        return(result);
    };

    function cache_helper(
        cache, ls_string, calc, stringify, parse){
        if(cache){return(cache)};
        var ls = localStorage.getItem(ls_string);
        if(ls){return(parse(ls));};
        var x = calc();
        localStorage.setItem(ls_string, stringify(x));
        return(x);
    };

    var cached_da;//256 big integers
    function da(){
        var result = cache_helper(
            cached_da, "precompute_da",
            function(){return(poly.calc_da(domain()))},
            stringify_bigint_list, parse_bigint_list);
        cached_da = result;
        return(result);
    };

    var cached_a;
    function a(){
        var result = cache_helper(
            cached_a, "precompute_a",
            function(){return(poly.calc_a(domain()))},
            stringify_bigint_list, parse_bigint_list);
        cached_a = result;
        return(result);
    };

    var cached_ghq;
    function ghq(){
        if(cached_ghq){
            return(cached_ghq);
        };
        var x = points.basis(256);
        cached_ghq = x;
        return(x);
    };

    return({
        ghq: ghq,
        da: da,
        a: a,
        domain: domain
    });
})();
