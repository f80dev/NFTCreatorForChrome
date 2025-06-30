import {Component, inject, OnInit} from '@angular/core';
import {UserService} from "../user.service";
import {
  create_transaction,
  execute_transaction, get_sc_balance,
  getEntrypoint,
  getExplorer,
  init_user_for_web_wallet,
  signTransaction
} from "../mvx";
import {abi, settings} from "../../environments/settings";
import {ApiService} from "../api.service";
import {MatDialog} from "@angular/material/dialog";
import {$$, showError, showMessage} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatButton} from "@angular/material/button";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {DecimalPipe, NgIf} from "@angular/common";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {Router} from "@angular/router";
import {Address, AddressValue, BigUIntValue} from "@multiversx/sdk-core/out";
import {InputComponent} from "../input/input.component";

@Component({
  selector: 'app-admin',
  imports: [
    MatButton,
    HourglassComponent,
    NgIf,
    UploadFileComponent,
    InputComponent,
    DecimalPipe
  ],
  templateUrl: './admin.component.html',
  standalone: true,
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  user=inject(UserService)
  api=inject(ApiService)
  dialog=inject(MatDialog)
  router=inject(Router)
  toast=inject(MatSnackBar)
  message: string=""
  protected balance: number=0



  async ngOnInit() {
    this.user.network=settings.network
    this.balance=await get_sc_balance(settings.contract_addr,settings.network)
  }


  async upload_pem($event: any) {
    if(this.user.isConnected(false))this.user.logout(true)

    let content=atob($event.file.split("base64,")[1])
    await this.user.login(this,"",content,true)
    let args=[new BigUIntValue(this.amount*1e18),new AddressValue(Address.newFromBech32(this.user.address))]
    let t=await create_transaction("fundback",args,this.user,[],settings.contract_addr,abi)

    wait_message(this,"Fund transfering ... ")

    if(this.user.provider && this.user.network){
      debugger
      await getEntrypoint(this.user.network).signTransaction(t,this.user.provider)
      let result=await execute_transaction(t,this.user,"fundback")
      wait_message(this)
      showMessage(this,result.returnMessage)

    }else{
      showError(this)
    }


  }



  open_sc() {
    open(getExplorer(settings.contract_addr,settings.network,"accounts","explorer"),"view")
  }

  protected readonly settings = settings;
  amount: number = 0.1;


  open_appli() {
    this.router.navigate(["main"])
  }
}
