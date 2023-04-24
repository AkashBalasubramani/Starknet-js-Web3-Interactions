const starknet = require("starknet")
import { Provider, Contract, json, Account, ec, stark, uint256, constants} from "starknet"
import fs from "fs"
import BN from "bn.js"

// import { toFelt } from 'starknet/dist/utils/number';

type LoanParams = {
  market: any
  amount: number
  rTokent: any
  rTokenAmount: number
  recipient: any
}

let provider: any
let account: Account
let compiledLoan: any
let compiledIntegration: any
// let deployer: Account

const testAddress = "327hnwje23"
const recipient = "0x23bh342bk23rc"


async function run() {
//   console.log("Run entered")
//   provider = new Provider({
//     sequencer: { baseUrl: "https://alpha4-2.starknet.io" },
//   })

const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
const privateKey =
"212258608641941142391565116085834234119001070165635825525199700607827502965"
const accountAddress =
"0xd2a770ce3045a2daad4de8ea0c20f9f22494d6c5ecbabb70fbab3c4898257a"

account = new Account(provider, accountAddress, privateKey);
console.log("Account connected\n");
// deployer = account

  console.log("Run working 1")

  //Connecting with the deployed contract and creating an instance

  
//   const compiledTest = json.parse(fs.readFileSync("./compiledContracts/con.sierra").toString("ascii"));
//   const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
//   console.log('Test Contract connected at =', myTestContract.address);

 
  /// transaction parameters here
  //BTC market rn
  const btc_market = starknet.number.toFelt(
    "0x5b2a7c089e36c6caf4724d2df5bd7687fcdc9bd76d280ecb1e411410811b54e"
  )
  //USDT market rn
  const usdc_market = starknet.number.toFelt(
    "0x53ec5bbf8c6b5aeeb4e08c3e4c8fdcda2dc32cd4b1ec3ea7a347ba5e5617371"
  )
  const eth_market = starknet.number.toFelt(
    "0x2aafa44aeade8d4e4c048970151ebe47f79ef89c95d06a6eeb2ec076588bf27"
  )
  
  const loan_amt = uint256.bnToUint256(new BN("5000000000000000"))
  const collateral_amount = uint256.bnToUint256(
    new BN("30000000000000000000000")
  ) // actual amt * decimals

  const add_collateral_amt = uint256.bnToUint256(new BN("10000000000000"))
  const repay_amt = uint256.bnToUint256(new BN("0000000000000000")) //Set repay amt in terms of loan_amt for easy tracking

  // const loanParams = [btc_market, loan_amt, 0, eth_market, collateral_amount]

  const JEDI_SWAP = "1962660952167394271600" // str_to_felt("jedi_swap")
  const MY_SWAP = "30814223327519088" // str_to_felt("my_swap")

  try {
    console.log("Approving transfer...")
    //Approve(eth_market, loan_amt, account, diamondAddress)
    //Approve and loan multicall
    const multiCall = await account.execute([
      // Calling the market address
      {
        contractAddress: usdc_market,
        entrypoint: "approve",
        // approve 1 wei for bridge
        calldata: [
            testAddress,                 
          collateral_amount.low,
          collateral_amount.high,
        ],
      },
      // Calling the borrow contract
      {
        contractAddress: testAddress,
        entrypoint: "loan_request",
        // transfer 1 wei to the contract address
        // calldata.(loanParams),
        calldata: [
          btc_market,
          loan_amt.low,
          loan_amt.high,
          usdc_market,
          collateral_amount.low,
          collateral_amount.high,
          recipient,

        ],
      },
    ])
    console.log("Create loan tx", multiCall.transaction_hash)
    await provider.waitForTransaction(multiCall.transaction_hash)
    console.log("Loan created")



    // --------------------------------------------------------------------------

    //console.log("Inititating loan ...")
    //loan_request(btc_market, loan_amt, 0, eth_market, collateral_amount)

    let loan_id_returned = await getUserLoan(account.address, eth_market, 0)
    let loan_id = starknet.number.toFelt(loan_id_returned[0])
    console.log("Loan id is : ", loan_id)
    //To check collateral record at any time for account user
    //await printUserCollateral(loan_id)

    // let max_loan_amt = await getMaxWithdrawableLoan(loan_id)
    // max_loan_amt = max_loan_amt[0]
    // console.log(
    //   "Max withdrawable loan amount is: ",
    //   uint256.uint256ToBN(max_loan_amt).toString()
    // )
    console.log("Add collateral")
    Approve(usdc_market, add_collateral_amt, account, testAddress)
    addCollateral(loan_id, add_collateral_amt)

    withdrawPartialLoan(loan_id, uint256.bnToUint256(new BN("6660682226211")))

    //interactWithL3(MY_SWAP, loan_id, btc_market)
    //await getL3ViewDetails(JEDI_SWAP, loan_id)
    //revertInteractionWithL3(loan_id)
    //await getL3ViewDetails(JEDI_SWAP, loan_id)
    //Approve(usdc_market, add_collateral_amt, account, diamondAddress)
    //console.log("Repay collateral")
    loanRepay(eth_market, 0, repay_amt)
    //console.log("Withdraw collateral")
    //withdrawCollateral(loan_id)
    // For liquidation
    //mockEmpiricAddress = deployEmpiric()
  } catch (err) {
    console.log("err", err)
  }
}

