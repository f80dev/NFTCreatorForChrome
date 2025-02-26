import {inject, Injectable} from '@angular/core';

import {HttpClient, HttpHeaders} from "@angular/common/http";
import {$$} from "../tools";
import {base32} from "multiformats/bases/base32";
import {sha256} from "multiformats/hashes/sha2";
import {CID} from "multiformats";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})



//IPFS_SERVER="/ip4/173.249.41.158/tcp/"+str(IPFS_PORT)+"/http"
export class UploaderService {
  http=inject(HttpClient)
  endpoint="https://ipfs.f80.fr:5001/api/v0/"


  query(service:string,params="",body={}) : Promise<any> {
    return new Promise(async (resolve, reject)  => {
      let headers=new HttpHeaders()
      headers.append('Content-Type', 'multipart/form-data');
      if(params.length>0)params="?"+params

      this.http.post(this.endpoint+service+params,body,{headers:headers}).subscribe({
        next: (r: any) => {
          resolve(r)
        },
        error: (e: any) => {
          $$("error ",e)
          reject(e)
        }
      })
    })
  }

  b64_to_blob(content:string,contentType="image/jpeg") : Blob {
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

    return blob
  }

  b64_to_file(content:string,filename:string="",contentType="image/jpeg") : File {
    let blob=this.b64_to_blob(content,contentType);
    return new File([blob], filename, { type: contentType})
  }

  json_to_file(content:any,filename="file.json",contentType="application/json") : File {
    const  blob= new Blob([content], { type: contentType });
    return new File([blob], filename, { type: contentType})
  }

  string_to_file(content:string,filename="file.json",contentType="application/json") : File {
    const  blob= new Blob([content], { type: contentType });
    return new File([blob], filename, { type: contentType})
  }


  async list(hash:string=""){
    //https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-files-ls
    return await this.query("ls","arg="+hash)
  }

  async getBase64FromUrl(url: string): Promise<string> {
    let url_temp="https://api.allorigins.win/get?url="+encodeURIComponent(url)
    const rc:any = await firstValueFrom(this.http.get(url_temp,{responseType:'json'}))
    return rc.contents
  }

  async cat(path="") {
    //https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-cat
    return await this.query("cat","arg="+encodeURIComponent(path))
  }

  async convertHashToBafyHash(h:string) {
    try {
      const data=new TextEncoder().encode(h)

      const hashBytes = await sha256.digest(data);

      let cid=new CID(1,0x12, hashBytes,data)

      return cid.toString(base32);
    } catch (error) {
      console.error("Error converting hash:", error);
      return null;
    }
  }



  async pin(hash:string) {
    return await this.query("pin/add","arg="+hash)
  }

  async get(hash:string) {
    //https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-get
    return await this.query("get","arg="+hash)
  }

  async get_formats(){
    return await this.query("cid/hashes");
  }

  async convert(hash:string){
    return await this.query("cid/format","cid="+hash);
  }

  async upload(file:any,version=1) : Promise<any>{
    const formData = new FormData()
    formData.append("file", file)

    //https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-add
    let r=await this.query("add","pin=true&cid-version="+version,formData)
    r.hash=r.Hash
    if(version==1){
      r.url="https://"+r.Hash+".ipfs.dweb.link?filename="+file.name
    }else{
      r.url="https://ipfs.io/ipfs/"+r.Hash+"?filename="+file.name
    }
    return r
  }

}
