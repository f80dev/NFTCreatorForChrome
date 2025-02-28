import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {Location, NgForOf, NgIf} from "@angular/common";
import {InputComponent} from "../input/input.component";
import {UserService} from "../user.service";
import {ApiService} from "../api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MatList, MatListItem} from "@angular/material/list";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {$$, getParams, showError, showMessage} from "../../tools";
import {create_collection, get_collections, level, makeNFT, set_roles_to_collection} from "../mvx";
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
import {MatCard} from "@angular/material/card";
import {IntroComponent} from "../intro/intro.component";
import {SourceComponent} from "../source/source.component";
import {HttpClient} from "@angular/common/http";
import {CropperComponent} from "../cropper/cropper.component";

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
    JsonEditorComponent, MatAccordion, MatCard, IntroComponent, SourceComponent, CropperComponent
  ],
  standalone:true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
  @ViewChild('img', { static: false }) img!: ElementRef;
  name= "MyNFT"
  description=""
  visual= ""
  quantity= 1
  royalties=5

  location=inject(Location)
  user=inject(UserService)
  api=inject(ApiService)
  routes=inject(ActivatedRoute)
  router=inject(Router)
  dialog=inject(MatDialog)
  toast=inject(MatSnackBar)
  clipboard=inject(ClipboardService)
  http=inject(HttpClient)

  collections: {label:string,value:any}[]=[]
  sel_collection:{label:string,value:any} | undefined

  zoom: number=1
  x: number=0
  y: number=0
  w: number=0
  h:number=0

  properties:{name:string,value:string}[]=[]
  showCrop: boolean=false
  uncrop: string=""



  async ngOnInit() {
    let params:any=await getParams(this.routes)
    this.visual=params.url || localStorage.getItem("image") || ""
  }

  async refresh_collection(){
    this.collections=[]
    for(let col of await get_collections(this.user,this.api)) {
      this.collections.push({label:col.name,value:col})
    }
    if(this.collections.length>0){
      this.update_sel_collection(this.collections[0])
    }
  }


  async login(){
    await this.user.login(this,"",localStorage.getItem("pem") || "",false)
    await this.refresh_collection()
  }

  imageProcessor=inject(ImageProcessorService)
  imageUploader=inject(UploaderService)
  async Create_NFT() {
    //voir https://docs.multiversx.com/tokens/nft-tokens/#creation-of-an-nft
    if(this.sel_collection){
      await this.user.login(this,"",localStorage.getItem("pem") || "",true)
      let col:any=this.sel_collection.value
      wait_message(this,"NFT building ...")

      if(this.visual.startsWith("data:")){
        let img=await this.imageProcessor.createImageFromBase64(this.visual)
        let s=await img.toDataURL("image/jpeg")
        let result=await this.imageUploader.upload(this.imageUploader.b64_to_file(s,"image.jpg"))
        this.visual=result.url
      }

      let metadata_tags=""
      let metadata_url=""
      if(this.properties.length>0 || this.description.length>0){
        let obj:any={description:this.description,attributes:[],collection:""}
        for(let prop of this.properties){
          obj.attributes.push({trait_type:prop.name,value:prop.value})
        }
        let metadata=await this.imageUploader.upload(this.imageUploader.string_to_file(JSON.stringify(obj),"infos.json"),0)
        $$("metadata ",metadata)
        for(let i=0;i<10;i++){
          this.tags=this.tags.replace(" ",",").replace(";",",")
        }
        metadata_tags="metadata:ipfs"+metadata.Hash+"/filename.json;tags:"+this.tags
        metadata_url=metadata.url
      }

      try{
        let rc=await makeNFT(col.collection,this.name,this.visual,this.user,this.quantity,this.royalties,this.uris,metadata_tags,metadata_url)
        if(rc.returnMessage=="ok"){
          try{
            let r=await _prompt(this,"Mint terminated. See your NFT in your wallet ?","","","yesno","See my NFT","New NFT",true)
            if(r=="yes"){
              this.view_on_gallery()
            }
          }catch (e:any){

          }
          this.reset_image()
        }else{
          showMessage(this,rc.returnMessage)
        }

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


  reset_image() {
    this.uris=[]
    localStorage.removeItem("image")
    this.visual=""
    this.description=""
    this.properties=[]
    this.royalties=5
    this.zoom=1
    this.x=0
    this.y=0
    this.self_storage=false
    this.location.replaceState("/")
  }


  message: string=""
  image:WebcamImage | undefined

  protected readonly level = level;
  self_storage: boolean = false;
  uris:string[]=[]
  metadata: Object={}
  tags=""

  logout() {
    this.collections=[]
    this.sel_collection=undefined
    this.user.logout(true)
    showMessage(this,"You are disconnected")
  }

  update_visual(src:string){
    this.visual=src
    this.self_storage=(!src.startsWith("http"))
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

  async update_prop(prop: any,field : "value" | "name" ="value") {
    let idx=this.properties.indexOf(prop)
    let r=await _prompt(this,"New Propertie "+field,
      field=="value" ? prop.value : prop.name,"","text","Ok","Cancel",false)
    if(r){
      if(field=="value")this.properties[idx].value=r
      if(field=="name")this.properties[idx].name=r
    }
  }

  delete_prop(uri: any) {
    let idx=this.properties.indexOf(uri)
    this.properties.splice(idx,1)
  }

  add_uri() {
    this.uris.push('https://')
    this.update_uri('https://')
  }

  async add_property() {
    let new_prop={name:"Field"+(this.properties.length+1),value:"0"}
    this.properties.push(new_prop)
    await this.update_prop(new_prop,"name")
    await this.update_prop(new_prop,"value")
  }


  async build_collection() {
    let r=await _prompt(this,"Collection name","","must be inferieur to 20 characters","text","Create","Cancel",false)
    if(r){
      let collection_type=await _prompt(this,"Collection for NFT or SFT","","","list","Ok","Cancel",false,
        [{label:"NFT",value:"NFT"},{label:"SFT",value:"SFT"}])

      await this.user.login(this,"You need a strong authentification to create a collection","",true)
      try{
        let rc=await create_collection(r,this.user,this,collection_type)
        await this.refresh_collection()
        this.update_sel_collection(this.collections[this.collections.length-1])
      }catch (e:any){
        showMessage(this,"Collection not created")
        wait_message(this)
      }
      setTimeout(()=>{this.set_roles_to_collection()},2500)
    }
  }


  async convert_to_base64() {
    if(this.visual.startsWith("http")){
      wait_message(this,"Creating a local copy of your image")
      try{
        let result=await this.imageProcessor.getBase64FromUrl(this.visual)
        this.visual=result as string
      }catch(e:any){
        showMessage(this,"Technical problem ! Retry to make the copy")
      }
      wait_message(this)
    }
  }


  async set_roles_to_collection() {
    if(this.sel_collection){
      await this.user.login(this,"","",true)
      wait_message(this,"Setting roles to the collection")
      try{
        await set_roles_to_collection(this.sel_collection.value.collection,this.user)
      }catch (e:any){}
      wait_message(this)
    }
  }


  view_on_gallery() {
    if(this.sel_collection){
      let url="https://devnet.xspotlight.com/collections/"+this.sel_collection.value.collection;
      if(!this.user.isDevnet())url=url.replace("devnet.","")
      open(url,"Gallery")
    }
  }


  view_account_on_gallery() {
    let url="https://devnet.xspotlight.com/"+this.user.address
    if(!this.user.isDevnet())url=url.replace("devnet.","")
    open(url,"Gallery")
  }


  update_sel_collection($event: any) {
    this.sel_collection=$event
  }


  async add_files($event:any) {
    let result=await this.imageUploader.upload(this.imageUploader.b64_to_file($event.file,$event.filename,$event.type))
    this.uris.push(result.url)
  }


  async open_crop() {
    if(this.visual.startsWith("http")){
      await this.convert_to_base64()
    }
    this.showCrop=true
    this.uncrop=this.visual
  }

  crop($event: any) {
    if($event){
      this.visual=$event
    }
    this.showCrop=false
  }

  undo_crop() {
    this.visual=this.uncrop
    this.uncrop=""
  }
}
