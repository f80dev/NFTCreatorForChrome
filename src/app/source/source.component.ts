import {Component, EventEmitter, inject, Input, OnDestroy, Output} from '@angular/core';
import {level, share_token, share_token_wallet} from "../mvx";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {MatButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {WebcamImage, WebcamModule} from "ngx-webcam";
import {ClipboardService} from "../clipboard.service";
import {Subject} from "rxjs";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {$$, setParams, showMessage} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ImageProcessorService} from "../image-processor.service";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {WalletComponent} from "../wallet/wallet.component";
import {UserService} from "../user.service";
import {MatDialog} from "@angular/material/dialog";
import {settings} from "../../environments/settings";
import {ShareService} from "../share.service";
import {ShareformComponent} from "../shareform/shareform.component";
import {analyse_clipboard, url_shorter} from "../../main";
import {_prompt} from "../prompt/prompt.component";

@Component({
  selector: 'app-source',
  imports: [
    UploadFileComponent,
    MatButton,
    NgForOf,
    NgIf,
    WebcamModule,
    HourglassComponent,
    MatExpansionPanel, MatExpansionPanelHeader,
    WalletComponent, MatAccordion, ShareformComponent
  ],
  templateUrl: './source.component.html',
  standalone: true,
  styleUrl: './source.component.scss'
})
export class SourceComponent implements OnDestroy {

  toast=inject(MatSnackBar)

  @Input() visual=""
  @Output() update_visual=new EventEmitter();
  clipboard=inject(ClipboardService)
  imageProc=inject(ImageProcessorService)
  show_scanner: boolean = false;
  handle:any
  generators=environment.generators
  shareService=inject(ShareService)

  trigger = new Subject<void>();
  private image: WebcamImage | undefined;
  router=inject(Router)
  message: string=""
  user=inject(UserService)
  dialog=inject(MatDialog)
  show_source=true
  url: string=""
  nft: any;


  capture_image(img: WebcamImage) {
    this.image=img
  }




  async paste(message="Nothing in the clipboard") {
    try{
      let content=await analyse_clipboard(this,environment.share_appli,true,message)
      if(content)this.update_visual.emit(content)
    }catch (e:any){
      $$("Impossible de récupérer le clipboard",e)
    }
  }


  clipboard_handle:any
  ngOnDestroy(): void {
    $$("Netoyage du timer pour le presse papier")
    clearInterval(this.clipboard_handle)
  }

  async open_generator(generator:any) {
    this.show_source=true
    let obj:any={name:'clipboard-read'}
    if ((await navigator.permissions.query(obj)).state === 'granted') {
      clearInterval(this.clipboard_handle)
      this.clipboard_handle=setInterval(()=>{
        $$("analyse du clipboard")
        this.paste()
      },1000)
    }
    let occ=Number(localStorage.getItem(settings.appname) || "0")
    if(occ<3){
      showMessage(this,"Right-click on the image you want to use, copy it and return to NFT Now",2600)
      setTimeout(()=>{
        localStorage.setItem(settings.appname,(occ+1).toString())
        open(generator.value,"Images")
      },3000)
    }else{
      open(generator.value,"Images")
    }
  }


  async take_photo() {
    clearInterval(this.handle)
    this.show_scanner=false
    if(this.image){
      let image=await this.imageProc.createImageFromBase64(this.image.imageAsDataUrl)
      this.visual=image.toDataURL("image/webp")
      this.update_visual.emit(this.visual)
    }
  }


  async from_device($event: any) {
    wait_message(this,"File treatment ...")
    this.visual=$event.file
    this.visual=(await this.imageProc.createImageFromBase64(this.visual)).toDataURL("image/webp")
    wait_message(this)
    this.update_visual.emit(this.visual)
  }

  open_photo() {
    this.show_scanner=true
    this.handle=setInterval(()=>{this.trigger.next()},200)
  }

  go_editor() {
    this.router.navigate(['editor'])
  }


  async login() {
    await this.user.login(this,"","",true,0.01)
  }

  open_about() {
    this.router.navigate(["about"])
  }

  on_start_upload() {
    wait_message(this,"Start uploading ...",false,5000)
  }

  protected readonly level = level
  protected readonly share_token = share_token

  async on_share($event: any) {
    this.router.navigate(["share"],{queryParams:{p:setParams({visual:$event.visual,content:$event},"","")}})
  }

  async share_coin(content:any) {
    let token=content.token
    wait_message(this,"Making link to share")
    try{
      let nb_user=await _prompt(this,"How many users can receive this coin","1","","number","Ok","Cancel",false)
      if(nb_user && Number(nb_user)>0){
        let result=await share_token_wallet(this,token, environment.share_cost,"",Number(nb_user))
        if(result) {
          this.router.navigate(["share"], {
            queryParams: {
              url: await url_shorter(result.url),
              content: JSON.stringify(token)
            }
          })
        }
      }
    }catch (e:any){
      showMessage(this,"Retry")
    }
    wait_message(this)
  }
}
