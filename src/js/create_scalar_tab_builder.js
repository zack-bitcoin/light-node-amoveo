
function create_scalar_tab_builder(div, selector){
    var ZERO = btoa(array_to_string(integer_to_array(0, 32)));
    var display = document.createElement("div");
    var title = document.createElement("h3");
    title.innerHTML = "Create a new scalar derivative and a market for it ";
    div.appendChild(title);
    div.appendChild(br());
    div.appendChild(display);
    div.appendChild(br());
    var selector_label = document.createElement("span");
    selector_label.innerHTML = "source currency (i.e. the collateral backing the contract): ";
    div.appendChild(selector_label);
    div.appendChild(selector);
    div.appendChild(br());


    var oracle_text = text_input("A value that will be publicly known in the future (i.e. the temperature in a location as recorded on a particular website)", div);
    div.appendChild(br());
    var guess_text = text_input("initial guess of what the outcome will be.", div);
    div.appendChild(br());
    var min_text = text_input("lower limit of the range of values that this contract can measure.", div);
    div.appendChild(br());
    var max_text = text_input("upper limit of the range of values that this contract can measure.", div);
    div.appendChild(br());
    var amount_text = text_input("amount of source currency to put into the market as liquidity", div);
    div.appendChild(br());

    var button = button_maker2("make contract", make_contract);
    div.appendChild(button);

    function make_contract(){
        //MP is max price. we should rescale min to zero.
        var min = parseInt(min_text.value, 10);
        var guess = parseInt(guess_text.value, 10) - min;
        var MP = parseInt(max_text.value, 10) -
            min;
        var Text = oracle_text.value
            .concat(" minus ")
            .concat(min);
        var price = guess / MP;
        var amount = Math.round(parseFloat(amount_text.value)*token_units());
        if(price<0){
            console.log("initial guess must be greater than the minimum value that can be measured");
            return(0);
        };
        if(price>1){
            console.log("initial guess must be less than the maximum value that can be measured");
            return(0);
        };

        return(tabs.tabs.create.tab.make_contract2(Text, MP, price, amount, display, selector));
    };
    return({

    });
};
