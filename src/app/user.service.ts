import {inject, Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {_ask_for_authent} from "./authent-dialog/authent-dialog.component";
import {query, toAccount, usersigner_from_pem} from "./mvx";
import {$$, showMessage} from "../tools";
import {ApiService} from './api.service';
import {Location} from '@angular/common';
import {DeviceService} from './device.service';
import {Connexion} from '../operation';
import {settings} from "../environments/settings";
import {environment} from "../environments/environment";
import {Account, UserSigner} from "@multiversx/sdk-core/out";
import {AccountOnNetwork} from "@multiversx/sdk-network-providers/out";

(window as any).global = window;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  address: string=""
  signature:string=""
  provider: any
  strong: boolean=false
  tokens:any={}
  location=inject(Location)
  device=inject(DeviceService)
  addr_change = new Subject<string>();

  network:string=settings.network || "elrond-devnet"
  params:any
  nonce:number=0

  tokemons: any[] = []
  visibility: number = 0
  account: AccountOnNetwork | undefined;
  idx:number=0
  fee=0;
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
  action_after_mint: string = "";

  constructor() { }

  async authent($event: {
    strong: boolean;
    address: string;
    provider: any;
    encrypted: string;
    url_direct_xportal_connect: string
  }) {
    this.address = $event.address
    localStorage.setItem("address",this.address)
    this.account=await toAccount(this.address)
    this.provider = $event.provider
    this.strong=$event.strong
    this.addr_change.next(this.address)
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
    this.provider=null;

  }


  query(func:string,args:any[]=[]){
    $$("Appel de la fonction "+func+" du smart contract "+this.get_sc_address()+" avec les arguments ",args)
    let rc=query(func, args, this.get_domain(), this.get_sc_address())
    //$$("Réponse ",rc)
    return rc
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
        resolve(true)
      }else{
        if(pem_file.length>0){
          let r={
            address:usersigner_from_pem(pem_file).getAddress().bech32(),
            provider:UserSigner.fromPem(pem_file),
            strong: true,
            encrypted:"",
            url_direct_xportal_connect:""
          }
          await this.authent(r)
          await this.init_balance(vm.api)

          if(required_balance>0 && this.balance<required_balance)vm.router.navigate(["faucet"],{queryParams:{message:message_balance}})

          resolve(r)
          showMessage(vm,"Identification ok")
        } else {
          try{
            if(this.device.isMobile())this.connexion.extension_wallet=false
            let r:any=await _ask_for_authent(vm,"Authentification",subtitle,this.network,this.connexion)
            await this.authent(r)
            await this.init_balance(vm.api)

            if(required_balance>0 && this.balance<required_balance)vm.router.navigate(["faucet"],{queryParams:{message:message_balance}})

            resolve(r)
          }catch (e){
            $$("Error ",e)
            reject(e)
          }
        }
      }
    })
  }


  get_domain(){
    return this.network.indexOf("devnet")>-1 ? "https://devnet-api.multiversx.com/" : "https://api.multiversx.com/"
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
        let egld_prefix=this.network.indexOf("devnet")>-1 ? "x" : ""
        tokens.push({identifier:egld_prefix+"EGLD",name:egld_prefix+"EGLD",balance:Number(this.account!.balance)})
        this.balance=Number(this.account!.balance)/1e18

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
}
