import { Injectable } from '@angular/core';
import {$$} from "../tools";

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  }

  paste(): Promise<string> {
    return new Promise(async (resolve, reject)  => {
      const clipboardContents = await navigator.clipboard.read();
      debugger
      let rc=""
      for (const item of clipboardContents) {
        if (item.types.includes("text/plain")) {
          let url=await (await item.getType("text/plain")).text()
          if(url.startsWith("http"))rc=url
        }
        if (item.types.includes("image/png")) {
          const reader = new FileReader();
          const blob = await item.getType("image/png");
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.readAsDataURL(blob);
          reader.onerror=reject
        }
      }
      if(rc.length>0){
        resolve(rc)
      }else{
        reject()
      }
    })
  }
}
