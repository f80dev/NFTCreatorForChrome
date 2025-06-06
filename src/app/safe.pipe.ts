import {inject, Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Pipe({
  standalone: true,
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  sanitizer=inject(DomSanitizer)

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
