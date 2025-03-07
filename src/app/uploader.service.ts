import {inject, Injectable, OnInit} from '@angular/core';

import {HttpClient, HttpHeaders} from "@angular/common/http";
import {$$} from "../tools";
import {base32} from "multiformats/bases/base32";
import {sha256} from "multiformats/hashes/sha2";
import {CID} from "multiformats";
import {firstValueFrom} from "rxjs";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})


//IPFS_SERVER="/ip4/173.249.41.158/tcp/"+str(IPFS_PORT)+"/http"
export class UploaderService implements OnInit {
  http=inject(HttpClient)
  endpoint="https://ipfs.f80.fr:5001/api/v0/"
  service="ipfs"
  pinata:any


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



  b64_to_blob(content:string,contentType="image/webp") : Blob {
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

  b64_to_file(content:string,filename:string="image.webp",contentType="image/webp") : File {
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

  protected async upload_file(data:FormData,version=1,filename="") {
    let r=await this.query("add","cid-version="+version,data)
    $$("Result from add ",r)
    r.hash=r.Hash
    $$("IPFS scan : https://ipfs-scan.io/?cid="+r.hash)
    if(version==1){
      r.old="https://ipfs.io/ipfs/"+r.Hash+(filename=='' ? '' : "?filename="+filename)
      r.url="https://"+r.Hash+".ipfs.dweb.link" +(filename=='' ? '' : "?filename="+filename)
    }else{
      r.url="https://ipfs.io/ipfs/"+r.Hash+(filename=='' ? '' : "?filename="+filename)
      r.old=r.url
    }
    return r
  }



  async upload(blob:Blob,filename="img.webp",version=1) : Promise<any>{
    const formData = new FormData()
    formData.append("file", blob,filename)
    $$("upload du fichier ",formData)
    $$("taille du fichier "+blob.size)

    if(this.service=="pinata"){
      return this.upload_b64_with_pinata(await blob.text())
    }else{
      return this.upload_file(formData,version,filename)
    }
    //https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-add
  }


  ngOnInit(): void {
    // this.pinata =new PinataSDK({
    //   pinataJwt: environment.PINATA_JWT,
    //   pinataGateway:environment.PINATA_GATEWAY_URL
    // })
  }

  async list_files_with_pinata(){
    return await this.pinata?.listFiles()
  }



  async upload_file_with_pinata(file: File) {
    return await this.pinata?.upload.file(file)
  }

  async upload_b64_with_pinata(b64content: string) {
    return await this.pinata?.upload.base64(b64content)
  }
}
