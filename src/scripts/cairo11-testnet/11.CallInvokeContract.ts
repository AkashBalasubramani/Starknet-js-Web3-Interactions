// connect a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/11.CallInvokeContract.ts
// Coded with Starknet.js v5.4.2

import { CallData, constants, Provider, Contract, Account, json, ec, } from "starknet";

import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    const privateKey1 = "0x02f38fb567d5d50d375d6ec3c7f12b22c5eb436a3d16ddfde17eeef8e26eb93b"

    // initialize existing Argent X account
    const account0Address: string = "0x03038ae29ffd0258880b34b9ffdd37a02bd1b7a7e15ff183c69a0a1c18d30998";
    console.log('Braavos1_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, privateKey1);
    console.log('existing Braavos1 connected.\n');


    // Connect the deployed Test instance in devnet
    const testAddress = "0x06fc32e57d69c45eb6fc6d5bca1b8a0498c701bf8ff7a1a7a05c0c79888f551e"; // modify in accordance with result of script 4
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/con.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke
    myTestContract.connect(account0);
    const par1 = CallData.compile({
        _address: "0x00b7dc10a2c5dc61ac1067aec097754d5a3c9732fad3bda9226c53e7cc9fb821",
    })
    const res1 = await myTestContract.getName(par1, { parseRequest: false, parseResponse: false, });
 


    // const res2 = await myTestContract.test2(par1, { parseRequest: false, parseResponse: false, });
    // const res3 = await myTestContract.test3({ parseRequest: false, parseResponse: false, });
    // const tx = await myTestContract.storeName(
    //     CallData.compile({
    //         _name : "AkashTesting",
    //     })
    // );
    // 🚨 do not work in V5.1.0
    //const bal1b = await myTestContract.call("get_balance");
    // console.log("res1 =", uint256.res1);
    console.log("res1 =", res1);

    // console.log("res3 =", res3);
    // await provider.waitForTransaction(tx.transaction_hash);

    // const balance = await myTestContract.get_balance({
    //     parseRequest: false,
    //     parseResponse: false,
    // });
    // console.log("res4 =", balance);
    // console.log("Initial balance =", bal1b.res.toString());
    // estimate fee
    // const { suggestedMaxFee: estimatedFee1 } = await account0.estimateInvokeFee({ contractAddress: testAddress, entrypoint: "increase_balance", calldata: ["10", "30"] });

    // const resu = await myTestContract.invoke("increase_balance", [10, 30]);
    // await provider.waitForTransaction(resu.transaction_hash);
    // const bal2 = await myTestContract.get_balance();
    // console.log("Initial balance =", bal2.res.toString());
    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });