(function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    var title = document.createElement("h3");
    title.innerHTML = "governance";
    div.appendChild(title);
    var oid = document.createElement("INPUT");
    oid.type = "text";
    div.appendChild(oid);
    var b = button_maker2("lookup governance", lookup);
    div.appendChild(b);
    div.appendChild(br());
    var governanceOutput = document.createElement("div");
    div.appendChild(governanceOutput);
    div.appendChild(br());
    function lookup() {
	governanceOutput.innerHTML = "";
	var v = parseInt(oid.value);
	console.log(v);
	merkle.request_proof("governance", v, function(x) {
	    console.log(JSON.stringify(x));
	});
    };
    function oracle_bets(x) {
	console.log("inside oracle bets");
	console.log(JSON.stringify(x));
    }
})();
