import {Component, inject, Input} from '@angular/core';
import {DeviceService} from "../device.service";
import {MatButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {eval_direct_url_xportal} from "../authent/authent.component";

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
    open(eval_direct_url_xportal(this.uri),"xportal")
  }
}
