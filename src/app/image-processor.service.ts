import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {firstValueFrom, Observable} from "rxjs";
import {Image} from "image-js"
import {fromArrayLike} from "rxjs/internal/observable/innerFrom";

@Injectable({
  providedIn: 'root'
})
export class ImageProcessorService {

  http=inject(HttpClient)

  fetchImageAsBlob(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { responseType: 'blob' });
  }


  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }



  async getBase64FromUrl(url: string): Promise<string> {
    let url_temp="https://api.allorigins.win/get?url="+encodeURIComponent(url)
    const rc:any = await firstValueFrom(this.http.get(url_temp,{responseType:'json'}))
    return rc.contents
  }



  async createImageFromBase64(base64: string,x=0,y=0,lx=0,ly=0) {
    //voir https://image-js.github.io/image-js/#image
    let rc= await Image.load(base64)
    if(lx>0 && ly>0){
      return rc.crop({x:x,y:y,width:lx,height:ly})
    }else{
      return rc;
    }
  }


  createBlobFromBase64(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab]);
  }


}
