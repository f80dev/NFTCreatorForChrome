import {
  Account,
  Address, BytesValue, SmartContractController,
  SmartContractTransactionsFactory, TokenManagementController, TokenManagementTransactionsFactory,
  TokenTransfer, Transaction, TransactionComputer, TransactionOnNetwork,
  TransactionsFactoryConfig
} from "@multiversx/sdk-core/out";
import { UserSigner } from "@multiversx/sdk-wallet";
import { AbiRegistry,SmartContractQuery,SmartContractTransactionsOutcomeParser,DevnetEntrypoint,MainnetEntrypoint,SmartContractQueryResponse} from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import {AccountOnNetwork} from "@multiversx/sdk-network-providers/out";
import {ApiService} from "./api.service";
import {UserService} from "./user.service";
import {Octokit} from "@octokit/rest";
import {$$, now} from "../tools";
import {abi, settings} from '../environments/settings';
import {environment} from "../environments/environment";

export const DEVNET="https://devnet-api.multiversx.com"
export const MAINNET="https://api.multiversx.com"

export async function mvx_api(url:string,params:string,api:any,network="devnet"): Promise<any[]> {
  //voir
  return new Promise((resolve, reject) => {
    network=network.replace("elrond-","")
    if(!network.endsWith("-"))network=network+"-"
    if(url.startsWith("/"))url=url.substring(1)
    api._get("https://"+network+"api.multiversx.com/"+url,params).subscribe({
      next :(transactions:any)=>{
        resolve(transactions)
      },
      error:(err:any)=>{
        reject(err)
      }
    })
  })
}

export function network_config(network="") : Promise<any> {
  let prefix=network.indexOf("devnet")>-1 ? "devnet-" : ""
  const apiNetworkProvider = new ApiNetworkProvider("https://"+prefix+"api.multiversx.com", { clientName: "multiversx-your-client-name" });
  let rc=apiNetworkProvider.getNetworkConfig();
  return rc
}




export function get_nft(identifier: string, api:any,network: string) {
  //voir https://api.multiversx.com/#/nfts/NftController_getNft
  return mvx_api("/nfts/" + identifier,"",api,network)
}


export function is_image(url:string) {
  if(!url)return false
  for(let ext of ["jpeg","png","webp",'"gif',"jpg"]){
    if(url.indexOf("."+ext)>-1)return true
  }
  return false
}



export function upload_content(content:any,filename="") : Promise<{url:string,filename:string}>{
  return new Promise(async (resolve, reject) => {
    // this.api._post(this.server.domain+"/upload_file","",content,200000000).subscribe({
    //   error:(err:any)=>{
    //     showError(this,err)
    //     reject(err)
    //   },
    //   next:async (ipfs:any)=>{
    //     resolve(ipfs)
    //   },
    // })

    let octokit:Octokit = new Octokit({auth: "hh4271anuxAlA5Z7PHcCQt2ttTpd".replace("hh4271","ghp_8hac4LGPaRuCCA")});
    if(filename=="")filename="prompt_"+now()+".json"
    let obj:any={}
    obj[filename]={content:JSON.stringify(content)}
    try{
      let gist:any=await octokit.gists.create({
        files:obj,
        description:"my gist",
        public: true
      })
      resolve({url:gist.data.files[filename].raw_url,filename:filename})
    }catch (e){
      reject(e)
    }

    //const reponse=await this.octokit.createGi({owner:"f80dev",repo:"promptmarket",branch:"storage"})
  })
}



export async function create_abi(abi_content:any,api:any=null): Promise<AbiRegistry> {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13/#load-the-abi-from-an-url
  return new Promise(async (resolve, reject) => {
    try{
      if(!api)
      {resolve(AbiRegistry.create(abi_content))}
      else{
        api._get(abi_content, { encoding: "utf8" }).subscribe({
          next:(r:string)=>{resolve(AbiRegistry.create(JSON.parse(r)))}
        })
      }
    }catch (e){
      reject(e)
    }
  })
}


export function address_from_pem(pemText:string) : string {
  return UserSigner.fromPem(pemText).getAddress().bech32()
}


export function toAddress(addr:string) : Address {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13/
  return Address.fromBech32(addr)
}



