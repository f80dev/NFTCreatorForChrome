import {Component, inject, Input, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {settings} from '../../environments/settings';
import {NgIf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-intro',
  imports: [MatButton, MatIcon, NgIf, NgOptimizedImage],
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
