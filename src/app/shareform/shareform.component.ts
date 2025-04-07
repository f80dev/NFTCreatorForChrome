import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {ShareService} from "../share.service";
import {getParams, showMessage} from "../../tools";
import {ActivatedRoute} from "@angular/router";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {Location, NgIf} from "@angular/common";
import {QRCodeComponent} from "angularx-qrcode";
import {InputComponent} from "../input/input.component";
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {Clipboard, ClipboardModule} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {get_nft, share_token_wallet, view_nft} from "../mvx";
import {UserService} from "../user.service";
import {environment} from "../../environments/environment";
import {url_shorter} from "../../main";
import {_prompt} from "../prompt/prompt.component";
import {ApiService} from "../api.service";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {MatDialog} from "@angular/material/dialog";
import {XportalSwitchComponent} from "../xportal-switch/xportal-switch.component";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-shareform',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    NgIf,
    QRCodeComponent,
    InputComponent,
    MatExpansionPanel, MatExpansionPanelHeader, HourglassComponent, XportalSwitchComponent, MatSlideToggle, FormsModule
  ],
  templateUrl: './shareform.component.html',
  standalone: true,
  styleUrl: './shareform.component.css'
})
export class ShareformComponent implements OnInit {


  url=""
  content:any
  @Output() onshare=new EventEmitter()

  api=inject(ApiService)
  routes=inject(ActivatedRoute)
  shareService=inject(ShareService)
  clipboard=inject(Clipboard)
  _location=inject(Location)
  toast=inject(MatSnackBar)
  dialog=inject(MatDialog)
  qrcode=""
  visual=""
  user=inject(UserService)
  title="Get this NFT"
  description="Open this link to catch an NFT in your wallet"
  identifier=""
  message: string=""
  amount: number=1
  nb_users=1
  keep_parameters=false


  async ngOnInit() {
    let params:any=await getParams(this.routes)
    await this.user.login(this,"","",false)
    this.url=params.url || ""
    this.content=params.content
    this.visual=params.visual || this.content.media[0].originalUrl
  }


  async transfer() {
    if(this.content && this.content.balance<this.nb_users*this.amount){
      showMessage(this,"You don't have enought token")
      return
    }
    let r=await _prompt(this,"Send the contents to a vault and give access via a shared link ?","",
      "0.004 eGld per recipient are required to pay network fees","yesno","Ok","Cancel",true)
    if(r==="yes"){
      let obj=await share_token_wallet(this,this.content,environment.share_cost*this.nb_users,this.amount.toString(),this.nb_users)
      if(obj){
        this.url=await url_shorter(obj!.url)
      }
      wait_message(this)
    }

  }


  async on_share(){
    await this.shareService.share(
      this.title,
      this.description,
      this.url,
      this.visual
    )
    this.onshare.emit(true)
  }


  quit() {
    this._location.back()
  }

  copy_url() {
    this.clipboard.copy(this.url)
    showMessage(this,"Link in your clipboard")
  }

  sell() {
    view_nft(this.user,this.content.identifier)
  }

  see_url() {
    open(this.url,"preview")
  }

  update_keeping() {
    if(this.keep_parameters){
      let obj=JSON.parse(JSON.stringify(this.content))
      obj.urls=this.user.data.urls
      obj.metadata=this.user.data.metadata

      localStorage.setItem("save_parameters",JSON.stringify(obj))
    }else{
      localStorage.removeItem("save_parameters")
    }
  }
}
