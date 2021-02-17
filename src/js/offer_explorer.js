(function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = "159.89.87.58";
    };
    const urlParams = new URLSearchParams(window.location.search);
    var tid = urlParams.get('tid');
    tid = tid.replace(/\ /g, "+");

    div.appendChild(br());

    var tid_text = document.createElement("div");
    tid_text.innerHTML = "your tid: "
        .concat(tid);
    div.appendChild(tid_text);

    rpc.post(["read", 2, tid], function(tid){
        console.log(JSON.stringify(tid));
    }, get_ip(), 8090);


})();
