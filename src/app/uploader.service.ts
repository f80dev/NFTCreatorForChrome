import {inject, Injectable} from '@angular/core';

import {HttpClient, HttpHeaders} from "@angular/common/http";
import {$$} from "../tools";
import { Buffer } from 'buffer';
import base32Encode from "base32-encode";

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


  async list(hash:string=""){
    //https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-files-ls
    return await this.query("ls","arg="+hash)
  }


  async cat(path="") {
    //https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-cat
    return await this.query("cat","arg="+encodeURIComponent(path))
  }

  async convertHashToBafyHash(h:string) {
    try {
      let hash=new TextEncoder().encode(h)

      // 2. Multihash encoding (dag-pb codec: 0x70)
      const multihash = Buffer.concat([Buffer.from([0x70, hash.length]), hash]).buffer;


      // 3. Base32 encoding
      const base32Encoded = base32Encode(multihash,"RFC4648",{}).toString()
      const bafyHash = "bafy" + base32Encoded.slice(2).replace(/=+$/, ''); // Add "bafy" prefix and remove padding

      return bafyHash;
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

  async upload(file:File) : Promise<any>{
      const formData = new FormData()
      formData.append("files", file)
      //https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-add
      let r=await this.query("add","pin=true",formData)
      r.bafyHash=await this.convertHashToBafyHash(r.Hash)
      r.hash=r.Hash
      r.alternate_url="https://"+r.bafyHash+".ipfs.dweb.link/?filename="+file.name
      r.url="https://ipfs.io/ipfs/"+r.hash+"?filename="+file.name
      return r
  }

}
