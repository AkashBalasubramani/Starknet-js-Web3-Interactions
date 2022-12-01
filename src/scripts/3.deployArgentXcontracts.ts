// Deploy an instance of an already declared contract.
// Use of OZ deployer.

import { Provider, Account, Contract, defaultProvider, ec, json, stark, number, hash } from "starknet";
import { ec as EC } from "elliptic";
import fs from "fs";
import readline from "readline";
import axios from "axios";
import * as dotenv from "dotenv";
import { starknetKeccak } from "starknet/dist/utils/hash";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆
async function main() {
    //initialize Provider with DEVNET, reading .env file
    if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
        console.log("This script work only on local devnet.");
        process.exit(1);
    }
    const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });
    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // connect existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const account0Address: string = process.env.OZ_ACCOUNT_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, starkKeyPair0);
    console.log('existing OZ account0 connected.\n');

    // Declare Proxy and ArgentXaccount classes in devnet :
    const argentXproxyClassHash = "0x4a5cae61fa8312b0a3d0c44658b403d3e4197be80027fd5020ffcdf0c803331";
    const argentXaccountClassHash = "0x5cd533592dd40ee07a087e120dd30a7bd24efd54471a65755cc1d553094c7d7";

    const ArgentXproxyCompiled = json.parse(fs.readFileSync("./compiledContracts/ArgentProxy_0_2_3.json").toString("ascii"));
    const ArgentXaccountCompiled = json.parse(fs.readFileSync("./compiledContracts/ArgentAccount_0_2_3.json").toString("ascii"));

    // declare & deploy ArgentX proxy
    const { transaction_hash: AXPth, class_hash: AXPch } = await account0.declare({ classHash: argentXproxyClassHash, contract: ArgentXproxyCompiled });
    // declare ArgentXaccount
    const { transaction_hash: AXAth, class_hash: AXAch } = await account0.declare({ classHash: argentXaccountClassHash, contract: ArgentXaccountCompiled });

    // Calculate future address of the ArgentX account
    console.log('AX_ACCOUNT_PRIVATE_KEY=', process.env.AX_NEW_ACCOUNT_PRIVKEY);
    const privateKeyAX = process.env.AX_NEW_ACCOUNT_PRIVKEY ?? "";
    const starkKeyPairAX = ec.getKeyPair(privateKeyAX);
    const starkKeyPubAX = ec.getStarkKey(starkKeyPairAX);
    const AXproxyConstructorCallData = stark.compileCalldata({ implementation: AXAch, selector: hash.getSelectorFromName("initialize"), calldata: stark.compileCalldata({ signer: starkKeyPubAX, guardian: "0" }), });
    const AXcontractAddress = hash.calculateContractAddressFromHash(starkKeyPubAX, argentXaccountClassHash, AXproxyConstructorCallData, 0);
    console.log('Precalculated account address=', AXcontractAddress);

    // fund account address before account creation
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": AXcontractAddress, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer);

    // deploy ArgentX account
    const accountAX = new Account(provider, AXcontractAddress, starkKeyPairAX);

    const deployAccountPayload = {
        classHash: AXPch,
        constructorCalldata: AXproxyConstructorCallData, contractAddress: AXcontractAddress, addressSalt: starkKeyPubAX
    };

    const { transaction_hash: AXdAth, contract_address: AXcontractFinalAdress } = await accountAX.deployAccount(deployAccountPayload);

    console.log(`\nAccount contract deployment in progress...\n`);
    console.log(`Check deployment transaction status at \n\nhttps://testnet.starkscan.co/tx/${AXdAth}\n`
    );
    console.log(`Once the transaction is confirmed, the account is deployed at \n\nhttps://testnet.starkscan.co/tx/${AXcontractFinalAdress}\n`
    );





    // Connect the new contract :
    // const myTestContract = new Contract(compiledTest.abi, deployResponse.contract_address, provider);
    // console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });