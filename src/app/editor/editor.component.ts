import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../user.service";
import {ClipboardService} from "../clipboard.service";
import {showMessage} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-editor',
  imports: [
    MatButton
  ],
  templateUrl: './editor.component.html',
  standalone: true,
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnDestroy,OnInit {

  handle:any
  ngOnDestroy(): void {
      clearInterval(this.handle)
  }
  ngOnInit(): void {
      this.handle=setInterval(async ()=>{await this.create_nft()},1000)
  }

  router=inject(Router)
  user=inject(UserService)
  clipboard=inject(ClipboardService)
  toast=inject(MatSnackBar)

  async create_nft(){
    let data=await this.clipboard.paste()
    if(data.startsWith("data:")){
      localStorage.setItem("image",data as string)
      this.router.navigate(["main"]);
    }else{
      showMessage(this,"You must save your picture for making your NFT")
    }
  }


  _cancel() {
    this.router.navigate(["main"])
  }

}
