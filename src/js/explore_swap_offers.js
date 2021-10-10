function explore_swap_offers_creator(div2, hide_server_select) {
    var div = document.getElementById("explore_swap_offers");
    if(!(div)){
        div = div2;
        if(!(div2)){
            return(0);
        };
    };
    var display = document.createElement("p");
    div.appendChild(display);
    
    var refresh_button = button_maker2("refresh list of markets", refresh);
    var s_ip, s_port;
    if(!(hide_server_select)){
        s_ip = text_input("server ip: ", div);
        s_port = text_input("server port: ", div);
        div.appendChild(br());
        div.appendChild(br());
    } else {
        s_ip = document.createElement("p");
        s_port = document.createElement("p");
    }
    s_ip.value = get_ip();
    s_port.value = "8090";
        div.appendChild(refresh_button);
        div.appendChild(br());

    var temp_div = document.createElement("div");
    div.appendChild(temp_div);
    var orders_div = document.createElement("div");

    async function refresh(){
        var l = await rpc.apost(["markets"], s_ip.value, parseInt(s_port.value));
        l = l.slice(1);
        temp_div.innerHTML = "<h3>available markets</h3>";
        market_buttons(l);
    };
    refresh();
    async function decode_market_veo_contract(cid, contract){
        var txs = await rpc.apost(["txs"]);
        txs = txs.slice(1);
        var r = await buy_veo_contract.get_deposit_address(cid, txs);
        var address = r.address;
        var contract_string = " type 2 wins if "
            .concat(atob(contract[7]))
            .concat(" of ")
            .concat(atob(contract[8]))
            .concat(" in blockchain ")
            .concat(atob(contract[6]))
            .concat(" is delivered to ")
            .concat(address)
            .concat(" by date: ")
            .concat(atob(contract[9]))
            .concat(" , or if the address isn't valid for that blockchain. ");
        var s = cid
            .concat(": ")
            .concat(contract_string);
        return(s);
    };
    async function market_buttons(l){
        if((l.length) == 0){
            return(0);
        };
        var m = l[0];
        var cid1 = m[3];
        var type1 = m[4];
        var cid2 = m[5];
        var type2 = m[6];
        var name = "";
        if(type1 == 0) {
            name = name.concat("they sell veo and ");
        } else {
            name = name
                .concat("they sell subcurrency id ")
                .concat(cid1)
                .concat(" with type ")
                .concat(type1)
                .concat(" ");
        }
        if(type2 == 0) {
            name = name.concat("they buy veo.");
        } else {
            name = name
                .concat("they buy subcurrency id ")
                .concat(cid2)
                .concat(" with type ")
                .concat(type2)
                .concat(" ");
        }
        var button = button_maker2(name, async function(){
            var z = await rpc.apost(["read", m[2]], s_ip.value, parseInt(s_port.value));
            var orders = z[1][7];
            orders = orders.slice(1);
            orders_div.innerHTML = "<h3>available trades in market "
                .concat(m[2])
                .concat("</h3>");
            temp_div.appendChild(orders_div);
            display_orders(orders);
        });
        temp_div.appendChild(button);
        //["market", nonce, mid, cid1, type1, cid2, type2, 0]
        var contract1 = await rpc.apost(["read", 3, cid1], s_ip.value, parseInt(s_port.value));
        var contract2 = await rpc.apost(["read", 3, cid2], s_ip.value, parseInt(s_port.value));
        await buy_veo_viewer(temp_div, contract1, cid1);
        await buy_veo_viewer(temp_div, contract2, cid2);
        return(market_buttons(l.slice(1)));
    };
    async function buy_veo_viewer(temp_div, contract, cid){
        if(contract){
            var p = document.createElement("span");
            var a = document.createElement("a");
            a.innerHTML = "more details";
            a.href = "explorers/contract_explorer.html?cid=".concat(cid);
            a.target = "_blank";
            if(contract[0] === "contract"){
                p.innerHTML = await decode_market_veo_contract(cid, contract);
            } else {
                p.innerHTML = cid
                    .concat(": ")
                    .concat(atob(contract[1]));
            }
            temp_div.appendChild(p);
            temp_div.appendChild(a);
            temp_div.appendChild(document.createElement("br"));
        };
    };
    function display_orders(l){
        if((l.length) == 0) {
            return(0);
        };
        var order = l[0];
        var Maximum = 4294967295;
        var price = order[1] / Maximum;
        var amount = order[2];
        var tid = order[3];
        //-record(order, {price, amount, tid}).
        var name = "price is "
            .concat(price.toFixed(4))
            .concat(" amount is ")
            .concat(amount / token_units())
            .concat(". click to see more details.");
        var button = button_maker2(name, function(){
            trade_details(tid);
        });
        orders_div.appendChild(button);
        return(display_orders(l.slice(1)));
    };
    async function trade_details(tid){
        //if it is your own swap offer, then make a cancel offer button. todo.
        var t = await rpc.apost(["read", 2, tid], s_ip.value, parseInt(s_port.value));
        console.log(JSON.stringify(t));
        swap_viewer.offer(JSON.stringify(t));
        swap_viewer.view();
    };
    return({
        ip: function(x){s_ip.value = x},
        ip_get: s_ip.value,
        port: function(x){s_port.value = x},
        port_get: parseInt(s_port.value),
        refresh: refresh
    });
};

var explore_swap_offer = (explore_swap_offers_creator());
