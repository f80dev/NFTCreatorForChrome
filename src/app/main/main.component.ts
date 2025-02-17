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
import {getParams} from "../../tools";
import {get_collections, makeNFT} from "../mvx";
import {MatSlideToggle} from "@angular/material/slide-toggle";

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
    MatSlideToggle
  ],
  standalone:true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  name= "MyNFT"
  visual= ""
  quantity= 1
  royalties=0

  user=inject(UserService)
  api=inject(ApiService)
  routes=inject(ActivatedRoute)
  router=inject(Router)
  dialog=inject(MatDialog)

  collections: any[]=[]
  sel_collection:any
  sel_generator: any
  generators=[
    {label:"Stable Diffusion",value:"https://gen.akash.network/"},
    {label:"Pixabay",value:"https://pixabay.com/"}
  ]


  async ngOnInit() {
    let params:any=await getParams(this.routes)
    this.visual=params.url || "https://www.lecadeauartistique.com/img/produits/decoration-murale/affiche-monet-nenuphars-saules-reflets-nuages.jpg"
    this.login()
  }


  async login(){
    await this.user.login(this,"",localStorage.getItem("pem") || "",false)
    this.collections=[]
    for(let col of await get_collections(this.user,this.api)) {
      this.collections.push({title:col.name,value:col})
    }
    if(this.collections.length>0)this.sel_collection=this.collections[0]
  }


  async Create_NFT() {
    await this.user.login(this,"",localStorage.getItem("pem") || "",true)
    let col=this.sel_collection.value
    await makeNFT(col.ticker,this.name,this.visual,this.user,this.quantity)
  }


  upload_pem($event: any) {
    let content=atob($event.file.split("base64,")[1])
    localStorage.setItem("pem",content)
    this.login()
  }


  open_generator() {
    open(this.sel_generator.value,"Images")
  }
}