async function Approve(market: any, amount: any, from: Account, to: string) {
  const erc20 = new Contract(erc20abi, market, provider)
  erc20.connect(from)
  let nonce = await from.getNonce()

  const approve_tx = await erc20.invoke("approve", [to, amount], {
    maxFee: "1000000000000000000",
    nonce: nonce.toString(),
  })
  console.log("Approve tx:", approve_tx)
  await provider.waitForTransaction(approve_tx.transaction_hash)
}

// async function loan_request(
//   market: any,
//   amount: any,
//   commitment: number,
//   collateral_market: any,
//   collateral_amount: any
// ) {
//   const loanModule = new Contract(compiledLoan.abi, diamondAddress, provider)
//   let nonce = await account.getNonce()

//   loanModule.connect(account)
//   nonce = await account.getNonce()

//   let loanParams: any = [
//     market,
//     amount,
//     commitment,
//     collateral_market,
//     collateral_amount,
//   ]
//   console.log(await loanModule.estimate("loan_request", loanParams))

//   console.log("Initiating loan...")
//   const resu = await loanModule.invoke("loan_request", loanParams, {
//     maxFee: "1000000000000000000",
//     nonce: nonce.toString(),
//   })
//   console.log("Loan request", resu.transaction_hash)
//   await provider.waitForTransaction(resu.transaction_hash)
//   console.log("done")
// }

async function addCollateral(loan_id: any, collateral_amount: any) {
  const loanModule = new Contract(compiledLoan.abi, testAddress, provider)
  let nonce = await account.getNonce()

  loanModule.connect(account)
  nonce = await account.getNonce()

  let callParams: any = [loan_id, collateral_amount]
  console.log(await loanModule.estimate("add_collateral", callParams))

  console.log("Initiating add collateral...")
  const add_collateral_tx = await loanModule.invoke(
    "add_collateral",
    callParams,
    {
      maxFee: "1000000000000000000",
      nonce: nonce.toString(),
    }
  )
  console.log("Add collateral:", add_collateral_tx)
  await provider.waitForTransaction(add_collateral_tx.transaction_hash)
  console.log("done")
}

async function withdrawPartialLoan(loan_id: any, withdrawal_amount: any) {
  const loanModule = new Contract(compiledLoan.abi, diamondAddress, provider)
  let nonce = await account.getNonce()

  loanModule.connect(account)
  nonce = await account.getNonce()

  let callParams: any = [loan_id, withdrawal_amount]
  console.log(await loanModule.estimate("withdraw_partial_loan", callParams))

  console.log("Initiating withdraw partial loan...")
  const withdraw_partial_loan_tx = await loanModule.invoke(
    "withdraw_partial_loan",
    callParams,
    {
      maxFee: "1000000000000000000",
      nonce: nonce.toString(),
    }
  )
  console.log("Withdraw Partial Loan:", withdraw_partial_loan_tx)
  await provider.waitForTransaction(withdraw_partial_loan_tx.transaction_hash)
  console.log("done")
}

async function withdrawCollateral(loan_id: any) {
  const loanModule = new Contract(compiledLoan.abi, diamondAddress, provider)
  let nonce = await account.getNonce()

  loanModule.connect(account)
  nonce = await account.getNonce()

  let callParams: any = [loan_id]
  console.log(await loanModule.estimate("withdraw_collateral", callParams))

  console.log("Initiating withdraw collateral...")
  const withdraw_collateral_tx = await loanModule.invoke(
    "withdraw_collateral",
    callParams,
    {
      maxFee: "1000000000000000000",
      nonce: nonce.toString(),
    }
  )
  console.log("Withdraw collateral tx: ", withdraw_collateral_tx)
  await provider.waitForTransaction(withdraw_collateral_tx.transaction_hash)
  console.log("done")
}

async function loanRepay(market: any, commitment: number, repay_amt: any) {
  const loanModule = new Contract(compiledLoan.abi, diamondAddress, provider)
  let nonce = await account.getNonce()

  loanModule.connect(account)
  nonce = await account.getNonce()

  let callParams: any = [market, commitment, repay_amt]
  //console.log(await loanModule.estimate("loan_repay", callParams))

  console.log("Initiating repay loan....")
  const loan_repay_tx = await loanModule.invoke("loan_repay", callParams, {
    maxFee: "8923163328978309",
    nonce: nonce.toString(),
  })
  console.log("Repay loan tx: ", loan_repay_tx)
  await provider.waitForTransaction(loan_repay_tx.transaction_hash)
  console.log("done")
}

async function getUserLoan(user: any, market: any, commitment: number) {
  const loanModule = new Contract(compiledLoan.abi, testAddress, provider)
  loanModule.connect(account)

  let callParams: any = [user, market, commitment]
  let loan_id: any = await loanModule.call("get_user_loan", callParams)
  return loan_id
}

