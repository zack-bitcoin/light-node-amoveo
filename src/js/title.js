title_maker();
function title_maker() {
    var title = document.createElement("h1");
    title.innerHTML = "Light Wallet - Amoveo";
    document.body.appendChild(title);

    var github = document.createElement("p");
    github.innerHTML = "<a href=\"https://github.com/zack-bitcoin/amoveo\">home page </a>";
    document.body.appendChild(github);

    var reddit = document.createElement("p");
    reddit.innerHTML = "<a href=\"https://www.reddit.com/r/Amoveo/\">discuss on reddit</a>";
    document.body.appendChild(reddit);

    var explorer = document.createElement("p");
    explorer.innerHTML = ("<a href=\"/explorer.html\">").concat("Explorer on same server").concat("</a>");
    document.body.appendChild(explorer);

    var explorer2 = document.createElement("p");
    explorer2.innerHTML = ("<a href=\"http://159.65.120.84:8080/explorer.html\">").concat("Explorer on Zack's server").concat("</a>");
    document.body.appendChild(explorer2);

    var blockchain_title = document.createElement("h3");
    blockchain_title.innerHTML = "blockchain ";
    document.body.appendChild(blockchain_title);
};
