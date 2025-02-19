import {Injectable, OnInit} from '@angular/core';
import {create, IPFSHTTPClient} from 'ipfs-http-client'

//const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

@Injectable({
  providedIn: 'root'
})

//IPFS_SERVER="/ip4/173.249.41.158/tcp/"+str(IPFS_PORT)+"/http"
export class UploaderService implements OnInit{
  private client: IPFSHTTPClient | undefined;

  ngOnInit(): void {
      this.client= create({
        host: '173.249.41.158',
        port: 5001,
        protocol: 'https',
        headers: {}
      })
  }


  async upload_file(content:string){
    if(this.client){
      return await this.client.add(content)
    }else{
      return null
    }

  }


}
