import {inject, Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {_ask_for_authent} from "./authent-dialog/authent-dialog.component";
import {toAccount} from "./mvx";
import {$$, showMessage} from "../tools";
import {ApiService} from './api.service';
import {DeviceService} from './device.service';
import {Connexion} from '../operation';
import {settings} from "../environments/settings";
import {environment} from "../environments/environment";
import {Account, ApiNetworkProvider, KeyPair, UserSigner} from "@multiversx/sdk-core/out";
import {AccountOnNetwork} from "@multiversx/sdk-network-providers/out";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  address: string=""
  native_token:string=""
  signature:string=""
  provider: any
  strong: boolean=false
  tokens:any={}
  api=inject(ApiService)
  router=inject(Router)

  device=inject(DeviceService)
  addr_change = new Subject<string>();

  network:string=settings.network || "elrond-devnet"
  account: AccountOnNetwork | undefined
  idx:number=0

  zone: any;
  connexion:Connexion={
    address: false,
    direct_connect: false,
    email: false,
    extension_wallet: true,
    google: false,
    keystore: false,
    nfluent_wallet_connect: false,
    on_device: false,
    private_key: false,
    wallet_connect: true,
    web_wallet: false,
    webcam: false,
    xAlias: false
  }
  preview: boolean = false;
  balance: number=0
  action_after_mint: string=""
  params: any={}
  uri_to_xportal=""
  data: any={}

  constructor() { }

  async authent($event: {
    strong: boolean;
    address: string;
    provider: any;
    encrypted: string;
    url_direct_xportal_connect: string
  },required_balance=0,message_balance="") {
    let rc=(this.address.length>0 && this.address!=$event.address)   //True s'il y a changement d'adresse
    this.address = $event.address
    localStorage.setItem("address",this.address)
    this.account=await toAccount(this.address,this.network)
    this.provider = $event.provider
    this.strong=$event.strong
    this.addr_change.next(this.address)

    await this.init_balance(this.api)
    if(required_balance>0 && this.balance<required_balance)this.router.navigate(["faucet"],{queryParams:{message:message_balance}})

    return rc
  }


  isConnected(strong=false) : boolean {
    return this.address!="" && (this.provider || !strong)
  }




  logout(strong=false) {
    if(strong){
      localStorage.removeItem("address")
      localStorage.removeItem("pem")
    }
    this.address=""
    this.idx=0
    if(this.provider)this.provider.logout()
    this.provider=null

  }




  login(vm: any,subtitle="",pem_file="",strong=false,
        required_balance=0,message_balance="",
        silence_mode=false) {
    return new Promise(async (resolve, reject) => {
      if(!this.address)this.address=localStorage.getItem("address") || ""

      if(this.isConnected(strong) || silence_mode){
        if(this.address){
          await this.init_balance(vm.api)
          if(required_balance>0 && this.balance<required_balance)vm.router.navigate(["faucet"],{queryParams:{message:message_balance}})
        }
        if(this.device.isMobile())this.connexion.extension_wallet=false
        resolve(false)
      }else{
        if(pem_file.length>0){
          $$("On utilise un fichier PEM")
          let k=new KeyPair(UserSigner.fromPem(pem_file).secretKey)

          let r={
            address:k.publicKey.toAddress().toBech32(),
            provider:Account.newFromKeypair(k),
            strong: true,
            encrypted:"",
            url_direct_xportal_connect:""
          }
          let address_change=await this.authent(r,required_balance,message_balance)
          resolve(address_change)

          showMessage(vm,"Identification ok")
        } else {

          try{
            if(this.device.isMobile()){
              $$("Impossible de trouver l'extended wallet en version mobile")
              this.connexion.extension_wallet=false
            }
            let r:any=await _ask_for_authent(vm,"Authentification",subtitle,this.network,this.connexion)

            this.uri_to_xportal=r.qrcode
            let address_change=await this.authent(r,required_balance,message_balance)

            resolve(address_change)
          }catch (e){
            $$("Error ",e)
            reject(e)
          }
        }
      }
    })
  }



  get_domain(){
    if(this.network.indexOf("devnet")>-1)return "https://devnet-api.multiversx.com/"
    if(this.network.indexOf("testnet")>-1)return "https://testnet-api.multiversx.com/"
    return "https://api.multiversx.com/"
  }



  refresh(){
    return new Promise(async (resolve)=>{
      this.account=await toAccount(this.address,this.get_domain())
      resolve(this.account)
    })
  }

  show_contract() {
    let prefix=this.network.indexOf("devnet")>-1 ? "devnet-" : ""
    open("https://"+prefix+"explorer.multiversx.com/accounts/"+this.get_sc_address(),"smartcontract")
  }


  init_balance(api: ApiService) {
    return new Promise(async (resolve,reject)=>{
      if(!this.address){
        reject("Address not initialize")
      }else{
        await this.refresh()
        let tokens=await api._service("accounts/"+this.address+"/tokens","",this.get_domain())
        let egld_prefix=this.isTestnet() || this.isDevnet() ? "x" : ""
        if(this.account){
          tokens.push({
            identifier:egld_prefix+"EGLD",
            name:egld_prefix+"EGLD",
            type:"FungibleESDT",
            balance:Number(this.account!.balance)
          })
          this.balance=Number(this.account!.balance)/1e18
        }

        for(let t of tokens){
          this.tokens[t.identifier]=t
        }

        resolve(true)
      }
    })
  }


  get_balance(s: string) : number {
    if(this.tokens && this.tokens[s]){
      return this.tokens[s].balance/1e18
    }else{
      return 0
    }
  }

  get_sc_address() {
    return settings.contract_addr
  }

  get_default_token(): string {
    return this.network.indexOf("devnet")>-1 ? environment.token["elrond-devnet"] : environment.token["elrond-mainnet"]
  }


  isDevnet() {
    return this.network.indexOf("devnet")>-1
  }

  isMainnet() {
    return !this.isTestnet() && !this.isDevnet()
  }

  isTestnet() {
    return this.network.indexOf("testnet")>-1
  }

  getAccount() {
    try{
      return this.provider.account
    }catch (e:any){
      return this.provider
    }
  }
}
