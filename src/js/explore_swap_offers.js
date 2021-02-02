var explore_swap_offer = (function() {
    var div = document.getElementById("explore_swap_offers");
    var display = document.createElement("p");
    div.appendChild(display);

    var s_ip = text_input("server ip: ", div);
    div.appendChild(br());
    s_ip.value = get_ip();
    
    var s_port = text_input("server port: ", div);
    div.appendChild(br());
    s_port.value = "8090";

    var refresh_button = button_maker2("refresh list of markets", refresh);
    div.appendChild(refresh_button);
    div.appendChild(br());

    var temp_div = document.createElement("div");
    div.appendChild(temp_div);
    var orders_div = document.createElement("div");

    function refresh(){
        rpc.post(["markets"], function(l) {
            l = l.slice(1);
            temp_div.innerHTML = "<h3>available markets</h3>";
            market_buttons(l);
        }, s_ip.value, parseInt(s_port.value));
    };
    refresh();
    function market_buttons(l){
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
        var button = button_maker2(name, function(){
            rpc.post(["read", m[2]],
                     function(z) {
                         var orders = z[1][7];
                         orders = orders.slice(1);
                         console.log(orders);
                         orders_div.innerHTML = "<h3>available trades in market "
                             .concat(m[2])
                             .concat("</h3>");
                         temp_div.appendChild(orders_div);
                         display_orders(orders);
                     },
                     s_ip.value, parseInt(s_port.value));
        });
        temp_div.appendChild(button);
        //["market", nonce, mid, cid1, type1, cid2, type2, 0]
        rpc.post(["read", 3, cid1], function(contract1){
            rpc.post(["read", 3, cid2], function(contract2){
                if(contract1){
                    var p = document.createElement("p");
                    p.innerHTML = cid1
                        .concat(": ")
                        .concat(atob(contract1[1]));
                    temp_div.appendChild(p);
                    temp_div.appendChild(p);
                }
                if(contract2){
                    var p = document.createElement("p");
                    p.innerHTML = cid2
                        .concat(": ")
                        .concat(atob(contract2[1]));
                    temp_div.appendChild(p);
                }
                return(market_buttons(l.slice(1)));
            }, s_ip.value, parseInt(s_port.value));
        }, s_ip.value, parseInt(s_port.value));
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
            .concat(price)
            .concat(" amount is ")
            .concat(amount)
            .concat(". click to see more details.");
        var button = button_maker2(name, function(){
            trade_details(tid);
        });
        orders_div.appendChild(button);
        return(display_orders(l.slice(1)));
    };
    function trade_details(tid){
        rpc.post(["read", 2, tid], function(t){
            console.log(JSON.stringify(t));
            //t = t[1];
            swap_viewer.offer(JSON.stringify(t));
            swap_viewer.view();
        }, s_ip.value, parseInt(s_port.value));
    };
    return({
        ip: function(x){s_ip.value = x},
        ip_get: s_ip.value,
        port: function(x){s_port.value = x},
        port_get: parseInt(s_port.value),
        refresh: refresh
    });

})();
