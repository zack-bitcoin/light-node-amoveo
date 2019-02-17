Amoveo light node
========

This is a light node for the Amoveo cryptocurrency.

[Click this link to download a zip file of the light node](https://github.com/zack-bitcoin/light-node-amoveo/archive/master.zip)

To connect to the mainnet, open src/js/wallet.html in a browser.

here is a list of full nodes that you can download headers from: https://veoscan.io/
put the IP address of a full node into the light node so it knows where to download headers from.

This is the IP of a full node that I maintain:  159.65.120.84


To connect to the testnet, you want something like this as your url: file:///home/username/light_node/src/js/wallet.html?mode=test


## OTC P2P derivatives

To test it out on the testnet, there are 3 pages to use:
This page is for sending a trade offer to another user.
file:///home/username/light_node/src/js/otc_derivatives.html?mode=test
This page is for listening to trade offers, and deciding to accept or reject them.
file:///home/username/light_node/src/js/otc_listener.html?mode=test
This page is for closing the channel once the result of the bet is recorded in the oracle.
file:///home/username/light_node/src/js/otc_finisher.html?mode=test

here is a server where I have installed the message passing software: 139.59.144.76
That is the IP you use so you can send and receive trade requests.
It loads by default when you are using the testnet.

When using the OTC derivatives tool, often times you need to wait for blocks to be mined, and then sync headers, in order to continue the process. so click the "get more headers" button every once in a while.