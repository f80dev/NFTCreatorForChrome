import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {$$, rotate} from "../../tools";
import {NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-cropper',
  imports: [
    MatButton,
    NgIf,
    MatIconButton,
    MatIcon
  ],
  templateUrl: './cropper.component.html',
  standalone: true,
  styleUrl: './cropper.component.css'
})
export class CropperComponent implements OnChanges {

  @ViewChild('imageZone') image_zone:ElementRef | undefined;

  @Input() visual=""
  x_zone=0
  y_zone=0
  w_zone=0
  h_zone=0
  w: number =0
  h=0
  @Output() update_visual=new EventEmitter();
  define_zone: boolean=false
  zoom: number=0
  img = new Image();
  showSave: boolean = false


  ngOnChanges(changes: SimpleChanges): void {
    if(changes.hasOwnProperty("visual")){
      this.img.src=changes["visual"].currentValue
      setTimeout(()=>{
        //const rect = (this.image_zone!.nativeElement as HTMLDivElement).getBoundingClientRect();
        this.w=this.img.naturalWidth
        this.h=this.img.naturalHeight-100
        this.zoom=Math.min(screen.availHeight/this.h,screen.availWidth/this.w)

      },200)
    }
  }


  cropImage() {
    const canvas = document.createElement("canvas");

    canvas.width =  Math.round(this.w_zone/this.zoom)
    canvas.height =  Math.round(this.h_zone/this.zoom)
    const ctx = canvas.getContext("2d");
    ctx!.drawImage(
      this.img,
      Math.round(this.x_zone/this.zoom), Math.round(this.y_zone/this.zoom), canvas.width, canvas.height, // Source rectangle
      0, 0, canvas.width,canvas.height
    );
    return canvas.toDataURL("image/webp",90);
  }


  start_crop($event: any) {
    this.define_zone=!this.define_zone
    if(this.define_zone){
      // const rect = this.image_zone?.nativeElement.getBoundingClientRect();
      let x=$event.type=="mousedown" ?  $event.clientX : $event.touches[0].clientX
      let y=$event.type=="mousedown" ?  $event.clientY : $event.touches[0].clientY
      this.x_zone = x // - rect.left
      this.y_zone = y //- rect.top
    }
  }


  update_crop_zone($event: any) {
    if(this.define_zone){
      // const rect = this.image_zone?.nativeElement.getBoundingClientRect();
      let x=$event.type=="mousemove" ?  $event.clientX : $event.touches[0].clientX
      let y=$event.type=="mousemove" ?  $event.clientY : $event.touches[0].clientY
      this.w_zone=x-this.x_zone
      this.h_zone=y-this.y_zone
    }
  }


  crop() {
    this.update_visual.emit(this.cropImage())
  }

  cancel() {
    this.update_visual.emit(null)
  }

  async _rotate() {
    this.update_visual.emit(await rotate(this.visual,-90))
  }
}
