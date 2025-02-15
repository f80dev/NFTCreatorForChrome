///<reference types="chrome"/>
//voir https://stackoverflow.com/questions/53169721/how-to-use-chrome-extension-api-with-angular

import {inject, Injectable, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class ChromeExtensionService implements OnInit {
  listener: any;
  message=new Subject()

  ngOnInit(): void {
    this.listener = (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (request.message) {
        this.message.next(request.message.url)

        // Optional: Send a response back to the background script
        sendResponse({ response: "Message received in popup!" });
      }
      return true; // Important: Indicate asynchronous response handling
    };
    chrome.runtime.onMessage.addListener(this.listener);

    window.addEventListener('message', event => { // For messages sent directly to the popup window
      this.message.next(event.data)
    });
  }








  get_url(simulation = ""): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        let tabs = await chrome.tabs.query({active: true, currentWindow: true})
        if (tabs.length > 0 && tabs[0] && tabs[0].url) {
          resolve(tabs[0].url)
        } else {
          reject()
        }
      } catch (e) {
        if (simulation.length > 0) {
          resolve(simulation)
        } else {
          reject()
        }
      }
    })
  }






  extract_img(simulation = ""): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let tabs: any = await chrome.tabs.query({active: true, currentWindow: true})
        let results = await chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          func : ()=>{
            console.log("title="+document.title)
            const imageElements = document.querySelectorAll('img');
            const imageUrls:string[] = []; // Use a Set to avoid duplicates

            imageElements.forEach(img => {
              // Handle different ways image URLs might be stored
              const src = img.getAttribute('src');
              const srcset = img.getAttribute('srcset');
              const dataSrc = img.getAttribute('data-src'); // Common for lazy loading
              const style = img.style.backgroundImage; // For background images

              if (src) {
                imageUrls.push(src);
              }

              if (srcset) {
                // srcset can contain multiple URLs. Split them and add them individually
                srcset.split(',').forEach(source => {
                  const url = source.trim().split(' ')[0]; // Get the URL part
                  if (url) {
                    imageUrls.push(url);
                  }
                });
              }

              if (dataSrc) {
                imageUrls.push(dataSrc);
              }

              if (style && style !== "none") { // Check if a background image is set
                const urlMatch = style.match(/url\(['"]?([^'"]*)['"]?\)/); // Extract url from url(...)
                if (urlMatch && urlMatch[1]) {
                  imageUrls.push(urlMatch[1]);
                }
              }
            });

            return(imageUrls)
          }
        })
        debugger
        let rc: any[]=[]

        for (let result of results) {
          rc.push(result.documentId)
        }
        resolve(rc)
      } catch (e) {
        reject(e)
      }
    })
  }



  async get_local(key: string,_default="") : Promise<string> {
    return new Promise<any>((resolve) => {
      if(chrome && chrome.storage) {
        chrome.storage.local.get(key, (item: any) => {
          resolve(item[key] || _default)
        })
      }else{
        resolve(localStorage.getItem(key) || _default)
      }
    })
  }


  set_local(key:string,value:any){
    return new Promise<boolean>(async (resolve) => {
      if(chrome && chrome.storage){
        let obj=JSON.parse(await this.get_local(key,"{}"))
        obj[key]=value
        chrome.storage.local.set(obj, ()=>{
        resolve(true)
        });
      }else{
        localStorage.setItem(key,value)
        resolve(true)
      }
    })
  }


}
