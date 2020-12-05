function create_binary_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var display = document.createElement("div");
    var title = document.createElement("h3");
    title.innerHTML = "Create a new binary derivative and a market for it ";
    div.appendChild(title);
    div.appendChild(br());
    div.appendChild(display);
    div.appendChild(br());
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "source currency (i.e. the collateral backing the contract): ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());

    var oracle_text = text_input("A statement that will be either true or false (i.e. trump is elected for second consecutive term as president)", div);
    div.appendChild(br());
    var probability_text = text_input("initial probability of TRUE outcome. should be between 0 and 1.", div);
    div.appendChild(br());
    var amount_text = text_input("amount of source currency to put into the market as liquidity", div);
    div.appendChild(br());
    var button = button_maker2("make contract", make_contract);
    div.appendChild(button);

    function make_contract(){
        var Text = oracle_text.value;
        var MP = 1;
        var price = parseFloat(probability_text.value);
        if(price<0){
            console.log("price must be greater than 0");
            return(0);
        };
        if(price>1){
            console.log("price must be less than 1");
            return(0);
        };
        var amount = Math.round(parseFloat(amount_text.value)*token_units());
        //return(tabs.create.make_contract2(Text, MP, price, amount, display));
        return(tabs.tabs.create.tab.make_contract2(Text, MP, price, amount, display));
    };
    return({
        oracle:(function(x){oracle_text.value = x}),
        probability:(function(x){probability_text.value = x})
    });
};