// async function getMaxWithdrawableLoan(loan_id: any) {
//   const loanModule = new Contract(compiledLoan.abi, testAddress, provider)
//   loanModule.connect(account)

//   let callParams: any = [loan_id]
//   let max_withdrawal_loan_amt: any = await loanModule.call(
//     "get_max_withdrawal_amount",
//     callParams
//   )
//   return max_withdrawal_loan_amt
// }

async function printUserCollateral(loan_id: any) {
  const loanModule = new Contract(compiledLoan.abi, diamondAddress, provider)
  loanModule.connect(account)

  let callParams: any = [loan_id]
  let collateral_record: any = await loanModule.call(
    "get_collateral",
    callParams
  )
  collateral_record = collateral_record[0]
  console.log("Collateral record: market is : ")
  console.log(
    "Collateral record: amount is : ",
    uint256.uint256ToBN(collateral_record.amount).toString()
  )
  console.log(
    "Collateral record: current_amount is : ",
    uint256.uint256ToBN(collateral_record.current_amount).toString()
  )
  console.log(
    "Collateral record: commitment is : ",
    starknet.number.toFelt(collateral_record.commitment).toString()
  )
  console.log(
    "Collateral record: timelock_validity is : ",
    starknet.number.toFelt(collateral_record.timelock_validity).toString()
  )
  console.log(
    "Collateral record : is_timelock_activated is",
    starknet.number.toFelt(collateral_record.is_timelock_activated).toString()
  )
  console.log(
    "Collateral record : activation_time is",
    starknet.number.toFelt(collateral_record.activation_time).toString()
  )
  return collateral_record
}

async function interactWithL3(
  integration: any,
  loan_id: any,
  secondaryMarket: any
) {
  const integrationModule = new Contract(
    compiledIntegration.abi,
    diamondAddress,
    provider
  )
  let nonce = await account.getNonce()

  integrationModule.connect(account)
  nonce = await account.getNonce()

  let callParams: any = [integration, [loan_id, secondaryMarket]]
  console.log(await integrationModule.estimate("interact_with_l3", callParams))

  console.log("Initiating interaction with L3....")
  const integration_tx = await integrationModule.invoke(
    "interact_with_l3",
    callParams,
    {
      maxFee: "15000000000000000",
      nonce: nonce.toString(),
    }
  )
  console.log("integration tx: ", integration_tx)
  await provider.waitForTransaction(integration_tx.transaction_hash)
  console.log("done")
}

async function revertInteractionWithL3(loan_id: any) {
  const integrationModule = new Contract(
    compiledIntegration.abi,
    diamondAddress,
    provider
  )
  let nonce = await account.getNonce()

  integrationModule.connect(account)
  nonce = await account.getNonce()

  let callParams: any = [loan_id]
  console.log(
    await integrationModule.estimate("revert_interaction_with_l3", callParams)
  )

  console.log("Initiating revert interaction with L3....")
  const revert_integration_tx = await integrationModule.invoke(
    "revert_interaction_with_l3",
    callParams,
    {
      maxFee: "15000000000000000",
      nonce: nonce.toString(),
    }
  )
  console.log("revert integration_repay tx: ", revert_integration_tx)
  await provider.waitForTransaction(revert_integration_tx.transaction_hash)
  console.log("done")
}

async function getL3ViewDetails(integration: any, loanId: any) {
  console.log("Getting L3 loan details")
  const integrationModule = new Contract(
    compiledIntegration.abi,
    diamondAddress,
    provider
  )
  integrationModule.connect(account)

  let callParams: any = [integration, loanId]
  let l3_details: any = await integrationModule.call("view_details", callParams)
  console.log("Getting L3 loan details DONE")
  console.log("l3_details", l3_details)
  return l3_details
}

// async function deployEmpiric() {
//   const preloadedAccount1: Account =
//     await starknet.OpenZeppelinAccount.getAccountFromAddress(
//       "0x05dea4121a1917c3e766f19fe001977e2dd5a3e81d4236f2457736de279f7ef7",
//       "193813870439150508944637146898494566729678980683883299886703651746677556236"
//     )
//   console.log("Deployed preloadedAccount1 ", preloadedAccount1.address)

//   console.log(
//     "================= Deploying Mock Oracles, Tokens, Jedi & Faucet ================="
//   )
//   const diamondDeployer = preloadedAccount1
//   const empiricProxyMockup: any = await hardhat.starknet.getContractFactory(
//     "empiric_proxy"
//   )
//   let deployEmpiricAddress = await diamondDeployer.declare(empiricProxyMockup, {
//     maxFee: 1e17,
//   })
//   let empiricContract: any = await diamondDeployer.deploy(
//     empiricProxyMockup,
//     {}
//   )
//   console.log("Empiric address", empiricContract.address)
//   return empiricContract.address
// }

run().catch(() => {
  console.log("Error")
})
