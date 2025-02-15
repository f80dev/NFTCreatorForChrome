import {Component, inject, OnInit} from '@angular/core';
import {ChromeExtensionService} from "../chrome-extension.service";
import {MatButton} from "@angular/material/button";
import {NgForOf} from "@angular/common";
import {InputComponent} from "../input/input.component";

@Component({
  selector: 'app-main',
  imports: [
    MatButton,
    NgForOf,
    InputComponent
  ],
  standalone:true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  chrome=inject(ChromeExtensionService)
  urls: string[]=[]
  name=""

  async ngOnInit() {
    let urls=await this.chrome.get_local("urls","")
    this.urls=urls.split(",")
  }

  Create_NFT() {

  }
}
