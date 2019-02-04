(function otc_listener() {
    var div = document.createElement("div");
    document.body.appendChild(div);

    var title = document.createElement("h3");
    title.innerHTML = "direct derivatives response form";
    div.appendChild(title);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"orange\">listening for offers to trade. Send your pubkey to people who want to make trades with you.</font>";
    div.appendChild(status);
    var db = {};
    start1(db);
    function start1(db) {
        return messenger(["read", 0, keys.pub()], function(x) {
            if (x == []) {
                setTimeout(start1(db), 10000);
            } else {
                //remember, old messages do not get deleted. So don't think that they are sending you the same trade offer over and over. check the spk.cid to see if the channel already exists.
                console.log("in start 1");
                console.log(JSON.stringify(x));
                //The light displays the message for Carol
                //Carol verifies that the information is correct and clicks the "this info is correct" button within 60 minutes of the moment when Bob's offer got sent. If you don't have enough credits to send the encrypted messages for this protocol, then the light node makes a payment to Alice to buy enough credits.
                //The light node generates the smart contract, signs it, and sends the signature to Bob via Alice.
                //the light node also creates and signs the tx for making this channel, and sends that to Bob along with everything else.
                return start2(db);
            }
        });
    }
    function start2(db) {
        //The light node makes a big warning, telling Bob that he needs to save the signed smart contract to a file.
        //the light node checks every 10 seconds until it sees that the channel has been included on-chain.
        //the lightnode makes a message saying that it is now safe to shut off, and that it is important to keep the file from step (6) until the contract is completed.
    };
})();
