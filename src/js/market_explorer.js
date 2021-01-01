(function(){
    var ZERO = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        //server_ip.value = "159.89.87.58";
        server_ip.value = "0.0.0.0";
    };
    const urlParams = new URLSearchParams(window.location.search);
    var mid = urlParams.get('mid');
    mid = mid.replace(/\ /g, "+");
    rpc.post(["markets", mid], function(market){
        //full node
        console.log(JSON.stringify(market));
        //-record(market, {id, cid1, type1, amount1, cid2, type2, amount2, shares}).
        var cid1 = market[2];
        var type1 = market[3];
        var amount1 = market[4];
        var cid2 = market[5];
        var type2 = market[6];
        var amount2 = market[7];
        var volume = (Math.sqrt(amount1*amount2) / 100000000).toFixed(3).toString();
        var id_div = document.createElement("div");
        id_div.innerHTML = "market "
            .concat(mid)
            .concat(" liquidity: ")
            .concat(volume)
            .concat(" price: ")
            .concat((amount2 / (amount1 + amount2)).toFixed(4))
            .concat("");
        div.appendChild(id_div);
        var cid1_link = document.createElement("a");
        cid1_link.href = "contract_explorer.html?cid="
            .concat(cid1);
        cid1_link.innerHTML = "contract 1: "
            .concat(cid1.slice(0, 5))
            .concat("... ")
            .concat(" type: ")
            .concat(type1)
            .concat(" amount: ")
            .concat((amount1 / 100000000).toFixed(8))
        div.appendChild(cid1_link);
        div.appendChild(br());
        var cid2_link = document.createElement("a");
        cid2_link.href = "contract_explorer.html?cid="
            .concat(cid2);
        cid2_link.innerHTML = "contract 2: "
            .concat(cid2.slice(0, 5))
            .concat("... ")
            .concat(" type: ")
            .concat(type2)
            .concat(" amount: ")
            .concat((amount2 / 100000000).toFixed(8))
        div.appendChild(cid2_link);
        div.appendChild(br());
    });
    //to get the market from the explorer
    rpc.post(["market", mid], function(market){
        market = market[1];
        //console.log(get_ip());
        //console.log(JSON.stringify(market[10]));
        //console.log(JSON.stringify(market));
        rpc.post(["height"], function(height){
            var prices = market[10].slice(1);
            var liquidities = market[11].slice(1);
            var start_height = Math.min(prices.reverse()[0][1], liquidities.reverse()[0][1]);
            var end_height = height;
            console.log(JSON.stringify(prices));
            draw_graph(prices,
                       start_height,
                       end_height,
                       1,
                       colors[4]);
            var max_liquidity = liquidities
                .reduce(function(a, b){
                    return(Math.max(a, b[2]));
                }, 0);
            console.log(JSON.stringify(liquidities));
            //console.log(max_liquidity);
            draw_graph(liquidities,
                       start_height-Math.round(0.005*(end_height - start_height)),
                       end_height,
                       max_liquidity*1.01,
                       colors[0]);
            draw_grid(6, 4, start_height, height);
        });
    //};
    }, get_ip(), 8091);


    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var colors = ["#880000",//red
                  "#000000",//black
                  "#008800",//green
                  "#0033BB",//blue
                  "#0088FF",//light blue
                  "#FF0088",//pink
                  "#88FF00",//lime
                  "#FF8800",//neon orange
                  "#00FF88",//green3
                  "#FF0000",//bright red
                  "#555555",//grey
                 ];
    function draw_graph(prices, sh, end_height, price_scale, color){
        var w = canvas.width;
        var h = canvas.height;
        var b_range = end_height - sh;
        var ws = w/b_range;//width scale
        var block_height;
        var price;
        prices = prices.reverse();
        prices = ([[-7, end_height, prices[0][2]]])
            .concat(prices);
        var prev_block = prices[0][1];
        var prev_price = prices[0][2];
        var lw = h/100;
        ctx.lineWidth = lw;
        var hlw = lw/2.5;
        for(var i = 1; i<prices.length; i++){
            block_height = prices[i][1];
            price = prices[i][2];

            ctx.beginPath();
            ctx.moveTo(ws*(prev_block - sh)+hlw, h*(1-prev_price/price_scale));
            ctx.lineTo(ws*(prev_block - sh)+hlw, h*(1-price/price_scale));
            ctx.lineTo(ws*(block_height - sh), h*(1-price/price_scale));
            ctx.strokeStyle = color;
            ctx.stroke();
            
            prev_block = block_height;
            prev_price = price;
        };
    };
    function draw_grid(rows, columns, time_start, time_end){
        var time_range = time_end - time_start;
        var w = canvas.width;
        var h = canvas.height;

        ctx.font = (Math.round(h/10)).toString()
            .concat("px Georgia");
        ctx.fillStyle = colors[3];

        var lw = h/300;
        ctx.lineWidth = lw;
        var s;
        for(var i = 1; i<rows; i++){
            s = (1-(i/rows)).toFixed(2).toString();
            ctx.fillText(s, 0, i*h/rows - 2*lw);
            ctx.beginPath();
            ctx.moveTo(0, i*h/rows);
            ctx.lineTo(w, i*h/rows);
            ctx.strokeStyle = colors[10];
            ctx.stroke();
        };
        
        ctx.fillStyle = colors[1];
        ctx.font = (Math.round(h/15)).toString()
            .concat("px Georgia");
        s = time_start
            .toFixed(0).toString();
        ctx.fillText(s, 0, h);
        for(var i = 1; i<columns; i++){
            s = (time_start +
                 (time_range *
                  (1-(i/columns))))
                .toFixed(0).toString();
            ctx.fillText(s, (columns - i)*w/columns, h);
            ctx.beginPath();
            ctx.moveTo(i*w/columns, 0);
            ctx.lineTo(i*w/columns, h);
            ctx.strokeStyle = colors[10];
            ctx.stroke();
        };
    };
})();
