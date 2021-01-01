var market_explorer = (function(){
    var ZERO = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    var div = document.createElement("div");
    document.body.appendChild(div);
    server_port.value = "8080";
    if (server_ip.value == "") {
        //server_ip.value = "159.89.87.58";
        server_ip.value = "0.0.0.0";
    };

    if(auto_draw_config === true){
        const urlParams = new URLSearchParams(window.location.search);
        var mid = urlParams.get('mid');
        mid = mid.replace(/\ /g, "+");
        var canvas = document.getElementById("myCanvas");
        var main_ctx = canvas.getContext("2d");
        rpc.post(["market", mid], function(market){
            market = market[1];
            console.log(JSON.stringify(market));
            rpc.post(["markets", mid], function(market2){
                draw_internal(mid, market2);
                console.log(JSON.stringify(market2));
                });
        
            var liquidities = market[11].slice(1);
            draw(market, liquidities, canvas.width, canvas.height, function(temp_canvas){
                main_ctx.drawImage(temp_canvas, 0, 0, canvas.width, canvas.height);
            });
        }, get_ip(), 8091);
    };

    function draw_internal(mid, market){
        var cid1 = market[2];
        console.log(cid1);
        var cid2 = market[5];
        var type2 = market[6];
        var type1 = market[3];
        var amount1 = market[4];
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
    };
    
    function draw(e_market, liquidities, width, height, callback){
        //draw returns a temporary canvas in a callback function, so we can store an image for later use.
        //rpc.post(["markets", mid], function(market){
        //full node
        //console.log(JSON.stringify(market));
        //console.log(JSON.stringify(e_market));
        //-record(market, {id, cid1, type1, amount1, cid2, type2, amount2, shares}).
        //var cid1 = market[2];
        //var cid2 = market[5];
        //var type2 = market[6];
        //e market -record(market, {mid, height, txs = [], cid1, type1, cid2, type2, amount1, amount2, prices = [], liquidities = []}).
        var cid1 = e_market[4];
        var type1 = e_market[5];
        var cid2 = e_market[6];
        var type2 = e_market[7];

        //making a seperate function to clean up the namespace a bit.
        //to get the market from the explorer
        //rpc.post(["market", mid], function(e_market){
        var temp_canvas = document.createElement("canvas");
        //var temp_canvas.getContext('2d');
        temp_canvas.width = width;
        temp_canvas.height = height;
        var ctx = temp_canvas.getContext("2d");
            
        //market = market[1];
        //console.log(get_ip());
        //console.log(JSON.stringify(e_market[10]));
        rpc.post(["height"], function(height){
            var prices = e_market[10].slice(1);
            for(var i = 0; i<prices.length; i++){
                var n = prices[i][2];
                if(cid1 === cid2){
                    prices[i][2] = n/(1+n);
                } else if((cid1 === ZERO) &&
                          (type2 === 1)){
                    prices[i][2] = 1/n;
                } else if((cid1 === ZERO) &&
                          (type2 === 2)){
                    prices[i][2] = 1 - (1/n);
                } else {
                    console.log("unhandled price");
                }
            };
            var start_height = Math.min(prices.reverse()[0][1], liquidities.reverse()[0][1]);
            var end_height = height;
            var max_prob = 1;
            draw_graph(prices,
                       start_height,
                       end_height,
                       max_prob,
                       colors[4],
                       temp_canvas,
                       ctx);
            var max_liquidity = liquidities
                .reduce(function(a, b){
                    return(Math.max(a, b[2]));
                }, 0);
            //console.log(max_liquidity);
            draw_graph(liquidities,
                       start_height-Math.round(0.005*(end_height - start_height)),
                       end_height,
                       max_liquidity*1.01,
                       colors[9],
                       temp_canvas,
                       ctx);
            draw_grid(6, 4, start_height, height, max_prob, max_liquidity, temp_canvas, ctx, function(){
                callback(temp_canvas);
            });
        });
        //}, get_ip(), 8091);
    };
    //});


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
    function draw_graph(prices, sh, end_height, price_scale, color, temp_canvas, ctx){
        var w = temp_canvas.width;
        var h = temp_canvas.height;
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
    function draw_grid(rows, columns, time_start, time_end, max_prob, max_liquidity, temp_canvas, ctx, callback){
        var time_range = time_end - time_start;
        var w = temp_canvas.width;
        var h = temp_canvas.height;

        ctx.font = (Math.round(h/10)).toString()
            .concat("px Georgia");
        ctx.fillStyle = colors[3];

        var lw = h/300;
        ctx.lineWidth = lw;
        var s;
        for(var i = 1; i<rows; i++){
            s = (max_prob * (1-(i/rows))).toFixed(2).toString();
            ctx.fillText(s, 0, i*h/rows - 2*lw);
            ctx.beginPath();
            ctx.moveTo(0, i*h/rows);
            ctx.lineTo(w, i*h/rows);
            ctx.strokeStyle = colors[10];
            ctx.stroke();
        };
        for(var i = 1; i<rows; i++){
        ctx.fillStyle = colors[0];
            s = (max_liquidity * (1-(i/rows)) / 100000000).toFixed(2).toString();
            ctx.fillText(s, 4*w/5, i*h/rows - 2*lw);
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
        //ctx.fillText(s, 0, h);
        for(var i = 1; i<columns; i++){
        //    var blockheight =
         //       Math.round(
          //          time_start +
           //             (time_range *
            //             (1 - (i/columns))));
            //console.log(blockheight);
            ctx.beginPath();
            /*block_to_date(
                blockheight,
                function(s){
                    console.log("success");
                    ctx.fillText(s, (columns - i)*w/columns, h);
                }
            );*/
            ctx.moveTo(i*w/columns, 0);
            ctx.lineTo(i*w/columns, h);
            ctx.strokeStyle = colors[10];
            ctx.stroke();
            console.log(i);
            /*
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
            */
        };
        return(draw_dates(time_start, time_range, 0, columns, w, h, ctx, callback));
    };
    function draw_dates(time_start, time_range, i, columns, w, h, ctx, callback){
        if(i === columns){
            return(callback());
        };
        var blockheight =
            Math.round(
                time_start +
                    (time_range *
                     (1 - (i/columns))));
        console.log(ctx);
        //ctx.fillText("hello", 0, h);
        block_to_date(
            blockheight,
            function(s){
                //ctx.fillText("EEE", 0, h);
                console.log(s);
                console.log((columns - i)*w/columns);
                console.log(h);
                
                ctx.font = (Math.round(h/15)).toString()
                    .concat("px Georgia");
                ctx.fillStyle = colors[1];
                ctx.fillText(s, (columns-i-1)*w/columns, h);
                //ctx.stroke();
                return(draw_dates(time_start, time_range, i+1, columns, w, h, ctx, callback));
            });
    }; 
    function block_to_date(N, callback){
        rpc.post(["block", N], function(block){
            var time = block[4];
            console.log(time);
            var start_time = 15192951759;
            var n = (time + start_time);//10 * seconds since jan 1 1970
            console.log(n);
            var curdate = new Date(null);
            curdate.setTime(n*100);
            //var final_now = curdate.toLocaleString();
            var final_now = curdate.toGMTString();
            //curdate.toGMTString();
            //"Sun, 26 Apr 1970 17:46:40 GMT"
            console.log(final_now);
            final_now = final_now.match(/\d\d? \w\w\w /g)[0].trim().split(" ").reverse().reduce(function(a, b){return(a.concat(b))}, "");
            console.log(final_now);
            return(callback(final_now));
        });
    };
    //block_to_date(100000, function(date){
    //    return(0);
    //});



    return({
        draw: draw
    });
})();
