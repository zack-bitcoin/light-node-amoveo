(function otc_finisher() {
    var div = document.createElement("div");
    document.body.appendChild(div);
    var title = document.createElement("h3");
    title.innerHTML = "direct derivatives response form";
    div.appendChild(title);
    var status = document.createElement("p");
    status.innerHTML = "status: <font color=\"orange\">waiting for you to load the channel state</font>";
    div.appendChild(status);
    //give interface for loading channel states.
    //when a channel state is loaded, display a message. either the contract isn't ready to be closed, or it is already closed, or it isn't a valid contract file, or it is ready to be closed.

    //the light node checks if the channel is already closed. if it is, { it tells Alice about the final state of the channel, and tells her that it is now safe to delete the file from step (6). } otherwise continue
    //The light node checks the channel_close_messages on Alice's server. If Bob sent a signed channel_close_tx, and it has the correct final state, then { Carol's light node signs and publishes the tx, it says a message about how the channel is done, it is safe to delete the file from step (6) } otherwise continue
    // Bob hasn't sent the message to close the channel, so Carol's light node sends the signed tx to Bob as a channel_close_message in Alice's server.
    //Carol's light node gives Carol a message saying that we are waiting on Bob to close the channel. It gives her a button to start closing the channel without Bob's help, along with a warning about how closing without Bob will break privacy and cost a larger fee, and it will probably take longer than just waiting for Bob to sign the tx. The light node tells her to keep a copy of the file from step (6) until the channel is closed.
})();
