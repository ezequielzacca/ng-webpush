import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgWebPushModule } from 'ng-webpush';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgWebPushModule.forRoot({
      apiKey: "AIzaSyDFSX53LTDBPM-SO4kINDMjAy9R1MB2GWE",
      authDomain: "pwa-web-push-d10c0.firebaseapp.com",
      databaseURL: "https://pwa-web-push-d10c0.firebaseio.com",
      projectId: "pwa-web-push-d10c0",
      storageBucket: "pwa-web-push-d10c0.appspot.com",
      messagingSenderId: "616309193945",
      appId: "1:616309193945:web:693c3fd03e4b251c"
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
