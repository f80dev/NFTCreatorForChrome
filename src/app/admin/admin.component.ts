import {Component, inject, OnInit} from '@angular/core';
import {UserService} from "../user.service";
import {
  create_transaction,
  execute_transaction,
  getEntrypoint, getExplorer,
  init_user_for_web_wallet,
  signTransaction
} from "../mvx";
import {abi, settings} from "../../environments/settings";
import {ApiService} from "../api.service";
import {MatDialog} from "@angular/material/dialog";
import {showMessage} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatButton} from "@angular/material/button";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {NgIf} from "@angular/common";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {Address, AddressValue, TransactionComputer} from "@multiversx/sdk-core/out";

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
  toast=inject(MatSnackBar)
  message: string=""


  async upload_pem($event: any) {
    if(this.user.isConnected(false))this.user.logout(true)

    let content=atob($event.file.split("base64,")[1])
    await this.user.login(this,"",content,true)
    let t=await create_transaction("fundback",[new AddressValue(Address.newFromBech32(this.user.address))],this.user,[],settings.contract_addr,abi)
    await getEntrypoint(this.user.network).signTransaction(t,this.user.provider)

    wait_message(this,"Fund transfering ... ")
    let result=await execute_transaction(t,this.user,"fundback")
    wait_message(this)

    open(getExplorer(this.user.address,this.user.network,"accounts","explorer"),"explorer")

    showMessage(this,result.returnMessage)

  }
}
