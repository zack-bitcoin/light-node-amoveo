Amoveo light node
========

This is a light node for the Amoveo cryptocurrency.

[Click this link to download a zip file of the light node](https://github.com/zack-bitcoin/light-node-amoveo/archive/master.zip)

To connect to the mainnet with the light node, open src/js/home.html in a browser.

here is a list of full nodes that you can download headers from: [here](http://64.227.21.70:8080/peer_scan.html)
put the IP address of a full node into the light node so it knows where to download headers from.

This is the IP of a full node that I maintain: 64.227.21.70

It is easier, but less secure, to access the light node from [this link](http://64.227.21.70:8080/home.html)

Trade Explorer
========

 To connect to the mainnet with the trade explorer, open src/js/main.html in a browser. Usually just double clicking main.html works.

"My positions" will only show positions that are in a block. until then, you will see an unconfirmed negative balance so you know the trade was successfully sent out. press "show" to see your positions after the unconfirmed balance disappears.

A small percentage of your winnings will pay someone else to settle your trade, so you don't have to do anything after you accept. this is customizable.

 for now, the trades you see will be winner-take-all.
 
