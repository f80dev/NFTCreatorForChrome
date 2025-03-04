import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {ApiService} from '../api.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {UserService} from '../user.service';
import {environment} from '../../environments/environment';
import {MatIcon} from '@angular/material/icon';
import {settings} from '../../environments/settings';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    DecimalPipe,
    MatButton,
    MatIconButton,
    MatIcon
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css'
})
export class WalletComponent implements OnChanges {
  api=inject(ApiService)
  user=inject(UserService)

  @Input() nft_market=environment.nft_market
  nfts: any[] = []
  @Input() address=""
  @Input() show : "coin" | "nft" | "coin,nft" ="coin,nft"
  @Input() strong_token=""
  @Input() network=settings.network || "elrond-devnet"
  @Output() selectChanged = new EventEmitter()
  @Output() onCancel = new EventEmitter()
  @Output() listChanged = new EventEmitter()

  @Input() width="150px"
  @Input() height="200px"

  @Input() message: string=""
  account: any;
  @Input() selected=false;
  tokens: string[] = [];



  async refresh(){
    this.nfts=[]
    if(this.show.indexOf("nft")>-1){
      let nfts=await this.api._service(
        "accounts/"+this.address+"/nfts","",
        "https://"+(this.user.isDevnet() ? "devnet-" : "")+"api.multiversx.com/")

      for (let nft of nfts) {
        if(!nft.metadata){
          let prop = atob(nft.attributes)
          let tags=prop.split(";metadata:")[0].replace("tags:" ,"")
          let cid=prop.split("metadata:")[1]
          if(!nft.hasOwnProperty("metadata")){nft.metadata=await this.api._service("ipfs/"+cid,"","https://ipfs.io/",false)}
          nft.tags=tags
        }
        nft.visual=nft.hasOwnProperty("media") ? nft.media[0].hasOwnProperty("thumbnailUrl") ? nft.media[0].thumbnailUrl : nft.media[0].originalUrl : ""
        this.nfts.push(nft)
      }
      this.listChanged.emit(this.nfts)
    }

    if(this.show.indexOf("coin")>-1){
      await this.user.init_balance(this.api)
      this.tokens=Object.keys(this.user.tokens)
    }
  }




  select(nft: any) {
    this.selectChanged.emit(nft)
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes.hasOwnProperty("address")){
      this.nft_market=this.nft_market+changes["address"].currentValue
      this.refresh()
    }
  }



  select_esdt($event:any) {
    $event.balance=Number($event.balance)
    this.selectChanged.emit($event)
  }


  cancel() {
    this.onCancel.emit()
  }

  create_coin() {
    let url="https://devnet.usewarp.to/create-token"
    if(this.user.network.indexOf("devnet")==-1)url=url.replace("devnet.","")
    open(url,"ESDT Creator")
  }
}