export function toAccount(addr:string,network:string="elrond-devnet") : Promise<AccountOnNetwork> {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13/#synchronizing-an-account-object
  return new Promise(async (resolve, reject) => {
    try{
      network=network.indexOf("devnet")>-1 ? DEVNET : MAINNET
      if(network.endsWith("/"))network=network.substring(0,network.length-1)
      resolve(await new ApiNetworkProvider(network).getAccount(toAddress(addr)))
    }catch (e) {
      reject(e)
    }
  })
}




export function usersigner_from_pem(pemText:string) : UserSigner {
  return UserSigner.fromPem(pemText)
}





export function get_transactions(api:ApiService,smartcontract_addr:string,abi=null,network="devnet") : Promise<any[]> {
  //voir la documentation https://api.multiversx.com/
  return new Promise(async (resolve, reject) => {
    try{
      const entrypoint = network.indexOf("devnet")>-1 ? new DevnetEntrypoint() : new MainnetEntrypoint()
      let transactions=await mvx_api("/accounts/"+smartcontract_addr+"/transactions","size=200",api,network)
      let rc=[]
      if(abi){
        const converter=new TransactionComputer()
        const parser=new SmartContractTransactionsOutcomeParser({abi: abi});

        for(let t of transactions){
          const transactionOnNetwork:any = await entrypoint.getTransaction(t.hash);
          rc.push(parser.parseExecute(transactionOnNetwork))
        }
      }else{
        for(let t of transactions){
          t.data=atob(t.data).split("@")
          rc.push(t)
        }
      }
      resolve(rc)
    }catch (e){
      reject(e)
    }
  })
}

export function getExplorer(addr = "", network = "elrond-devnet",service="accounts", tools = "xspotlight"): string {
  let url = ""
  let isMain: boolean = (network.indexOf("devnet") == -1)
  if (network.indexOf("elrond") > -1) {
    if (tools == "xspotlight") url = "https://" + (isMain ? "" : "devnet.") + "xspotlight.com/" + addr;
    if (tools == "explorer") url = "https://" + (isMain ? "" : "devnet-") + "explorer.multiversx.com/"+service+"/" + addr;
  }

  if (network.indexOf("polygon") > -1) {
    if (isMain) {
      url = "https://polygonscan.com/accounts/" + addr;
    } else {
      url = "https://polygon.testnets-nftically.com/marketplace?search=" + addr + "&chain[]=80001"
    }
  }
  return url
}


//voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v14#creating-transactions
export function create_transaction(function_name:string,args:any[],
                                   user:UserService,tokens_to_transfer: TokenTransfer[],
                                   gasLimit=50000000n, contract_addr="") : Promise<Transaction>  {

  return new Promise(async (resolve) => {
    const entrypoint = user.network.indexOf("devnet")>-1 ? new DevnetEntrypoint() : new MainnetEntrypoint()
    let controller = entrypoint.createSmartContractController(await create_abi(abi));

    if(contract_addr=="")contract_addr=user.get_sc_address()
    let nonce=await entrypoint.recallAccountNonce(Address.newFromBech32(user.address))

    let option:any={
      contract: Address.newFromBech32(contract_addr),
      function: function_name,
      gasLimit: gasLimit,
      arguments: args,
    }
    if(tokens_to_transfer.length>0)option.tokenTransfers=tokens_to_transfer

    let transaction=await controller.createTransactionForExecute(user.getAccount(),nonce,option);

    transaction.nonce=BigInt(user.account!.nonce)

    if(user.provider){
      transaction.signature=await user.provider.signTransaction(transaction)
    }

    if(user.pem_account){
      await entrypoint.signTransaction(transaction,user.getAccount())
    }

    resolve(transaction)
  })
}

export function level(lv=1) : boolean {
  return settings.ihm_level>=lv
}




