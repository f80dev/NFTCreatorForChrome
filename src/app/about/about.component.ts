import {Component, inject, OnInit} from '@angular/core';
import {environment} from "../../environments/environment";
import {ActivatedRoute, Router} from "@angular/router";
import {apply_params, deleteAllCookies, getParams} from "../../tools";
import {Location, NgIf} from "@angular/common";
import {UserService} from "../user.service";
import {_prompt} from "../prompt/prompt.component";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {settings} from '../../environments/settings';
import {LogUpdateService} from "../log-update.service";

@Component({
  selector: 'app-about',
  standalone:true,
  imports: [
    MatIcon, NgIf, MatIconButton
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  website=environment.website
  company=environment.company
  cgu=environment.website+"/cgu.html"
  contact=""
  exist_faqs: boolean = false;
  show_admin: boolean = false;
  updater=inject(LogUpdateService)

  constructor(
      public routes:ActivatedRoute,
      public _location:Location,
      public user:UserService,
      public router:Router,
  ) {}

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    apply_params(this,params,settings);
    this.exist_faqs=(params.faqs || environment.hasOwnProperty('faqs') || "").length>0
    let env:any=environment
    this.show_admin=env.hasOwnProperty("admin_password")
  }

  open_faqs() {
    this.router.navigate(["faqs"])
  }

  async open_admin() {
    // @ts-ignore
    if(!environment.admin_password || environment.admin_password==""){
      this.router.navigate(["admin"])
    }else{
      let conf=await _prompt(this,"Password administrateur","","","text","ok","annuler",false)
      // @ts-ignore
      if(conf==environment.admin_password)this.router.navigate(["admin"]);
    }

  }

    clear() {
      deleteAllCookies()
    }

  protected readonly environment = environment;
  protected readonly settings = settings;

  open_telegram() {
    open(environment.telegram,"Support")
  }
}
