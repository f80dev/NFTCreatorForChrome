import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
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
export class CropperComponent implements OnChanges {

  @ViewChild('imageZone') image_zone:ElementRef | undefined;

  @Input() visual=""
  x=0
  y=0
  w=0
  h=0
  @Output() update_visual=new EventEmitter();
  define_zone: boolean=false
  zoom: number=0
  img = new Image();


  ngOnChanges(changes: SimpleChanges): void {
    if(changes.hasOwnProperty("visual")){
      this.img.src=changes["visual"].currentValue
      setTimeout(()=>{
        const rect = (this.image_zone!.nativeElement as HTMLDivElement).getBoundingClientRect();
        let zoom_w=this.img.naturalWidth/rect.width
        let zoom_h=this.img.naturalHeight/rect.height
        this.zoom=zoom_w>zoom_h ? zoom_h : zoom_w
      },200)
    }

  }

  cropImage() {
    const canvas = document.createElement("canvas");

    canvas.width =  Math.round(this.w*this.zoom)
    canvas.height =  Math.round(this.h*this.zoom)
    const ctx = canvas.getContext("2d");

    ctx!.drawImage(
      this.img,
      Math.round(this.x*this.zoom), Math.round((this.y-90)*this.zoom), canvas.width, canvas.height, // Source rectangle
      0, 0, canvas.width,canvas.height
    );

    return canvas.toDataURL();

  }

  start_crop($event: any) {
    this.define_zone=!this.define_zone
    if(this.define_zone){
      const rect = this.image_zone?.nativeElement.getBoundingClientRect();
      let x=$event.type=="mousedown" ?  $event.clientX : $event.touches[0].clientX
      let y=$event.type=="mousedown" ?  $event.clientY : $event.touches[0].clientY
      this.x = x - rect.left
      this.y = y - rect.top
    }
  }

  update_crop_zone($event: any) {
    if(this.define_zone){
      const rect = this.image_zone?.nativeElement.getBoundingClientRect();
      let x=$event.type=="mousemove" ?  $event.clientX : $event.touches[0].clientX
      let y=$event.type=="mousemove" ?  $event.clientY : $event.touches[0].clientY
      this.w=x-rect.left-this.x
      this.h=y-rect.top-this.y
    }
  }

  crop() {
    this.update_visual.emit(this.cropImage())
  }

  cancel() {
    this.update_visual.emit(null)
  }
}
