import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {ApiService} from '../api.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {UserService} from '../user.service';
import {environment} from '../../environments/environment';
import {MatIcon} from '@angular/material/icon';
import {settings} from '../../environments/settings';
import {decode_metadata, get_nfts, getExplorer,  view_account_on_gallery} from "../mvx";
import {MatDialog} from "@angular/material/dialog";
import {HourglassComponent} from "../hourglass/hourglass.component";
import {XportalSwitchComponent} from "../xportal-switch/xportal-switch.component";

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    DecimalPipe,
    MatButton,
    MatIconButton,
    MatIcon,
    XportalSwitchComponent,
    HourglassComponent
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css'
})
export class WalletComponent implements OnChanges {
  api=inject(ApiService)
  user=inject(UserService)
  dialog=inject(MatDialog)

  @Input() nft_market=environment.nft_market
  nfts: any[] = []

  @Input() address=""
  @Input() coin_font="normal"
  @Input() icon_action: string="send"
  @Input() title_action: string="Show your coin"
  @Input() help=""
  @Input() show : "coin" | "nft" | "coin,nft" ="coin,nft"
  @Input() strong_token=""
  @Input() network=settings.network || "elrond-devnet"
  @Output() selectChanged = new EventEmitter()
  @Output() selectCoin = new EventEmitter()
  @Output() onCancel = new EventEmitter()
  @Output() listChanged = new EventEmitter()

  @Input() width="150px"
  @Input() height="200px"

  @Input() intro_message: string=""

  message=""
  account: any;
  @Input() selected=false;
  tokens: string[] = [];



  async refresh(){
    this.nfts=[]
    if(this.show.indexOf("nft")>-1){
      this.nfts=await decode_metadata(
        await get_nfts(this.user,this.api),
        this.api
      )

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
    if(this.user.isTestnet())url=url.replace("devnet","testnet")
    if(!this.user.isTestnet() && !this.user.isDevnet())url=url.replace("devnet.","")
    open(url,"ESDT Creator")
  }



  protected readonly view_account_on_gallery = view_account_on_gallery;



  show_account() {
    open(getExplorer(this.user.address,this.user.network,"accounts","explorer"),"Account")
  }


  select_coin(k: string) {
    let token=this.user.tokens[k]
    this.selectCoin.emit({token:token})
  }
}
