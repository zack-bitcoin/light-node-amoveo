(async function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = default_ip();
    };
    const urlParams = new URLSearchParams(window.location.search);
    var jid = urlParams.get('jid');
    jid = jid.replace(/\ /g, "+");

    div.appendChild(br());

    var jid_text = document.createElement("div");
    jid_text.innerHTML = "job id: "
        .concat(jid);
    div.appendChild(jid_text);

    var job = await rpc.apost(["jobs", jid]);
    var id = job[1];
    var worker = job[2];
    var boss = job[3];
    var value = job[4];
    var salary = job[5];
    var balance = job[6];
    var time = job[7];
    var N64 = 18446744073709551616;//2^64
    var salary_per_block = value * salary / N64;
    var s = "";
    s = s.concat("job id: ").concat(id);
    s = s.concat("<br>");
    s = s.concat("worker: ").concat(worker);
    s = s.concat("<br>");
    s = s.concat("boss: ").concat(boss);
    s = s.concat("<br>");
    s = s.concat("value: ").concat(write_veo(value));
    s = s.concat("<br>");
    s = s.concat("salary per block: ").concat(write_veo(salary_per_block));
    s = s.concat("<br>");
    s = s.concat("balance: ").concat(write_veo(balance));
    s = s.concat("<br>");
    s = s.concat("time: ").concat(time);
    var info = document.createElement("div");
    div.innerHTML(info);

    var explorer_info = await rpc.apost(
        ["job", jid]);
    console.log(explorer_info);

})();
        
