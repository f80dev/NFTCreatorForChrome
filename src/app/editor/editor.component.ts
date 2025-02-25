import {Component, inject} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../user.service";
import {ClipboardService} from "../clipboard.service";

@Component({
  selector: 'app-editor',
  imports: [],
  templateUrl: './editor.component.html',
  standalone: true,
  styleUrl: './editor.component.css'
})
export class EditorComponent {

  router=inject(Router)
  user=inject(UserService)
  clipboard=inject(ClipboardService)

  async create_nft(){
    let data=await this.clipboard.paste("text")
    localStorage.setItem("image",data as string)
    this.router.navigate(["main"]);
  }

}
