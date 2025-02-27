import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {$$} from "../../tools";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-cropper',
  imports: [
    MatButton,
    NgIf
  ],
  templateUrl: './cropper.component.html',
  standalone: true,
  styleUrl: './cropper.component.css'
})
export class CropperComponent {

  @Input() visual=""
  x=0
  y=0
  w=0
  h=0
  @Output() update_visual=new EventEmitter();
  define_zone: boolean=false
  w_zoom: number=0
  h_zoom: number=0

  cropImage(data:string,w_zone:number,h_zone:number) {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src=data

    let zoom_w=img.naturalWidth/w_zone
    let zoom_h=img.naturalHeight/h_zone
    let zoom=zoom_w>zoom_h ? zoom_h : zoom_w

    canvas.width =  Math.round(this.w*zoom)
    canvas.height =  Math.round(this.h*zoom)
    const ctx = canvas.getContext("2d");

    ctx!.drawImage(
      img,
      Math.round(this.x*zoom), Math.round(this.y*zoom), canvas.width, canvas.height, // Source rectangle
      0, 0, canvas.width,canvas.height
    );

    return canvas.toDataURL();

  }

  start_crop($event: any) {
    this.define_zone=!this.define_zone
    if(this.define_zone){
      const rect = ($event.target as HTMLDivElement).getBoundingClientRect();
      let x=$event.type=="mousedown" ?  $event.clientX : $event.touches[0].clientX
      let y=$event.type=="mousedown" ?  $event.clientY : $event.touches[0].clientY
      this.x = x- rect.left;
      this.y = y- rect.top;
    }
  }

  update_crop_zone($event: any) {
    if(this.define_zone){
      const rect = ($event.target as HTMLDivElement).getBoundingClientRect();
      this.w_zoom=rect.width
      this.h_zoom=rect.height
      let x=$event.type=="mousemove" ?  $event.clientX : $event.touches[0].clientX
      let y=$event.type=="mousemove" ?  $event.clientY : $event.touches[0].clientY
      this.w=x-rect.left-this.x
      this.h=y-rect.top-this.y
    }
  }

  crop() {
    this.update_visual.emit(this.cropImage(this.visual,this.w_zoom,this.h_zoom))
  }

  cancel() {
    this.update_visual.emit(null)
  }
}
