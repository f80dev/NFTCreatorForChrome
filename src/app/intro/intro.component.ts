import {Component, inject, Input, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {$$, getParams} from '../../tools';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {ApiService} from '../api.service';
import {MatIcon} from '@angular/material/icon';
import {settings} from '../../environments/settings';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-intro',
  imports: [
    MatButton, MatIcon, NgIf
  ],
  standalone:true,
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css'
})
export class IntroComponent implements OnInit {
  params: any;
  showIntro=true

  async ngOnInit() {
    let occ=Number(localStorage.getItem(settings.appname) || "0")
    if(occ<1) {
      localStorage.setItem(settings.appname, (occ + 1).toString())
      this.showIntro = true
    }else{
      this.showIntro=false
    }
  }

  @Input() message: string=""

  continue() {
    this.showIntro=false
  }
}
