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

  paste(s="text"): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(await navigator.clipboard.readText());
      }catch (e){
        $$("On fait la lecture d'une image")
      }
      if(s.indexOf("image")>-1){
        try {
          const clipboardContents = await navigator.clipboard.read();
          for (const item of clipboardContents) {
            if (!item.types.includes("image/png")) {
              reject(Error("Clipboard does not contain PNG image data."))
            }
            const blob = await item.getType("image/png");
            resolve(URL.createObjectURL(blob))
          }
        } catch (err) {
          reject(err)
        }
      }
    })

  }
}
