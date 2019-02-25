var glossary = (function(){
    function helper(div, name) {
        var x = document.createElement("a");
        x.innerHTML = "(?)";
        x.href = "https://github.com/zack-bitcoin/amoveo/tree/master/docs/light_node/glossary/".concat(name).concat(".md");
        div.appendChild(x);
    };
    return {link: helper}
})();
