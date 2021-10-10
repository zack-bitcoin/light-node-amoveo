var loop_start_height;
var globalnonce = 0;
var loop_finish_height;

var localBool;


function runtheloop(){
console.log("refreshing blocks");
headers_object.more_headers();
console.log("refreshing oracle list");
   //     abcd.oracles.innerHTML = "";

rpc.default_explorer(["oracle_list"], function(Y) {
        console.log("oracle_list attempt:");
        console.log(JSON.stringify(Y));
        var l = Y.slice(1);
        abcd.display_oracles(l);
    });

firstTimeBool = 0;



//abcd.display_positions(window.localStorage.getItem("positionData"+keys.pub()));


console.log("seeing if we can update balance");
console.log(keys.pub());
console.log("privkey");
console.log(localStorage.getItem('privkey'));

if (keys.pub().length > 0){
	console.log("updating balance");
//	keys.update_balance();
//	keys.update_pubkey();
}
//console.log("refreshing blocks");

}


setInterval(function(){ runtheloop() }, 1000*10)

//setInterval(console.log(globalBalance), 150*30);


function copyToClipboard(text) {
    var selected = false;
    var el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    if (document.getSelection().rangeCount > 0) {
        selected = document.getSelection().getRangeAt(0)
    }
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
    }
};
