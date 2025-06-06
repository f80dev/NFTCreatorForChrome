//version 0.1 - 05/06/25

import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {InputComponent} from "../input/input.component";
import {MatHint} from "@angular/material/form-field";
import {SafePipe} from "../safe.pipe";
import {NgForOf, NgIf} from "@angular/common";
import {MatButton} from "@angular/material/button";

export function _prompt(vm:any,title:string,_default:string="",description="",_type="text",lbl_ok="ok",
                        lbl_cancel="Annuler",onlyConfirm=true,options:any=null,
                        force_yes=false,max_select=-1):Promise<string> {
  //permet d'afficher une boite de dialog
  return new Promise((resolve, reject) => {
    if(_type=="yesorno" || _type=="oui/non" || _type=="boolean" || _type=="bool")onlyConfirm=true;
    if(_default.length>0)onlyConfirm=false;
    if(force_yes){
      resolve("yes");
    } else {
      vm.dialog.open(PromptComponent,{
        width: 'auto',data:
            {
              title: title,
              type: _type,
              question:description,
              options:options,
              result:_default,
              onlyConfirm:onlyConfirm,
              lbl_ok:lbl_ok,
              lbl_cancel:lbl_cancel,
              max_select:max_select
            }
      }).afterClosed().subscribe((resp:any) => {
        if(resp) {
          resolve(resp);
        } else {
          reject()
        }
      },(err:any)=>{reject(err)});
    }
  });
}



export interface DialogData {
  title: string;
  result: any;
  question:string;
  placeholder:string;
  onlyConfirm:boolean;
  min:number,
  image:string,
  n_rows:number,
  max:number,
  emojis:boolean;
  lbl_ok:string,
  type:"text" | "number" | "memo" | "list" | "listimages" | "boolean" | "images" | "slide" | "slider",
  lbl_cancel:string,
  lbl_sup:string,
  options:any[],
  subtitle:string,
  max_select:number
}


@Component({
  selector: 'app-prompt',
  standalone:true,
  imports: [
    InputComponent,
    SafePipe, NgIf, NgForOf,
    MatDialogClose, MatDialogContent, MatDialogTitle, MatButton, MatDialogActions, MatHint
  ],
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.css']
})

export class PromptComponent  {

  showEmoji=false;
  _type:"text" | "number" | "memo" | "list" | "listimages" | "boolean" | "images" | "slide" | "slider"="text"
  _min: number=0
  _max: number=0

  constructor(
      public dialogRef_prompt: MatDialogRef<PromptComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData)
  {
    if(this._type=="boolean")data.onlyConfirm=true;
    if(this._type=="images")data.result=[];
    if(data.onlyConfirm)data.result="yes";
    if(data.min){
      this._min=data.min;
      this._type="number";
    }
    if(data.max){
      this._max=data.max;
      this._type="number";
    }
    if(data.hasOwnProperty("type"))this._type=data.type;
    if(!data.result)data.result="";
    if(!data.n_rows)data.n_rows=4;
  }

  onNoClick(): void {
    this.dialogRef_prompt.close(null);
  }

  selectEmoji(event:any){
    this.data.result=this.data.result+event.emoji.native;
    this.showEmoji=false;
  }


  onEnter(evt:any) {
    if(evt.keyCode==13)
      this.dialogRef_prompt.close(this.data.result);
  }

  select_option(value: any) {
    this.dialogRef_prompt.close(value);
  }


  select_image(img:any) {
    if(this.data.result=="")this.data.result=[];
    let index=this.data.result.indexOf(img);
    if(index>-1){
      this.data.result.splice(index,1);
    } else {
      if(this.data.max_select>0 && this.data.result.length>=this.data.max_select){this.data.result=[]}
      this.data.result.push(img);
    }
  }

  select_all() {
    if(this.data.max_select==-1 || this.data.options.length<this.data.max_select){
      this.dialogRef_prompt.close(this.data.options)
    }else{
      let rc=this.data.options.slice(0,this.data.max_select)
      this.dialogRef_prompt.close(rc)
    }
  }
}
