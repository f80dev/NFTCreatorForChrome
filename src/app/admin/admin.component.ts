import {Component, inject, OnInit} from '@angular/core';
import {UserService} from "../user.service";
import {create_transaction, execute_transaction, getExplorer, init_user_for_web_wallet, signTransaction} from "../mvx";
import {abi, settings} from "../../environments/settings";
import {ApiService} from "../api.service";
import {MatDialog} from "@angular/material/dialog";
import {showMessage} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatButton} from "@angular/material/button";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {NgIf} from "@angular/common";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-admin',
  imports: [
    MatButton,
    HourglassComponent,
    NgIf,
    UploadFileComponent
  ],
  templateUrl: './admin.component.html',
  standalone: true,
  styleUrl: './admin.component.css'
})
export class AdminComponent {

  user=inject(UserService)
  api=inject(ApiService)
  dialog=inject(MatDialog)
  router=inject(Router)
  toast=inject(MatSnackBar)
  message: string=""


  async upload_pem($event: any) {
    if(this.user.isConnected(false))this.user.logout(true)

    let content=atob($event.file.split("base64,")[1])
    await this.user.login(this,"",content,true)
    let t=await create_transaction("fundback",[this.user.address],this.user,[],settings.contract_addr,abi)

    wait_message(this,"Fund transfering ... ")
    let t_signed=await signTransaction(t,this.user)
    let result=await execute_transaction(t_signed,this.user,"fundback")
    wait_message(this)

    showMessage(this,result.returnMessage)

  }

  open_sc() {
    open(getExplorer(settings.contract_addr,settings.network,"accounts","explorer"),"view")
  }

  protected readonly settings = settings;

  open_appli() {
    this.router.navigate(["main"])
  }
}
