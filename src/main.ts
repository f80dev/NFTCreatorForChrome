import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {environment} from "./environments/environment";
import {showMessage} from "./tools";
import {cat} from "@helia/unixfs/commands/cat";

(window as any).global = window;

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));


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

  showMessage(vm,"Nothing in the clipboard",1000)
  return ""
}
