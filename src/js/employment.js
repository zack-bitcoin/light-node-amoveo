(function(){
    var fee = 152050;
    var employment_div = document.createElement("div");
    document.body.appendChild(employment_div);

    employment_div.appendChild(title("create a new employment contract"));
    var jct_error = document.createElement("div");
    employment_div.appendChild(jct_error);
    //var jct_from = text_input("worker's address", employment_div);
    
    employment_div.appendChild(br());
    employment_div.appendChild(br());
    var jct_balance = text_input("boss's money stored in the contract for paying the salary", employment_div);
    employment_div.appendChild(br());
    var jct_value = text_input("how much you need to pay to buy this contract", employment_div);
    employment_div.appendChild(br());
    var jct_salary = text_input("your salary per block?", employment_div);


    //jct_from.value = "BGmNJSxjm0Qr2iKpNuxD812nHD1SC8vl9p+tWULUsI1JL1vPDHnmFi+K7N6pd1VF5d6SmbEBF03bF/NbSazKZVY=";
    jct_balance.value = "2";
    jct_value.value = "11";
    jct_salary.value = "0.001";


    employment_div.appendChild(br());
    var jct_button = button_maker2("create new job", create_new_job);
    employment_div.appendChild(jct_button);
    employment_div.appendChild(br());
    employment_div.appendChild(br());
    async function create_new_job(){
        //id = jobs:make_id(worker, salt)
        var salt = Date.now();
        var from = keys.pub();
        console.log(from);
        var from_acc = await rpc.apost(["account", from]);
        var nonce = from_acc[2] + 1;
        var value = parse_veo(jct_value.value);
        var balance = parse_veo(jct_balance.value);
        var salary_pb =
            parseInt(jct_salary.value);
        var salary = spb_to_salary(value, salary_pb);
        //todo
        // salt is an integer less than 256 bits.
        var id = make_id(from, salt);
        var jc_tx = ["job_create_tx", from, nonce, fee, salary, balance, value, id, salt];
        //["job_create_tx","BGmNJSxjm0Qr2iKpNuxD812nHD1SC8vl9p+tWULUsI1JL1vPDHnmFi+K7N6pd1VF5d6SmbEBF03bF/NbSazKZVY=",1,152050,167885818.1818182,20000000000000000,110000000000000000,[171,233,28,104,80,208,225,33,76,45,247,25,157,180,217,93,148,136,183,131,61,150,117,250,90,10,78,202,226,82,151,235],1699896034567]
        console.log(JSON.stringify(jc_tx));
        stx = keys.sign(jc_tx);
        var msg = await apost_txs([stx]);
        jct_error.innerHTML = msg;
    };
    var N64 = 1.846744 * 10000000000000000000
    function salary_per_block(Value, Salary) {
        return(Math.floor(Value * Salary / N64));
    };
    function spb_to_salary(Value, spv) {
        return(Math.floor(spv * N64 / Value));
    };
    function parse_veo(x) {
        return(Math.floor(parseFloat(x, 10) *
                          token_units()));
    };
    function compress_address(a){
        //if it is already compressed, then just return it.
        console.log(a);
        var b = atob(a);
        console.log(b);
        if (b.length === 33) {
            return(a);
        } else if(b.length === 65) {
            return(keys.compress_pub(a));//keys.compress_pub might have errors.
        } else {
            console.log("employment compress_address. unsupported data type.");
            console.log(a);
        };
    };
    function make_id(from, salt) {
        // todo calculate id from jobs:make_id/2
        //convert the address to 264 bit compressed version.
        //salt uses 256 bits.
        var salt256 = integer_to_array(salt, 32);
        var compressed_from = compress_address(from);
        var array_from = string_to_array(
            atob(compressed_from));
        var to_hash = array_from.concat(salt256);
        console.log(to_hash);
        var h = hash(to_hash);
        console.log(h);
        return(btoa(array_to_string(h)));
    };
    /*
* make a job.
    Tx1 = job_create_tx:make_dict(Pub, 100000000, Salary, 10000000, Fee),
-record(job_create_tx, {worker, nonce, fee, salary, balance, value, id, salt}).


* collect salary for a job.
    Tx2 = job_receive_salary_tx:make_dict(ID, Fee),
-record(job_receive_salary_tx, {worker, nonce, fee, id}).

* tool for buying an employees contract.
    Tx3 = job_buy_tx:make_dict(NewPub, ID, 50000000, Fee),
-record(job_buy_tx, {pub, nonce, fee, id, balance}).
* change the balance of a contract that you own.
* changing the price of a contract you own.
    Tx4 = job_adjust_tx:make_dict(ID, 20000000, 70000000, Fee),
-record(job_adjust_tx, {boss, nonce, fee, id, new_price, new_balance}).

* changing the employee's salary.
    Tx5 = job_team_adjust_tx:make_dict(ID, Salary * 3 div 2, 30000000,
-record(job_team_adjust_tx, {boss, worker, fee, nonce, new_salary, new_price, new_balance, id}).

* explorer for workers. 
     */


})();
