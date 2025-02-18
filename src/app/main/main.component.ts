import {Component, inject, OnInit} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {InputComponent} from "../input/input.component";
import {UserService} from "../user.service";
import {ApiService} from "../api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MatList, MatListItem} from "@angular/material/list";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {getParams, showError, showMessage} from "../../tools";
import {get_collections, level, makeNFT} from "../mvx";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatIcon} from "@angular/material/icon";
import {ScannerComponent} from "../scanner/scanner.component";
import {WebcamImage, WebcamModule} from "ngx-webcam";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {_prompt} from "../prompt/prompt.component";
import {ClipboardService} from "../clipboard.service";

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
    HourglassComponent
  ],
  standalone:true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

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


  async ngOnInit() {
    let params:any=await getParams(this.routes)
    this.visual=params.url || ""
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


  async Create_NFT() {
    if(this.sel_collection){
      await this.user.login(this,"",localStorage.getItem("pem") || "",true)
      let col:any=this.sel_collection.value
      wait_message(this,"NFT building ...")
      try{
        await makeNFT(col.collection,this.name,this.visual,this.user,this.quantity,this.royalties)
        showMessage(this,"Your new NFT is available in your wallet")
        this.visual=""
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


  open_generator() {
    open(this.sel_generator.value,"Images")
  }

  reset_image() {
    this.visual=""
  }

  open_photo() {
    this.show_scanner=true
  }

  message: string=""

  capture_image($event: WebcamImage) {
    this.show_scanner=false
  }

  take_photo() {
    this.show_scanner=false
  }

  protected readonly level = level;

  logout() {
    this.collections=[]
    this.sel_collection=undefined
    this.user.logout(true)
  }

  async paste_url() {
    let r=await _prompt(this,"Paste your url","","","text","Paste","Cancel",false)
    if(r){
      this.visual=r
    }
  }

  async paste() {
    let content=await this.clipboard.paste()
    debugger
    if(content.startsWith("http"))this.visual=content
  }
}
