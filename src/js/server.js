//make ip and port as input things.

local_ip = [127,0,0,1];
local_port = 8081;
var server_ip = document.createElement("INPUT");
server_ip.setAttribute("type", "text");
server_ip.value = document.URL.split("/")[2].split(":")[0];
var server_ip_info = document.createElement("h8");
server_ip_info.innerHTML = "channel node IP: ";
var server_port = document.createElement("INPUT");
//server_port.value = "8080";// server
var URL_REGEX = /^(https?)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i;
var match = document.URL.match(URL_REGEX);
//console.log(match);
if (match !== null){
    var host = match[2];
    var port = match[3];
    console.log(port);
    if (document.URL[0] == 'f') {
        console.log("running stand-alone light node");
    } else {
        console.log("running light node served from a full node");
        server_port.value = port;
//    server_port.value = document.URL.split(":")[2].substring(0, 4);
    };
};
server_port.setAttribute("type", "text");
var server_port_info = document.createElement("h8");
server_port_info.innerHTML = "port: ";
/*
document.body.appendChild(server_ip_info);
document.body.appendChild(server_ip);
document.body.appendChild(server_port_info);
document.body.appendChild(server_port);

document.body.appendChild(document.createElement("br"));
document.body.appendChild(document.createElement("br"));
*/

function get_port() {
    var p = parseInt(server_port.value, 10);
    return(p || 8080);
}
function get_ip() {
    //return JSON.parse(server_ip.value);
    var s = server_ip.value;
    if(s.length === 0){
        s = default_ip();
    };
    if(s === "zack-bitcoin.github.io"){
        s = default_ip();
    };
    return s;
}
