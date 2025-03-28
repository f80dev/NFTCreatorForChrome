import {ApplicationConfig, importProvidersFrom, isDevMode} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MainComponent} from "./main/main.component";
import {provideRouter, Routes} from "@angular/router";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {environment} from "../environments/environment";
import {GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule} from "@abacritt/angularx-social-login";

import {provideHttpClient} from "@angular/common/http";
import {provideServiceWorker} from "@angular/service-worker";
import {TestComponent} from "./test/test.component";
import {EditorComponent} from "./editor/editor.component";
import {AboutComponent} from "./about/about.component";
import {ShareformComponent} from "./shareform/shareform.component";

const GOOGLE_CLIENT_ID="794055474370-nj8dfh004epum0h6ne1chq903dr4rofe.apps.googleusercontent.com"

export const routes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'test', component: TestComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'share', component: ShareformComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', component: MainComponent },
];

const config: SocketIoConfig = { url: environment.server, options: {} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync('noop'),provideRouter(routes),
    {provide: MAT_DIALOG_DATA, useValue: {hasBackdrop: false}},
    importProvidersFrom(
      SocketIoModule.forRoot(config),
      SocialLoginModule,
    ),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(GOOGLE_CLIENT_ID),
          }
        ],
      } as SocialAuthServiceConfig
    },

    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })

  ]
};
