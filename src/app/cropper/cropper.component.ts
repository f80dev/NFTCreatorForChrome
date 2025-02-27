import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {$$} from "../../tools";

@Component({
  selector: 'app-cropper',
  imports: [
    MatButton
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

    // Get the cropped image as base64
    return canvas.toDataURL();
  }

  start_crop($event: MouseEvent) {
    this.define_zone=!this.define_zone
    if(this.define_zone){
      const rect = ($event.target as HTMLDivElement).getBoundingClientRect();
      this.x = $event.clientX - rect.left;
      this.y = $event.clientY - rect.top;
    }
  }

  update_crop_zone($event: MouseEvent) {
    if(this.define_zone){
      const rect = ($event.target as HTMLDivElement).getBoundingClientRect();
      this.w_zoom=rect.width
      this.h_zoom=rect.height
      this.w=$event.clientX-rect.left-this.x
      this.h=$event.offsetY-rect.top-this.y
    }
  }

  crop() {
    this.update_visual.emit(this.cropImage(this.visual,this.w_zoom,this.h_zoom))
  }

  cancel() {
    this.update_visual.emit(null)
  }
}
