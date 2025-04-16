import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../user.service";
import {ClipboardService} from "../clipboard.service";
import {getParams, showMessage} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatButton} from "@angular/material/button";
import {SafePipe} from "../safe.pipe";

@Component({
  selector: 'app-editor',
  imports: [
    MatButton,
    SafePipe
  ],
  templateUrl: './editor.component.html',
  standalone: true,
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnDestroy,OnInit {

  handle:any

  routes=inject(ActivatedRoute)
  router=inject(Router)
  user=inject(UserService)
  clipboard=inject(ClipboardService)
  toast=inject(MatSnackBar)
  editor_url="https://viliusle.github.io/miniPaint/"
  intro_message: string="To transfer as NFT, use menu : 'Edit' > 'Copy to clipboard', or CTRL+C"

  async create_nft(){
    let data=await this.clipboard.paste()
    if(data.startsWith("data:")){
      localStorage.setItem("image",data as string)
      this.router.navigate(["main"]);
    }else{
      showMessage(this,"You must save your picture for making your NFT")
    }
  }


  ngOnDestroy(): void {
    clearInterval(this.handle)
  }


  async ngOnInit() {
    let params:any=await getParams(this.routes)
    if(params.hasOwnProperty("url")){this.editor_url=params.url}
    if(params.hasOwnProperty("intro")){this.intro_message=params.intro}

    this.handle=setInterval(async ()=>{await this.create_nft()},1000)
  }


  _cancel() {
    this.router.navigate(["main"])
  }

}
