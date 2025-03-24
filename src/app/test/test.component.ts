import {Component, inject, OnInit} from '@angular/core';
import {UploaderService} from "../uploader.service";
import {NgForOf} from "@angular/common";
import {$$} from "../../tools";
import {ImageProcessorService} from "../image-processor.service";
import {PinataService} from "../pinata.service";
import {UserService} from "../user.service";
import {MatDialog} from "@angular/material/dialog";
import {share_token} from "../mvx";

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {
  src:string=""
  files: any[]=[]
  user=inject(UserService)
  dialog=inject(MatDialog)

  async ngOnInit() {

    this.user.network="elrond-devnet"
    let token_identifier="SFT2-269456"

    await this.user.login(this,"","",true)
    let rc=await share_token(this.user,token_identifier,2,1)
    $$("resultat ",rc)
  }

}
