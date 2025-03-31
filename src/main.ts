import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {environment} from "./environments/environment";
import {showMessage} from "./tools";

(window as any).global = window;

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));



export async function checkImageURL(url:string) {
  try {
    const response = await fetch(url, { method: 'HEAD' }); // HEAD request is faster

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        return { ok: true, message: 'Image URL is valid.' };
      } else {
        return { ok: false, message: 'URL is not an image.' };
      }
    } else {
      return { ok: false, message: `URL returned status: ${response.status}` };
    }
  } catch (error:any) {
    return { ok: false, message: `Error checking URL: ${error.message}` };
  }
}


export function url_shorter(url_to_short:string) : Promise<string> {
  return new Promise(async (resolve, reject) => {
    let url="https://is.gd/create.php?format=json&url="+encodeURIComponent(url_to_short)
    let r=await fetch(url,{mode:'cors'});
    let resp:any=await r.json()
    resolve(resp.shorturl);
  })
}



export async function analyse_clipboard(vm:any,share_appli=environment.share_appli,force=false) {
  try{
    let obj:any={name:'clipboard-read'}
    if(force || (await navigator.permissions.query(obj)).state === 'granted' ){
      let content=await vm.clipboard.paste()
      if(content.length>0 && !content.endsWith("html") && !content.endsWith("htm") && !content.startsWith(share_appli)){
        if(content.startsWith("http")){
          // const response = await this..get(content, {method: 'HEAD'});
          // if(response && response.headers.get('content-type')!.startsWith("image")){
          return content
        }else{
          if(content.startsWith("data:"))return content
        }
      }

    }

  }catch(e:any){

  }

  if(force)showMessage(vm,"Nothing in the clipboard",1000)
  return ""
}
