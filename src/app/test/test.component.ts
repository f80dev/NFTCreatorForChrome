import {Component, inject, OnInit} from '@angular/core';
import {UploaderService} from "../uploader.service";
import {NgForOf} from "@angular/common";
import {$$} from "../../tools";
import {ImageProcessorService} from "../image-processor.service";
import {PinataService} from "../pinata.service";

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {
  uploader=inject(UploaderService)
  ip=inject(ImageProcessorService)
  src:string=""
  files: any[]=[]
  pinata=inject(PinataService)

  async ngOnInit() {
    let s=await this.ip.getBase64FromUrl("https://focus.telerama.fr/2024/09/09/0/0/2500/1875/1200/0/60/0/ed3effd_1725895105312-poche-modcoul.jpg")
    //const file=this.uploader.string_to_file("coucou les amis")
    const file=this.uploader.b64_to_file(s)
    //const file={name:"coco",content:"les amis"}
    let rc=await this.pinata.uploadFileToIPFS(file)
    $$("",rc)
  }

}
