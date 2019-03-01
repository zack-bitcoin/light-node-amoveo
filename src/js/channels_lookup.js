(function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    var title = document.createElement("h3");
    title.innerHTML = "channels";
    div.appendChild(title);
    var cid = text_input("channel id: ", div);
    var b = button_maker2("lookup channel", lookup);
    div.appendChild(b);
    div.appendChild(br());
    var Output = document.createElement("div");
    div.appendChild(Output);
    div.appendChild(br());

    function lookup() {
	Output.innerHTML = "";
	var v = cid.value;
	console.log(v);
	merkle.request_proof("channels", v, function(x) {
	    console.log(JSON.stringify(x));//["channel","fMU1uaBpWrHpNs7CtR87K6Celt1U9kLTW8v8YCrvIo0=","BFvtRZzoY6e7Nr5ZvfPJjJu/BE66LoX29kAvYvBUYVziU1UExVdkLziNL7O0CWXnFiu5hEzZx3YhBSsg3r9hUH4=","BCjdlkTKyFh7BBx4grLUGFJCedmzo4e0XT1KJtbSwq5vCJHrPltHATB+maZ+Pncjnfvt9CsCcI9Rn1vO+fPLIV4=",1000000000,1050000000,0,1,55290,1000,0]
            Output.appendChild(text("account 1: ".concat(x[2])));
            Output.appendChild(br());
            Output.appendChild(text("account 2: ".concat(x[3])));
            Output.appendChild(br());
            Output.appendChild(text("account 1 balance: ".concat(x[4] + x[6])));
            Output.appendChild(br());
            Output.appendChild(text("account 2 balance: ".concat(x[5] - x[6])));
            Output.appendChild(br());
	});
    };
})();
