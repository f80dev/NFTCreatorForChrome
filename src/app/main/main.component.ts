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
import {
  create_collection, execute_transaction,
  get_collections, get_nft,
  getExplorer,
  level, makeNFTTransaction,
  set_roles_to_collection, share_token, share_token_wallet, signTransaction, view_account_on_gallery,
  view_nft
} from "../mvx";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatIcon} from "@angular/material/icon";
import {ScannerComponent} from "../scanner/scanner.component";
import {WebcamImage, WebcamModule} from "ngx-webcam";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {_prompt} from "../prompt/prompt.component";
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {JsonEditorComponent} from "ang-jsoneditor";
import {ImageProcessorService} from "../image-processor.service";
import {UploaderService} from "../uploader.service";
import {MatCard} from "@angular/material/card";
import {IntroComponent} from "../intro/intro.component";
import {SourceComponent} from "../source/source.component";
import {HttpClient} from "@angular/common/http";
import {CropperComponent} from "../cropper/cropper.component";
import {PinataService} from "../pinata.service";
import {environment} from "../../environments/environment";
import {ClipboardService} from "../clipboard.service";
import {settings} from "../../environments/settings";
import {ShareService} from "../share.service";

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
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  @ViewChild('img', { static: false }) img!: ElementRef;
  name= "MyNFT"
  description=""
  visual= ""
  quantity= 1
  royalties=5

  pinata=inject(PinataService)
  location=inject(Location)
  user=inject(UserService)
  api=inject(ApiService)
  routes=inject(ActivatedRoute)
  router=inject(Router)
  dialog=inject(MatDialog)
  toast=inject(MatSnackBar)
  http=inject(HttpClient)
  shareService=inject(ShareService)


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
  filename: string="image.webp"
  clipboard=inject(ClipboardService)
  private after: string="new"
  public  share_url="";

  normalize(text:string) : string {
    return text.replace(/[^a-z0-9 A-Z]/gi, '');
  }




  async ngOnInit() {
    let params:any=await getParams(this.routes)
    this.user.network=params.network || "elrond-devnet"
    $$("Lecture des paramètres ",params)
    this.user.action_after_mint=params.action || params.action_after_mint || ""
    this.visual=params.url || localStorage.getItem("image") || ""
    if(params.intro)localStorage.removeItem(settings.appname)
    await this.user.login(this,"","",false,0.003,"",true)
    await this.refresh_collection()
    if(params.hasOwnProperty("uri"))this.uris.push(params.uri)

    if(params.hasOwnProperty("collection")){
     //TODO compléter avec la possibilité de selectionner par défaut une collection
    }
    if(params.hasOwnProperty("description"))this.description=this.normalize(params.description)
    if(params.hasOwnProperty("name"))this.name=this.normalize(params.name.split(".")[0])
    this.filename=params.filename || "image.webp"

    //Si l'utilisateur à donner permission on check le clipboard
    let obj:any={name: 'clipboard-read' }

    if ((await navigator.permissions.query(obj)).state === 'granted') {
      try{
        let visual=await this.clipboard.paste()
        if(visual.length>0)this.visual=visual
      }catch(e:any){
        $$("Rien dans le presse papier")
      }

    }
  //transformation du visual
    if(this.visual.length>0 && params.self_storage)await this.convert_to_base64("image/webp")
    if(params.hasOwnProperty("source") && params.source!=this.visual)this.properties.push({name:"Sources",value:params.source})
  }



  async refresh_collection(){
    if(this.user.address){
      this.collections=[]
      for(let col of await get_collections(this.user,this.api)) {
        this.collections.push({label:col.name,value:col})
      }
      if(this.collections.length>0)this.update_sel_collection(this.collections[0])
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
    if(this.name.length<3 || this.name.length>50){
      showMessage(this,"Name must be between 3 and 50 characters")
      return
    }

    if(this.sel_collection){
      let address_change=await this.user.login(this,"",localStorage.getItem("pem") || "",true)
      if(address_change){
        this.user.logout()
        showMessage(this,"Reconnection required")
        return
      }

      let col:any=this.sel_collection.value
      wait_message(this,"NFT building ...")

      let hash=""
      if(this.visual.startsWith("data:")){
        let img=await this.imageUploader.b64_to_file(this.visual,"img_"+this.user.address+".webp")
        let result:any=await this.pinata.uploadFileToIPFS(img)
        this.visual=result.url
        hash=result.hash
        $$("Consultation du visuel https://ipfs.io/ipfs/"+hash)
      }

      let metadata_tags=""
      let metadata_url=""
      if(this.properties.length>0 || this.description.length>0){
        let obj:any={description:this.description,attributes:[],collection:this.sel_collection.value.name}
        for(let prop of this.properties){
          obj.attributes.push({trait_type:prop.name,value:prop.value})
        }

        //const blob = new Blob([JSON.stringify(obj)], { type: 'application/json'})
        //let metadata=await this.imageUploader.upload(blob,"infos.json",0)

        let metadata=await this.pinata.uploadJSONToIPFS({name:"metadata_"+this.user.address+".json",content:obj})

        $$("metadata ",metadata)
        for(let i=0;i<10;i++){
          this.tags=this.tags.replace(" ",",").replace(";",",")
        }
        metadata_tags="metadata:"+metadata.hash+";tags:"+this.tags
        metadata_url=metadata.url
        $$("Consultation des metadata https://ipfs.io/ipfs/"+metadata.hash)
      }

      let quantity=col.subType.startsWith("NonFungible") ? 1 : this.quantity
      try{

        let identifier=await makeNFTTransaction(col.collection,this.name,this.visual,this.user,quantity,this.royalties,this.uris,metadata_tags,metadata_url,hash)

        if(identifier!="error"){
          try{
            if(this.user.action_after_mint.startsWith("redirect"))open(this.user.action_after_mint.replace("redirect:",""))
            if(this.user.action_after_mint=="close")window.close()
            if(this.user.action_after_mint=="wallet")this.view_on_gallery(true)

            $$("Visibilité du NFT sur "+getExplorer(identifier,this.user.network,"nfts"))

            let r=await _prompt(this,"Mint terminated of "+identifier,"","Send your NFT in your wallet ?","yesno","Send it","New NFT",true)

            if(r=="yes"){
              let nft=await get_nft(identifier,this.api,this.user.network)
              if(nft){
                let url=await share_token_wallet(this,nft,environment.share_cost)
                this.router.navigate(["share"],{queryParams:{url:url,name:nft.name,visual:this.visual,identifier:nft.identifier}})
              }
            }

          }catch (e:any){

          }
          this.reset_image()
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
    this.clipboard.clear()
    localStorage.removeItem("image")
    this.visual=""
    this.uncrop=""
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

  async open_collection(collection_id:string){
    await this.refresh_collection()
    for(let col of this.collections){
      if(col.value.collection==collection_id)this.sel_collection=col;
    }
  }


  async build_collection() {
    let r=await _prompt(this,"Collection name","","must be inferieur to 20 characters","text","Create","Cancel",false)
    if(r){
      let collection_type: any=await _prompt(this,"Collection for NFT or SFT","","","list","Ok","Cancel",false,
        [{label:"NFT",value:"NFT"},{label:"SFT",value:"SFT"}])
      await this.user.login(this,"You need a strong authentification to create a collection","",true)
      try{
        wait_message(this,"Collection building")
        let rc=await create_collection(r,this.user,this,collection_type.value)
        setTimeout(async ()=>{
          await this.set_roles_to_collection(rc.collection_id)
          this.open_collection(rc.collection_id)
        },2500)
      }catch (e:any){
        showMessage(this,"Collection not created")
        wait_message(this)
      }

    }
  }


  async convert_to_base64(format="image/webp") {
    if(this.visual.startsWith("http")){
      wait_message(this,"Creating a personal copy of this picture")
      try{
        let result=await this.imageProcessor.getBase64FromUrl(this.visual)
        result=(await this.imageProcessor.createImageFromBase64(result)).toDataURL(format)
        this.visual=result as string
      }catch(e:any){
        showMessage(this,"Technical problem ! Retry to make the copy")
      }
      wait_message(this)
    }
  }


  async set_roles_to_collection(collection_id:string) {
      await this.user.login(this,"","",true)
      wait_message(this,"Setting roles to the collection")
      try{
        await set_roles_to_collection(collection_id,this.user)
      }catch (e:any){
        showMessage(this,"Problem to setting the collection, retry")
      }
      wait_message(this)
  }


  view_on_gallery(self_window=false,explorer=environment.collection_viewer) {
    if(this.sel_collection){
      if(!this.user.isDevnet())explorer=explorer.replace("devnet.","").replace("devnet-","")
      let url=explorer.replace("%collection%",this.sel_collection.value.collection)
      if(!this.user.isDevnet())url=url.replace("devnet.","")
      if(self_window){
        open(url)
      }else{
        open(url,"Gallery")
      }

    }
  }




  update_sel_collection($event: any) {
    this.sel_collection=$event
  }


  async add_files($event:any) {
    wait_message(this,"Uploading")
    try{
      debugger
      let result=await this.imageUploader.upload(this.imageUploader.b64_to_blob($event.file,$event.type),$event.filename,1)
      this.uris.push(result.url)
    }catch (e){
      showMessage(this,"Upload canceled, retry")
    }
    wait_message(this)

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

  eval_size(visual: string) {
    if(visual.startsWith("http"))return visual
    return Math.round(visual.length/1000) + " Ko"
  }

  protected readonly view_account_on_gallery = view_account_on_gallery;
}
