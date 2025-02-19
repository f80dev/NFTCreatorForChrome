import {Injectable, OnInit} from '@angular/core';
import {create, IPFSHTTPClient} from 'ipfs-http-client'
import {HttpHeaders} from "@angular/common/http";

//const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

@Injectable({
  providedIn: 'root'
})

//IPFS_SERVER="/ip4/173.249.41.158/tcp/"+str(IPFS_PORT)+"/http"
export class UploaderService {
  private client: IPFSHTTPClient | undefined;

  async init() {
    let headers=new Headers()
    headers.append('Content-Type', 'application/json');
    //headers.append("authorization","Basic "+btoa("admin:hh4271"))

    this.client= create({
        host: 'ipfs.f80.fr',
        port: 5001,
        protocol: 'https',
        headers: headers
      })
  }


  async upload_file(content:string){

    if(this.client){
      let result= await this.client.add(content)
      debugger
      return result.cid
    }else{
      return null
    }

  }


}
