import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MainComponent} from "./main/main.component";
import {provideRouter, Routes} from "@angular/router";


export const routes: Routes = [
  { path: '**', component: MainComponent },
];

export const appConfig: ApplicationConfig = {
  providers: [provideAnimationsAsync('noop'),provideRouter(routes)]
};
