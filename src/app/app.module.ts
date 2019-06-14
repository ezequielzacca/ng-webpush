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
      apiKey: "api-key",
      authDomain: "project-id.firebaseapp.com",
      databaseURL: "https://project-id.firebaseio.com",
      projectId: "project-id",
      storageBucket: "project-id.appspot.com",
      messagingSenderId: "sender-id",
      appID: "app-id",
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
