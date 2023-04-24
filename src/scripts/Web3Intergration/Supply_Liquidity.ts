import { CallData, constants, Provider, Contract, Account, json, ec } from "starknet";
import fs from "fs";

async function main() {

    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    const privateKey1 = "0x02f38fb567d5d50d375d6ec3c7f12b22c5eb436a3d16ddfde17eeef8e26eb93b"

    // initialize existing Argent X account
    const account0Address: string = "0x03038ae29ffd0258880b34b9ffdd37a02bd1b7a7e15ff183c69a0a1c18d30998";
    console.log('Braavos1_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, privateKey1);
    console.log('existing Braavos1 connected.\n');

    const testAddress = "0x1206fc32e57d69c45eb6fc6d5bca1b8a0498c701bf8ff7a1a7a05c0c79888f551e"; // modify in accordance with result of script 4
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/Supply_Borrow.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('Test Contract connected at =', myTestContract.address);



}