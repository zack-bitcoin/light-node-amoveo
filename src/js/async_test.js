async function test1(){
    console.log("test1");
    return(5);
};

async function test2(){
    const x = await test1();
    const y = await test1();
    let z = await test1();

    console.log(x);
    console.log(y);
    console.log(z);
};
test2();
