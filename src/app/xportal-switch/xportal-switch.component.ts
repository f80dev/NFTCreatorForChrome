import {Component, inject, Input} from '@angular/core';
import {DeviceService} from "../device.service";
import {MatButton} from "@angular/material/button";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-xportal-switch',
  imports: [
    MatButton,
    NgIf
  ],
  templateUrl: './xportal-switch.component.html',
  standalone: true,
  styleUrl: './xportal-switch.component.css'
})
export class XportalSwitchComponent {

  device=inject(DeviceService)
  @Input() uri=""

  open_xportal() {
    let rc="https://xportal.com/?wallet-connect="+encodeURIComponent(this.uri); //"+this.provider.?relay-protocol%3Dirn&symKey=2a0e80dd8b982dac05eef5ce071fbe541d390fc302666d09856ae379416bfa6e"
    return "https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link="+encodeURIComponent(rc);
  }
}
