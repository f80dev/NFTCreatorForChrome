import {Component, EventEmitter, inject, Input, OnDestroy, Output} from '@angular/core';
import {level, view_nft} from "../mvx";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {MatButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {WebcamImage, WebcamModule} from "ngx-webcam";
import {ClipboardService} from "../clipboard.service";
import {Subject} from "rxjs";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {showMessage} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ImageProcessorService} from "../image-processor.service";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {WalletComponent} from "../wallet/wallet.component";
import {UserService} from "../user.service";
import {MatDialog} from "@angular/material/dialog";

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
    WalletComponent, MatAccordion
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




  trigger = new Subject<void>();
  private image: WebcamImage | undefined;
  router=inject(Router)
  message: string=""
  user=inject(UserService)
  dialog=inject(MatDialog)
  show_source=true



  capture_image(img: WebcamImage) {
    this.image=img
  }



  async paste() {
    let content=await this.clipboard.paste()
    if(content.length>0){
      this.update_visual.emit(content)
    }else{
      showMessage(this,"Nothing in the clipboard")
    }
  }

  clipboard_handle:any
  ngOnDestroy(): void {
    clearInterval(this.clipboard_handle)
  }

  async open_generator(generator:any) {
    this.show_source=true
    let obj:any={name:'clipboard-read'}
    if ((await navigator.permissions.query(obj)).state === 'granted') {
      this.clipboard_handle=setInterval(()=>{
        this.paste()
      },1000)
    }
    open(generator.value,"Images")
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

  protected readonly view_nft = view_nft;

  on_view_nft($event: any) {
    view_nft(this.user,$event.identifier)
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

  protected readonly level = level;
}
