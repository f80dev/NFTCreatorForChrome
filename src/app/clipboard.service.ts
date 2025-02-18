import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  paste(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let rc:any=await navigator.clipboard.readText();
        if(rc.length==0){
          if (rc.type.startsWith('image/')){
            const content=rc.getAsFile();
            const reader = new FileReader();
            reader.onload = (e:any) => {
              resolve(e.target.result); // Log or use the Base64 string as needed
            };
          }

        }

        return rc
      } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        return '';
      }
    })

  }
}
