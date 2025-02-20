import {inject, Injectable} from '@angular/core';
import {create, Options} from "ipfs-http-client";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {$$} from "../tools";

//const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

@Injectable({
  providedIn: 'root'
})

//IPFS_SERVER="/ip4/173.249.41.158/tcp/"+str(IPFS_PORT)+"/http"
export class UploaderService {
  http=inject(HttpClient)

  b64_to_file(content:string,filename:string="",contentType="image/jpeg") : File {
    if(content.indexOf("base64,")>-1){
      contentType=content.split("base64")[0].replace("data:","")
      content=content.split("base64,")[1]
    }

    let byteCharacters=atob(content)
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const  blob= new Blob([byteArray], { type: contentType });
    return new File([blob], filename, { type: contentType})
  }



  upload(file:File) : Promise<any>{
    return new Promise(async (resolve, reject)  => {
      let headers=new HttpHeaders()
      headers.append('Content-Type', 'multipart/form-data');

      const formData = new FormData()
      formData.append("files", file)

      //https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-add
      this.http.post("https://ipfs.f80.fr:5001/api/v0/add",formData,{headers:headers}).subscribe({
        next:(r:any)=>{
          r.url="https://ipfs.io/ipfs/"+r.Hash+"?filename="+file.name
          resolve(r)
        },
        error:(err:any)=>{
          $$("error ",err)
          reject(err)
        }
      })
    })
  }

}
