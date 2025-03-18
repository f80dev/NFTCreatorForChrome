import { Injectable } from '@angular/core';
import {$$} from "../tools";

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
  content: string="";

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
      try{
        const clipboardContents = await navigator.clipboard.read();
        this.content=""
        let n_content_to_read=clipboardContents.length
        for (const item of clipboardContents) {
          n_content_to_read=n_content_to_read-1
          let n_type_to_read=item.types.length
          for(const tp of item.types){

              let blob=await item.getType(tp)
              let fr=new FileReader()
              fr.onload=()=> {
                n_type_to_read=n_type_to_read-1
                let content=fr.result
                if(typeof(content)=="string"){
                  if(this.content=="" && content.length>0) {
                    if (content.startsWith("http") || content.startsWith("data:")){
                      this.content = content
                    }
                  }
                }
                if(n_content_to_read==0 && n_type_to_read==0){
                  if(this.content.length>0){
                    resolve(this.content)
                  }else{
                    reject("clipboard vide")
                  }
                }
              }
              if(tp.startsWith("text/"))fr.readAsText(blob,tp)
              if(tp.startsWith("image/"))fr.readAsDataURL(blob)
            }

          }

      }catch (e:any){
        reject(e)
      }
    })
  }

  async clear() {
    await navigator.clipboard.writeText("")
  }
}
