import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {InputComponent} from "../input/input.component";
import {UserService} from "../user.service";
import {ApiService} from "../api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MatList, MatListItem} from "@angular/material/list";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {getParams, showError, showMessage} from "../../tools";
import {create_collection, get_collections, level, makeNFT} from "../mvx";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatIcon} from "@angular/material/icon";
import {ScannerComponent} from "../scanner/scanner.component";
import {WebcamImage, WebcamModule} from "ngx-webcam";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {_prompt} from "../prompt/prompt.component";
import {ClipboardService} from "../clipboard.service";
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {JsonEditorComponent} from "ang-jsoneditor";
import {ImageProcessorService} from "../image-processor.service";
import {UploaderService} from "../uploader.service";
import {Subject} from "rxjs";
import {MatCard} from "@angular/material/card";

@Component({
  selector: 'app-main',
  imports: [
    MatButton,
    NgForOf,
    InputComponent,
    NgIf,
    MatList,
    MatListItem,
    UploadFileComponent,
    MatSlideToggle,
    MatIcon,
    ScannerComponent,
    WebcamModule,
    HourglassComponent,
    MatIconButton,
    MatExpansionPanel, MatExpansionPanelHeader,
    JsonEditorComponent, MatAccordion, MatCard
  ],
  standalone:true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
  @ViewChild('img', { static: false }) img!: ElementRef;
  name= "MyNFT"
  visual= ""
  quantity= 1
  royalties=5

  user=inject(UserService)
  api=inject(ApiService)
  routes=inject(ActivatedRoute)
  router=inject(Router)
  dialog=inject(MatDialog)
  toast=inject(MatSnackBar)
  clipboard=inject(ClipboardService)

  collections: {label:string,value:string}[]=[]
  sel_collection:{label:string,value:string} | undefined
  generators=[
    {label:"Stable Diffusion",value:"https://gen.akash.network/"},
    {label:"Pixabay",value:"https://pixabay.com/"}
  ]
  sel_generator=this.generators[0]
  show_scanner: boolean = false;
  zoom: number=1
  x: number=0
  y: number=0
  w: number=0
  h:number=0
  handle: any
  start_x=0
  start_y=0


  async ngOnInit() {
    let params:any=await getParams(this.routes)
    this.visual=params.url || ""
    setTimeout(()=>{this.autoscale()},200)
    this.login()
  }


  async login(){
    await this.user.login(this,"",localStorage.getItem("pem") || "",false)
    this.collections=[]
    for(let col of await get_collections(this.user,this.api)) {
      this.collections.push({label:col.name,value:col})
    }
    if(this.collections.length>0){
      this.sel_collection=this.collections[0]
    }
  }

  imageProcessor=inject(ImageProcessorService)
  imageUploader=inject(UploaderService)
  async Create_NFT() {
    if(this.sel_collection){
      await this.user.login(this,"",localStorage.getItem("pem") || "",true)
      let col:any=this.sel_collection.value
      wait_message(this,"NFT building ...")

      if(this.self_storage){
        let blob=await this.imageProcessor.getBase64FromUrl(this.visual)
        let result=await this.imageUploader.upload(this.imageUploader.b64_to_file(blob))
        this.visual=result.url
      }

      try{
        await makeNFT(col.collection,this.name,this.visual,this.user,this.quantity,this.royalties,this.uris)
        showMessage(this,"Your new NFT is available in your wallet")
        this.reset_image()
      } catch (e) {
        showError(this,e)
      }
      wait_message(this)

    }
  }


  upload_pem($event: any) {
    let content=atob($event.file.split("base64,")[1])
    localStorage.setItem("pem",content)
    this.login()
  }


  open_generator(generator:any) {
    open(generator.value,"Images")
  }

  reset_image() {
    this.visual=""
    this.visual=""
    this.zoom=1
    this.x=0
    this.y=0
    this.self_storage=false
  }

  open_photo() {
    this.show_scanner=true
    this.handle=setInterval(()=>{this.trigger.next()},200)
  }

  message: string=""
  image:WebcamImage | undefined

  trigger = new Subject<void>();

  capture_image(img: WebcamImage) {
    this.image=img
  }

  take_photo() {
    clearInterval(this.handle)
    if(this.image){
      this.visual=this.image?.imageAsDataUrl
      this.self_storage=true
      setTimeout(()=>{this.autoscale()},200)
    }
    this.show_scanner=false
  }

  protected readonly level = level;
  self_storage: boolean = false;
  uris:string[]=[]
  metadata: Object={}

  logout() {
    this.collections=[]
    this.sel_collection=undefined
    this.user.logout(true)
  }


  async paste() {
    let content=await this.clipboard.paste("text")
    if(content.startsWith("http"))this.visual=content
    setTimeout(()=>{this.autoscale()},1000)
  }


  async update_uri(uri: string) {
    let idx=this.uris.indexOf(uri)
    let r=await _prompt(this,"New URI",uri,"","text","Ok","Cancel",false)
    if(r)this.uris[idx]=r
  }

  delete_uri(uri: string) {
    let idx=this.uris.indexOf(uri)
    this.uris.splice(idx,1)
  }

  add_uri() {
    this.uris.push('https://')
    this.update_uri('https://')
  }

  update_zoom($event: any) {
    this.zoom=this.zoom+($event.wheelDelta>0 ? 0.01 : -0.01);
    if(this.zoom<=0)this.zoom=0.1;
    this.self_storage=true
  }


  getImageDimensions(): void {
    const img = this.img.nativeElement as HTMLImageElement;
    this.w = img.naturalWidth;
    this.h = img.naturalHeight;
  }


  private autoscale() {
    this.getImageDimensions()
    this.zoom=300/this.w
    this.x=0
    this.y=0
  }



  update_position($event: MouseEvent) {
    this.x=this.x+(this.start_x-$event.clientX)
    this.y=this.y+(this.start_y-$event.clientY)
    this.self_storage=true
  }


  start_translate($event: MouseEvent) {
    this.start_x=$event.offsetX
    this.start_y=$event.offsetY
  }

  center_image($event: MouseEvent) {
    this.x=this.x-(300-$event.offsetX)
    this.y=this.y-(300-$event.offsetY)
  }

  from_device($event: any) {
    this.visual=$event.file
    this.self_storage=false
    setTimeout(()=>{this.autoscale()},400)
  }

  protected readonly create_collection = create_collection;

  async build_collection() {
    let r=await _prompt(this,"Collection name","","must be inferieur to 20 characters","text","Create","Cancel",false)
    if(r){

    }
  }
}
