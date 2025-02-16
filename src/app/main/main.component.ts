import {Component, inject, OnInit} from '@angular/core';
import {ChromeExtensionService} from "../chrome-extension.service";
import {MatButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {InputComponent} from "../input/input.component";
import {UserService} from "../user.service";
import {ApiService} from "../api.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {get_collections, makeNFT} from "../mvx";
import {MatList, MatListItem} from "@angular/material/list";
import {UploadFileComponent} from "../upload-file/upload-file.component";

@Component({
  selector: 'app-main',
  imports: [
    MatButton,
    NgForOf,
    InputComponent,
    NgIf,
    MatList,
    MatListItem,
    UploadFileComponent
  ],
  standalone:true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  chrome=inject(ChromeExtensionService)
  urls: string[]=[]
  name="MyNFT"
  user=inject(UserService)
  api=inject(ApiService)
  router=inject(Router)
  dialog=inject(MatDialog)
  collections: any[]=[];
  sel_collection:any
  visual: string="https://www.lecadeauartistique.com/img/produits/decoration-murale/affiche-monet-nenuphars-saules-reflets-nuages.jpg"
  quantity=1


  async ngOnInit() {
    let urls=await this.chrome.get_local("urls","")
    this.urls=urls.split(",")
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
  }
}
