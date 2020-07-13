var glossary = (function(){
    function helper(div, name) {
        return helper2(div, name, "(?)");
    };
    function helper2(div, name, s) {
        var x = document.createElement("a");
        x.innerHTML = s;
        x.href = "https://github.com/zack-bitcoin/amoveo/tree/master/docs/light_node/glossary/".concat(name).concat(".md");
        x.target = "_blank";
    //    div.appendChild(x);
    };
    return {link: helper, link2: helper2}
})();
