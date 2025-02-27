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

  cropImage(data:string,w_zone:number) {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src=data

    let zoom=img.naturalWidth/w_zone

    canvas.width = this.w*zoom;
    canvas.height = this.h*zoom;
    const ctx = canvas.getContext("2d");

    ctx!.drawImage(
      img,
      this.x*zoom, this.y*zoom, this.w*zoom, this.h*zoom, // Source rectangle
      0, 0, this.w*zoom, this.h*zoom // Destination rectangle
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

  end_crop($event: MouseEvent) {
    if(this.define_zone){
      const rect = ($event.target as HTMLDivElement).getBoundingClientRect();
      this.w_zoom=rect.width
      this.w=$event.clientX-rect.left-this.x
      this.h=$event.offsetY-rect.top-this.y
    }
  }

  crop() {
    this.update_visual.emit(this.cropImage(this.visual,this.w_zoom))
  }

  cancel() {
    this.update_visual.emit(null)
  }
}
