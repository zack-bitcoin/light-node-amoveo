(function(){


    (async () => {
        var response = await fetch('https://www.sportsbookreview.com/betting-odds/');
        switch (response.status) {
            // status "OK"
        case 200:
            var template = await response.text();
            
            console.log(template);
            break;
            // status "Not Found"
        case 404:
            console.log('Not Found');
            break;
        }
    })();

    

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://www.sportsbookreview.com/betting-odds/", false);//false for synchronous
    console.log("here 0");
    xmlhttp.send();
    console.log(xmlhttp.responseText);
    xmlhttp.onload = function() {
        console.log("here");
        console.log(xmlhttp.response);
    };
    
    
    function makeHttpObject() {
  if("XMLHttpRequest" in window)return new XMLHttpRequest();
	else if("ActiveXObject" in window)return new ActiveXObject("Msxml2.XMLHTTP");
}

var request = makeHttpObject();
request.open("GET", "https://www.sportsbookreview.com/betting-odds/", true);
request.send(null);
request.onreadystatechange = function() {
  if (request.readyState == 4)
    console.log(request.responseText);
};

})();
