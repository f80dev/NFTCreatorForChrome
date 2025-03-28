import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareService {


 share(title:string,text:string,url:string){
   navigator.share({
     title:title,
     text:text,
     url:url
   })
 }
}