function execute_transaction(transaction:Transaction,user:UserService) : Promise<{ values: any[]; returnCode: string; returnMessage: string}> {
  return new Promise(async (resolve, reject) => {
    try{
      const entrypoint = user.network.indexOf("devnet")>-1 ? new DevnetEntrypoint() : new MainnetEntrypoint()


      //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v14#parsing-transaction-outcome

      let txHash=await entrypoint.sendTransaction(transaction)
      const transactionOnNetwork = await entrypoint.awaitCompletedTransaction(txHash);
      const parsedOutcome = new SmartContractTransactionsOutcomeParser({abi:await create_abi(abi)}).parseExecute({transactionOnNetwork:transactionOnNetwork})

      if(parsedOutcome.returnCode!="ok"){
        reject({message:parsedOutcome.returnMessage,code:parsedOutcome.returnCode})
      }else{

        $$("Resultat transaction ",parsedOutcome)
        resolve(parsedOutcome)
      }
    } catch (e:any) {
      reject(e.message)
    }
  })
}



export function send_transaction_with_transfers(user:UserService,function_name:string,args:any[],
                                                tokens_to_transfer: TokenTransfer[]=[],
                                                gasLimit=50000000n, contract_addr="") {
  return new Promise(async (resolve, reject) => {
    if(!user || !user.network)reject(false);

    $$("Appel de "+function_name+" avec les arguments "+args.join(" , "))
    if(tokens_to_transfer.length>0)$$(" ... avec transfert de token")
    let transaction = await create_transaction(function_name,args,user,tokens_to_transfer,gasLimit,contract_addr)

    await user.refresh()

    try{
      resolve(await execute_transaction(transaction,user))
    }catch (e){
      reject(e)
    }

  })
}


export function toText(array:Uint8Array) : string {
  return new TextDecoder('utf-8').decode(array)
}


async function signTransaction(t:Transaction,user:UserService) : Promise<Transaction>  {
  try{
    return await user.provider.signTransaction(t)
  }catch(e){
    return await user.provider.sign(t.serializeForSigning())
  }
}

export async function set_roles_to_collection(collection_id:string, user:UserService,type_collection:string="SFT",burn=false,update=false) {
  let factory = new TokenManagementTransactionsFactory({config: new TransactionsFactoryConfig({ chainID: user.get_chain_id() })});
  $$("Affectation des roles sur la collection "+collection_id+" de type "+type_collection)
  let setRoleTransaction=factory.createTransactionForSettingSpecialRoleOnNonFungibleToken( Address.fromBech32(user.address),{
    addRoleNFTAddURI: update,
    addRoleNFTUpdateAttributes: update,
    user: Address.fromBech32(user.address),
    tokenIdentifier: collection_id,
    addRoleESDTTransferRole: false,
    addRoleNFTBurn: burn,
    addRoleNFTCreate: true,
    addRoleESDTModifyCreator:update
  })
  if(type_collection=="SFT"){
    setRoleTransaction=factory.createTransactionForSettingSpecialRoleOnSemiFungibleToken(Address.fromBech32(user.address),{
      user: Address.fromBech32(user.address),
      tokenIdentifier: collection_id,
      addRoleESDTTransferRole: update,
      addRoleNFTAddQuantity: update,
      addRoleNFTBurn: burn,
      addRoleNFTCreate: true,
    })
  }

  user.refresh()
  setRoleTransaction.nonce=BigInt(user.account!.nonce)
  let rc:any=await execute_transaction(setRoleTransaction,user)
  return rc
}


export async function create_collection(name:string,user:UserService,vm:any=null,collection_type="SFT") {
  //exemple : issueSemiFungible@546f6b656d6f6e@544f4b454d4f4e
  //puis appel de setSpecialRole@544f4b454d4f4e2d346561303466@15432c1a00ea0f72466e099db66e6059d4becc9bb9eed17f3db817f29a0fc26b@45534454526f6c654e4654437265617465@45534454526f6c654e46544164645175616e74697479

  if(vm)vm.message="Collection building phase"
  let factory = new TokenManagementTransactionsFactory({config: new TransactionsFactoryConfig({ chainID:user.get_chain_id() })});

  let option={
    name: name,
    tokenName:name,
    tokenTicker:name.replace(" ","").toUpperCase().substring(0,10),
    canAddSpecialRoles: true,
    canChangeOwner: true,
    canFreeze: false,
    canPause: false,
    canTransferNFTCreateRole: true,
    canUpgrade: false,
    canWipe: true,
  }

  let transaction=factory.createTransactionForIssuingNonFungible(Address.fromBech32(user.address),{...option})
  if(collection_type=="SFT"){
    transaction=factory.createTransactionForIssuingSemiFungible(Address.fromBech32(user.address),{...option})
  }

  await user.refresh()
  transaction.nonce=BigInt(user.account!.nonce)

  let result=await execute_transaction(transaction,user)

  let collection_id=new TextDecoder("utf-8").decode(result.values[0])

  return {result:result,collection_id:collection_id}
}


