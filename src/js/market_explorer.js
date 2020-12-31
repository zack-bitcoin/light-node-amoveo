(function(){
    var ZERO = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        server_ip.value = "159.89.87.58";
        //server_ip.value = "0.0.0.0";
    };
    const urlParams = new URLSearchParams(window.location.search);
    var mid = urlParams.get('mid');
    mid = mid.replace(/\ /g, "+");
    rpc.post(["markets", mid], function(market){
        //full node
        //console.log(JSON.stringify(market));
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
        rpc.post(["height"], function(height){
            draw_graph(market[10].slice(1),
                       height);
        });
    //};
    }, get_ip(), 8091);


    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var colors = ["#880000",//red
                  "#000000",//black
                  "#008800",//green
                  "#000088",//blue
                  "#0088FF",//blue claro
                  "#FF0088",//pink
                  "#88FF00",//lime
                  "#FF8800",//neon orange
                  "#00FF88",//green3
                  "#FF0000",//bright red
                 ];
    function draw_graph(prices, end_height){
        var w = canvas.width;
        var h = canvas.height;
        var sh = prices.reverse()[0][1];//start height
        var br = end_height - sh;
        var block_height;
        var price;
        prices = prices.reverse();
        prices = ([[-7, end_height, prices[0][2]]])
            .concat(prices);
        console.log(JSON.stringify(prices));
        //var prev_block = sh;
        var prev_block = prices[0][1];
        var prev_price = prices[0][2];
        for(var i = 1; i<prices.length; i++){
        //for(var i = 1; i<3; i++){
            block_height = prices[i][1];
            price = prices[i][2];
            ctx.moveTo(w*(prev_block - sh)/br, h);
            ctx.lineTo(w*(block_height - sh)/br, h);
            ctx.lineTo(w*(block_height - sh)/br, h*(1-prev_price));
            ctx.lineTo(w*(prev_block - sh)/br, h*(1-prev_price));
            ctx.fillStyle = colors[4];
            ctx.fill();
            
            prev_block = block_height;
            prev_price = price;
        };
        for(var i = 1; i<6; i++){
            ctx.beginPath();
            ctx.moveTo(0, i*h/6);
            ctx.lineTo(w, i*h/6);
            ctx.fillStyle = colors[1];
            ctx.stroke();
        };
        for(var i = 1; i<4; i++){
            ctx.beginPath();
            ctx.moveTo(i*w/4, 0);
            ctx.lineTo(i*w/4, h);
            ctx.fillStyle = colors[1];
            ctx.stroke();
        };
        
        /*
        ctx.moveTo(10, 10);
        ctx.lineTo(10, 30);
        ctx.lineTo(20, 20);
        ctx.lineTo(20, 10);
        ctx.fillStyle = colors[1];
        ctx.fill();
        */
    };
})();
