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
import {view_nft} from "../mvx";
import {UserService} from "../user.service";

@Component({
  selector: 'app-shareform',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    NgIf,
    QRCodeComponent,
    InputComponent,
    MatExpansionPanel,MatExpansionPanelHeader
  ],
  templateUrl: './shareform.component.html',
  standalone: true,
  styleUrl: './shareform.component.css'
})
export class ShareformComponent implements OnInit {

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    this.url=params.url || ""
    this.name=params.name || ""
    this.amount=Number(params.amount || "0")
    this.visual=params.visual || ""
    this.identifier=params.identifier
  }

  @Input() url: string=""
  @Input() name: string=""
  @Input() amount=0
  @Output() onshare=new EventEmitter()

  routes=inject(ActivatedRoute)
  shareService=inject(ShareService)
  clipboard=inject(Clipboard)
  _location=inject(Location)
  toast=inject(MatSnackBar)
  qrcode=""
  visual=""
  user=inject(UserService)
  title="Get this NFT"
  description="Open this link to catch an NFT in your wallet"
  identifier=""

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
