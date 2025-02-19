import {Component, inject, OnInit} from '@angular/core';
import {UploaderService} from "../uploader.service";

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {
  uploader=inject(UploaderService)

  async ngOnInit() {
    this.uploader.init()
    let cid=await this.uploader.upload_file("coucou")
    debugger
  }


}
