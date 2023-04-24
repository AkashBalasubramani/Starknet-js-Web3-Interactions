// declare & deploy a Cairo 1 contract.
// use of OZ deployer
// launch with npx ts-node src/scriptsA1/4b.declareDeployHello.ts

import { CallData,Provider, Account, Contract, ec, json, stark, uint256, shortString, constants } from "starknet";

import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

    const privateKey0 = "0x02f38fb567d5d50d375d6ec3c7f12b22c5eb436a3d16ddfde17eeef8e26eb93b"
    const account0Address: string = "0x03038ae29ffd0258880b34b9ffdd37a02bd1b7a7e15ff183c69a0a1c18d30998";
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('existing AX account2 connected.\n');

    // Declare & deploy Test contract in devnet
    const compiledHelloSierra = json.parse(fs.readFileSync("./compiledContracts/TestCarContract.sierra").toString("ascii"));
    const compiledHelloCasm = json.parse(fs.readFileSync("./compiledContracts/TestCarContract.casm").toString("ascii"));
    // const deployResponse = await account0.declare({ contract: compiledHelloSierra, casm: compiledHelloCasm });
    // const contractClassHash = deployResponse.class_hash;
    const contractClassHash= "0x47c15b31e0477442c673c2e63121eb1534b09d9bc0195a0f0a1300ad2726d58"
    console.log('✅ Test Contract declared with classHash =', contractClassHash);
    // await provider.waitForTransaction(deployResponse.transaction_hash);
    // const par1 = CallData.compile({
    //     _address: "0x00b7dc10a2c5dc61ac1067aec097754d5a3c9732fad3bda9226c53e7cc9fb821",
    //     _name: "0x496e70757420746f6f2073686f727420666f7220617267756d656e7473"
    // })

    const { transaction_hash: th2, contract_address } = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: {
        _address: "0x03038ae29ffd0258880b34b9ffdd37a02bd1b7a7e15ff183c69a0a1c18d30998",
        _name: "0x416b617368"
      } });
    console.log("contract_address =", contract_address);
    await provider.waitForTransaction(th2);

    // Connect the new contract instance :
    const myTestContract = new Contract(compiledHelloSierra.abi, contract_address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);
    //0x6e8f03920c0d761ef326bcca453925e4d0b180d37ac587a3895b61f2975d06a

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

//TestType3
    //0x305ef61e86f4566b8726d8867ef252d4f37f4b6418cad4288052738ee22a5d

    //con contract
    //0x6fc32e57d69c45eb6fc6d5bca1b8a0498c701bf8ff7a1a7a05c0c79888f551e




    //0x7341779c111272f0d24410652754b60bff193142790b4b467594e8cbeef85e9