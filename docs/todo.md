Just finished  making changes. ready to test now.


otc finisher
* early close, acc1 first [x]
* early close, acc2 first [x]
* close on time, acc1 first [x]
* close on time, acc2 first [x]
* solo close timeout acc1 []
* solo close timeout acc2 []
* solo close acc1 slash timeout acc2 []
* solo close acc2 slash timeout acc1 []




otc_listener should say what block the oracle expires on.

otc_listener cp_start needs to be finished.

otc_finisher needs to know about the alternative way that spk can be signed.

otc_finisher needs to be able to use a trade_offer instead of channel state.

*otc finisher remove messenger
*otc finisher check that slashing works in both directions with the new kind of signing for spk.
*otc finisher




other stuff
##########

when you download an oracle question in oracles.lookup(), we should take the hash of the text and verify that it matches the merkel proof, to make sure it hasn't been manipulated.

progress bar when checking if smart contracts can be updated.

Maybe we should remove all the explorer stuff from this repository, and leave it with the full node.

a magnet torrent link for this repository.