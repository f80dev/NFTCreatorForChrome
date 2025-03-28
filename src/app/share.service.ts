import {inject, Injectable} from '@angular/core';
import {BrowserService} from "./browser.service";

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  bs=inject(BrowserService)

  async createFileFromImageUrl(imageUrl:string, filename="image.webp", mimeType="image/webp") {
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      return new File([blob], filename, { type: mimeType || blob.type }); // Use provided mimeType or blob's type
    } catch (error) {
      console.error('Error creating File object:', error);
      return null; // Or handle the error as needed
    }
  }


  createFileFromBase64(base64String:string, filename:string, mimeType="image/webp") {
    // Extract the base64 data part (remove the data:mime/type;base64, prefix)
    const base64Data = base64String.split(',')[1];

    // Decode the base64 string to a binary string
    const byteCharacters = atob(base64Data);

    // Create a Uint8Array from the binary string
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    const blob = new Blob(byteArrays, { type: mimeType });

    // Create a File object from the Blob
    return new File([blob], filename, { type: mimeType });
  }

  async share(title:string,text:string,url:string,visual=""){
    let nav=this.bs.getNavigator()
    if(nav){
      let data:any={
        title:title,
        text:text,
        url:url,
      }
      if(visual.length>0){
        data.file=visual.startsWith("https") ? this.createFileFromImageUrl(visual) : this.createFileFromBase64(visual,"image.webp")
      }
      await nav.share(data)
    }
  }
}
