(function(){
    var fee = 152050;
    var employment_div = document.createElement("div");
    document.body.appendChild(employment_div);

    employment_div.appendChild(title("lookup a job by id"));
    var jid_error = document.createElement("div");
    employment_div.appendChild(jid_error);
    var jid_value = text_input("id", employment_div);
    employment_div.appendChild(br());
    var jid_button = button_maker2("lookup the job", lookup_job);
    employment_div.appendChild(jid_button);
    employment_div.appendChild(br());
    employment_div.appendChild(br());
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

    jct_balance.value = "2";
    jct_value.value = "1.3";
    jct_salary.value = "0.001";

    employment_div.appendChild(br());
    var jct_button = button_maker2("publish tx to create new job", create_new_job);
    employment_div.appendChild(jct_button);
    employment_div.appendChild(br());
    employment_div.appendChild(br());

    employment_div.appendChild(title("receive salary from your job."));
    var jrst_error = document.createElement("div");
    employment_div.appendChild(jrst_error);
    var jrst_id = text_input("job id", employment_div);
    employment_div.appendChild(br());
    var jrst_button = button_maker2("publish tx to receive salary", receive_salary);
    employment_div.appendChild(jrst_button);
    employment_div.appendChild(br());
    employment_div.appendChild(br());

    jrst_id.value = "";

    employment_div.appendChild(title("purchase an employment contract to hire a worker."));
    var jbt_error = document.createElement("div");
    employment_div.appendChild(jbt_error);
    var jbt_id = text_input("job id", employment_div);
    employment_div.appendChild(br());
    var jbt_balance = text_input("balance in reserve of funds used to pay the salary.", employment_div);
    employment_div.appendChild(br());
    var jbt_button = button_maker2("publish tx to hire this worker", buy_job);
    employment_div.appendChild(jbt_button);

    jbt_id.value = "";

    employment_div.appendChild(title("adjust the settings in the employment contract for one of your workers."));
    var jat_error = document.createElement("div");
    employment_div.appendChild(jat_error);
    var jat_id = text_input("job id", employment_div);
    employment_div.appendChild(br());
    var jat_price = text_input(
        "contract for sale price", employment_div);
    employment_div.appendChild(br());
    var jat_balance = text_input(
        "contract balance used to pay salary", employment_div);
    employment_div.appendChild(br());
    var jat_button = button_maker2("publish tx to adjust this contract", adjust_job);
    employment_div.appendChild(jat_button);

    jat_id.value = "";
    jat_price.value = "1";
    jat_balance.value = "1.5";

    employment_div.appendChild(title("adjust the salary in the employment contract for one of your workers."));
    var jtat_error = document.createElement("div");
    employment_div.appendChild(jtat_error);
    var jtat_id = text_input("job id", employment_div);
    employment_div.appendChild(br());
    var jtat_price = text_input(
        "contract price", employment_div);
    employment_div.appendChild(br());
    var jtat_balance = text_input(
        "contract balance", employment_div);
    employment_div.appendChild(br());
    var jtat_salary = text_input(
        "contract salary per block", employment_div);
    employment_div.appendChild(br());
    var jtat_button = button_maker2("sign and print tx", team_adjust_job);
    employment_div.appendChild(jtat_button);

    jtat_id.value = "";
    jtat_price.value = "1";
    jtat_balance.value = "1.5";
    jtat_salary.value = "0.0013";


    async function lookup_job(){
        var jid = jid_value.value;

        var job = await rpc.apost(["jobs", jid]);
        var id = job[1];
        var worker = job[2];
        var boss = job[3];
        var value = job[4];
        var salary = job[5];
        var balance = job[6];
        var time = job[7];
        var N64 = 18446744073709551616;//2^64
        var salary_per_block = value * salary / N64;
        var s = "";
        s = s.concat("job id: ").concat(id);
        s = s.concat("<br>");
        s = s.concat("worker: ").concat(worker);
        s = s.concat("<br>");
        s = s.concat("boss: ").concat(boss);
        s = s.concat("<br>");
        s = s.concat("value: ").concat(write_veo(value));
        s = s.concat("<br>");
        s = s.concat("salary per block: ").concat(write_veo(salary_per_block));
        s = s.concat("<br>");
        s = s.concat("balance: ").concat(write_veo(balance));
        s = s.concat("<br>");
        s = s.concat("time: ").concat(time);
        console.log(job);
        jid_error.innerHTML = s;
    };
    
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
            parse_veo(jct_salary.value);
        var salary = spb_to_salary(value, salary_pb);
        console.log(["salary", salary, salary_pb, value]);
        //todo
        // salt is an integer less than 256 bits.
        var id = make_id(from, salt);
        var jc_tx = ["job_create_tx", from, nonce, fee, salary, balance, value, id, salt];
        //["job_create_tx","BGmNJSxjm0Qr2iKpNuxD812nHD1SC8vl9p+tWULUsI1JL1vPDHnmFi+K7N6pd1VF5d6SmbEBF03bF/NbSazKZVY=",1,152050,167885818.1818182,20000000000000000,110000000000000000,[171,233,28,104,80,208,225,33,76,45,247,25,157,180,217,93,148,136,183,131,61,150,117,250,90,10,78,202,226,82,151,235],1699896034567]
        console.log(JSON.stringify(jc_tx));
        var stx = keys.sign(jc_tx);
        var msg = await apost_txs([stx]);
        jct_error.innerHTML = "job id: "
            .concat(id)
            .concat(" ")
            .concat(msg);
    };
    async function receive_salary(){
        var from = keys.pub();
        var from_acc = await rpc.apost(["account", from]);
        var nonce = from_acc[2] + 1;
        var id = jrst_id.value;
        var jrst_tx = ["job_receive_salary_tx", from, nonce, fee, id];
        console.log(JSON.stringify(jrst_tx));
        var stx = keys.sign(jrst_tx);
        var msg = await apost_txs([stx]);
        jrst_error.innerHTML = msg;
    };
    async function buy_job(){
//-record(job_buy_tx, {pub, nonce, fee, id, balance}).
        var from = keys.pub();
        var from_acc = await rpc.apost(["account", from]);
        var nonce = from_acc[2] + 1;
        var id = jbt_id.value;
        var balance = parseInt(jbt_balance.value);
        var jbt_tx = ["job_buy_tx", from, nonce, fee, id, balance];
        console.log(JSON.stringify(jbt_tx));
        var stx = keys.sign(jbt_tx);
        var msg = await apost_txs([stx]);
        jbt_error.innerHTML = msg;
    };
    async function adjust_job(){
//-record(job_adjust_tx, {boss, nonce, fee, id, new_price, new_balance}).
        var from = keys.pub();
        var from_acc = await rpc.apost(["account", from]);
        var nonce = from_acc[2] + 1;
        var id = jat_id.value;
        var price = parse_veo(jat_price.value);
        var balance = parse_veo(jat_balance.value);
        var jat_tx = ["job_adjust_tx", from, nonce, fee, id, price, balance];
        console.log(JSON.stringify(jat_tx));
        var stx = keys.sign(jat_tx);
        var msg = await apost_txs([stx]);
        jat_error.innerHTML = msg;
    };
    async function team_adjust_job(){
//-record(job_team_adjust_tx, {boss, worker, fee, nonce, new_salary, new_price, new_balance, id}).
        var from = keys.pub();
        var from_acc = await rpc.apost(["account", from]);
        var nonce = from_acc[2] + 1;
        var id = jtat_id.value;
        var job = await rpc.apost(["jobs", id]);
        var worker = job[2];
        var price = parse_veo(jtat_price.value);
        var balance = parse_veo(jtat_balance.value);
        var salary = parse_veo(jtat_salary.value);
        var jtat_tx = ["job_team_adjust_tx", from, worker, fee, nonce, salary, price, balance, id];
        var stx = keys.sign(jtat_tx);
        //var msg = await apost_txs([stx]);
        jtat_error.innerHTML = "the employee needs to sign this before it can be published: ".concat(JSON.stringify(stx));
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
