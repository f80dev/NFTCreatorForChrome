import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {firstValueFrom, map, throwError} from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PinataService {

  http=inject(HttpClient)

  api_call(service:string,body:any,contentType:string="") : Promise<{url:string,hash:string}>{
    const url = environment.PINATA_BASE_URL+"pinning/"+service;
    let headers=new HttpHeaders().append('Authorization', `Bearer ${environment.PINATA_JWT}`)
    if(contentType.length>0)headers=headers.append("Content-Type",contentType);
    return firstValueFrom(this.http
      .post(url, body, {headers})
      .pipe(map((response: any) => {
        let rc:{url:string,hash:string}={
          hash:response.IpfsHash,
          url:"https://ipfs.io/ipfs/"+response.IpfsHash
        }
        return rc
      }))
    )
  }



  async uploadJSONToIPFS(obj:{name:string,content:any}) {
    const body = JSON.stringify({
      "pinataOptions": {"cidVersion": 1},
      "pinataMetadata": {"name": obj.name},
      "pinataContent": obj.content
    });
    return await this.api_call("pinJSONToIPFS", body,"application/json");
  };




  uploadFileToIPFS(image: File) {
    if (!image) {return throwError(() => new Error('Image not found'))}

    let formData: any = new FormData();
    formData.append('file', image, image.name);
    formData.append('pinataMetadata', JSON.stringify({name: image.name,}));
    formData.append('pinataOptions',JSON.stringify({cidVersion: 1}));

    return this.api_call("pinFileToIPFS", formData,"");
  };


}

