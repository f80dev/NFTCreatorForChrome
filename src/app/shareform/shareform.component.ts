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

@Component({
  selector: 'app-shareform',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    NgIf,
    QRCodeComponent,
    InputComponent,
    MatExpansionPanel, MatExpansionPanelHeader, HourglassComponent, XportalSwitchComponent
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


  async ngOnInit() {
    let params:any=await getParams(this.routes)
    await this.user.login(this,"","",false)
    this.url=params.url || ""
    this.content=params.content
    this.visual=params.visual || this.content.media[0].originalUrl
  }


  async transfer() {
    let obj=await share_token_wallet(this,this.content,environment.share_cost)
    this.url=await url_shorter(obj!.url)
    wait_message(this)
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
    view_nft(this.user,this.identifier)
  }
}