export function view_account_on_gallery(user:UserService,explorer=environment.account_viewer) {
  let url=explorer.replace("%address%",user.address)
  if(!user.isDevnet())url=url.replace("devnet.","").replace("devnet-","")
  open(url,"Gallery")
}



export async function get_collections(user:UserService,api:ApiService) {
  //voir https://devnet-api.multiversx.com/#/accounts/AccountController_getAccountCollectionsWithRoles
  let domain=user.get_domain()
  let rc: any=await api._service("accounts/"+user.address+"/roles/collections","",domain)
  return rc
}


export function view_nft(user:UserService,identifier:string,explorer=environment.nft_viewer) {
  let url=explorer.replace("%identifier%",identifier)
  if(!user.isDevnet())url=url.replace("devnet.","")
  open(url,"Gallery")
}

function getEntrypoint(user:UserService){
  return user.network.indexOf("devnet")>-1 ? new DevnetEntrypoint() : new MainnetEntrypoint()
}

//buildNFT
export async function makeNFT(identifier:string,name:string,visual:string,user:UserService,
                              quantity=1,royalties=0,uris:string[]=[],metadata="",metadata_url="",hash="")  {
  //Voir https://docs.multiversx.com/tokens/nft-tokens/#creation-of-an-nft

  //Creation depuis le wallet Mvx : ESDTNFTCreate@SFT-55f2b5@@Londres@2500@QmNq8Kb8J2Aq3fqWu8jRHEvUvyAEwrHt8DSrqAhAWStiDE@tags:;metadata:QmaoTy3G7Cpb72czvs384qFQUqWeWBdTs5grHk311AassH@https://ipfs.io/ipfs/QmNq8Kb8J2Aq3fqWu8jRHEvUvyAEwrHt8DSrqAhAWStiDE

  $$("Construction de "+name+" sur la collection "+identifier+" en quantite "+quantity)
  const entrypoint=getEntrypoint(user)
  //if(metadata_url.length>0)uris.unshift(metadata_url)
  if(uris.length==0 || uris[0]!=visual)uris.unshift(visual)

  let controller = entrypoint.createTokenManagementController()
  let transaction=await controller.createTransactionForCreatingNft(
    user.getAccount(),
    BigInt(user.account!.nonce),
    {
    attributes: new TextEncoder().encode(metadata),
    hash: hash,
    initialQuantity: BigInt(quantity),
    name: name,
    royalties: Math.round(royalties*100),

    tokenIdentifier: identifier,
    uris: uris,
  })
  transaction.gasLimit=environment.max_gaz
  user.refresh()

  return await execute_transaction(transaction,user)
}


//voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v14#querying-smart-contracts
export async function query(function_name:string,args:any[],domain:string,sc_address:string,network="devnet") : Promise<any> {
  return new Promise(async (resolve, reject) => {
    const entrypoint = network.indexOf("devnet")>-1 ? new DevnetEntrypoint() : new MainnetEntrypoint()

    const controller=entrypoint.createSmartContractController(await create_abi(abi))
    const query = new SmartContractQuery({
      contract: Address.fromBech32(sc_address),
      function: function_name,
      arguments: args,
    })

    try {
      const response=await controller.runQuery(query)
      let jsonResponse = controller.parseQueryResponse(response)
      resolve(jsonResponse[0])
    } catch (e) {
      reject(e)
    }

  })
}

export async  function deploy(user:UserService,code:BytesValue) {
  const factoryConfig = new TransactionsFactoryConfig({ chainID:user.get_chain_id() });
  let factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: await create_abi(abi)
  });
  let args = [10];

  const deployTransaction = factory.createTransactionForDeploy(Address.fromBech32(user.address),{
    bytecode: code.valueOf(),
    gasLimit: 6000000n,
    arguments: args
  });
  //deployTransaction.nonce = deployer.getNonceThenIncrement();

}


