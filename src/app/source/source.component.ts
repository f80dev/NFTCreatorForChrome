import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {level} from "../mvx";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {MatButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {WebcamImage, WebcamModule} from "ngx-webcam";
import {ClipboardService} from "../clipboard.service";
import {Subject} from "rxjs";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";

@Component({
  selector: 'app-source',
  imports: [
    UploadFileComponent,
    MatButton,
    NgForOf,
    NgIf,
    WebcamModule
  ],
  templateUrl: './source.component.html',
  standalone: true,
  styleUrl: './source.component.css'
})
export class SourceComponent {

  protected readonly level = level;
  @Input() visual=""
  @Output() update_visual=new EventEmitter();
  clipboard=inject(ClipboardService)
  show_scanner: boolean = false;
  handle:any
  generators=environment.generators


  trigger = new Subject<void>();
  private image: WebcamImage | undefined;
  router=inject(Router)


  capture_image(img: WebcamImage) {
    this.image=img
  }



  async paste() {
    let content=await this.clipboard.paste()
    if(content && content.toString().startsWith("http"))this.update_visual.emit(content)
  }


  open_generator(generator:any) {
    open(generator.value,"Images")
  }




  take_photo() {
    clearInterval(this.handle)
    if(this.image){
      this.update_visual.emit(this.image?.imageAsDataUrl)
    }
    this.show_scanner=false
  }


  from_device($event: any) {
    this.visual=$event.file
    this.update_visual.emit(this.visual)
  }

  open_photo() {
    this.show_scanner=true
    this.handle=setInterval(()=>{this.trigger.next()},200)
  }

  go_editor() {
    this.router.navigate(['editor'])
  }
}
