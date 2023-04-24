// declare & deploy a Cairo 1 contract.
// use of OZ deployer
// launch with npx ts-node src/scriptsA1/4b.declareDeployHello.ts

import { Provider, Account, Contract, ec, json, stark, uint256, shortString, constants } from "starknet";
// import { accountTestnet2ArgentX1Address,accountTestnet2ArgentX1privateKey } from "../../A2priv/A2priv";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });

    // initialize existing Argent X account
    const account0Address: string = "0x03038ae29ffd0258880b34b9ffdd37a02bd1b7a7e15ff183c69a0a1c18d30998";
    const privateKey1="0x02f38fb567d5d50d375d6ec3c7f12b22c5eb436a3d16ddfde17eeef8e26eb93b";
    console.log('AX3_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, privateKey1);
    console.log('existing AX account3 connected.\n');

    // Declare & deploy Test contract in testnet 2
    const compiledHelloSierra = json.parse(fs.readFileSync("./compiledContracts/TestCarContract.sierra").toString("ascii"));
    const compiledHelloCasm = json.parse(fs.readFileSync("./compiledContracts/TestCarContract.casm").toString("ascii"));
    const deployResponse = await account0.declare({ contract: compiledHelloSierra, casm: compiledHelloCasm });
    const contractClassHash = deployResponse.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);
    await provider.waitForTransaction(deployResponse.transaction_hash);

    const { transaction_hash: th2, contract_address } = await account0.deployContract({ classHash: contractClassHash});
    console.log("contract_address =", contract_address);
    await provider.waitForTransaction(th2);

    // Connect the new contract instance :
    const myTestContract = new Contract(compiledHelloSierra.abi, contract_address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });