# NgWebPush

Handle FCM push notifications like a champ with ng-webpush

## Features

With NgWebPush your app will be able to

- Handle incoming notifications while the app is openend and the user is interacting with it.
- Handle notifications while the app is opened in foreground or while the user is interacting with another browser tab.
- Handle incoming notifications when the app is closed. In this case, this library will open the app and then react to the notification.

It works both for `mobile` and `desktop` devices.

Unfortunately, and because IOS does not supporting the Web Push Standard yet, NgWebPush doesn't work on IOS. Hopefully it will work soon, when Apple adopts this standard.

## Goal

The goal of this library is to deliver the push notification functionality to any angular PWA in a fast and reliable way.

Enabling support for push notifications involves several steps.

## Getting started

As a first step, in order to send and receive push notifications with Firebase, you need to create a Firebase project and get the project configuration object:

- Sign in to Firebase, then open your project.
- Click the Settings icon, then select Project settings.
- In the bottom section of the General tab, you will see your config object wich looks like this:

```typescript
var firebaseConfig = {
  apiKey: "api-key",
  authDomain: "project-id.firebaseapp.com",
  databaseURL: "https://project-id.firebaseio.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "sender-id",
  appID: "app-id",
};
```

In order to receive push notifications, you need to create a Service Worker. We suggest using `sw-precache` since it's very easy to setup.

To add `sw-precache` to your app, run the following command:

```npm install --save-dev sw-precache```

Once installed, you need to create a file called `sw-precache-config.js` at your root folder with the following content:

```typescript
module.exports = {
    root: "dist/{{name of your project}}",
    stripPrefix: "dist/{{name of your project}}",
    navigateFallback: "/index.html",
    importScripts: ["push.js"]
  };
  ```

Then you need to create a file called `push.js` inside your `src` folder. This file will call the Service Worker service provided by NgWebPush. This service contains all the Service Worker related logic for handling and displaying push notification while your app is on the foreground or while it's closed. Add the following content to your `push.js` (remember to use your firebase config values):

```typescript
importScripts("https://cdn.jsdelivr.net/gh/ezequielzacca/ng-webpush/src/assets/js/sw-push-handler.js");

registerFirebase({
  apiKey: "api-key",
  authDomain: "project-id.firebaseapp.com",
  databaseURL: "https://project-id.firebaseio.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "sender-id",
  appID: "app-id",
});
```

The next step is to add `push.js` to your Angular project assets in the `angular.json` file:

```typescript
    "polyfills": "src/polyfills.ts",
    "tsConfig": "tsconfig.app.json",
    "assets": [
        "src/favicon.ico",
        "src/assets",
        "src/push.js" <-------- add it here
    ],
    "styles": [
    "src/styles.sass"
    ],
    "scripts": []
```

And you are done with the service worker setup!

Now to the funny part: let's add NgWebPush to you Angular app. To do so, you need to import `NgWebPushModule` in you `AppModule`:

```typescript
...
import { NgWebPushModule } from 'ng-webpush';
...

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
    ...
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

And finally, in your `AppComponent` (or any other component in your app), inject the `NgWebPushService`:

```typescript
import { Component, OnInit } from '@angular/core';
import { NgWebPushService } from 'ng-webpush';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'pwa-web-push';
  
  constructor(private qp: NgWebPushService) { }
}
```

## API

The `NgWebPusService` provides two observables wich will emit:

- FCM Token for sending it to your backend and receive the FCM Notifications

- Notifications received

```typescript
import { Component, OnInit } from '@angular/core';
import { NgWebPushService } from 'ng-webpush';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'pwa-web-push';
  
  constructor(private qp: NgWebPushService) { }

  ngOnInit() {
    this.qp.token.subscribe(token => {
      console.log("FCM TOKEN: ", token);
    })

    this.qp.push.subscribe(push => {
      console.log("PUSH RECEIVED: ",push);
    })
  }
}
```

## How to test

In order to test the app, you cannot simply use `ng serve` since you need to generate the Service Worker and make your browser register it first. I suggest you to install `live-server` wich provides a lightweight http server

```npm install --global live-server```

Then for the sake of simplicity, you can edit your `package.json` and add the following scripts. Be sure to replace `{name of your project}` with the actual name of your Angular project:

```typescript
"scripts": {
    "ng": "ng",
    "start": "ng serve",
    ...
    "precache": "sw-precache --verbose --config=sw-precache-config.js",
    "sw": "ng build --prod --configuration=production --aot --build-optimizer && npm run precache && npm run live-server",
    "live-server": "cd dist/{name of your project} && live-server --port=8282 --host=localhost --entry-file=/index.html"
  }
  ```

Then, to test the Service Worker and the push notifications feature you can run the command:

`npm run sw`

## Backendless

¿What if you don't have a backend yet to send the notifications?

Don't worry, you can always use Postman or a simple CURL. To do so, you will need the FCM server token. You will find it at your Firebase project settings, inside the FCM tab, listed as Server Key.

```
curl -X POST \
  https://fcm.googleapis.com/fcm/send \
  -H 'Accept: */*' \
  -H 'Authorization: key={Server Key Here}' \
  -H 'Content-Type: application/json' \
  -d '{
 "to" : "{FCM Token of Device Here}",
 "data" : {
     "body" : "Body of Your Notification",
     "title": "Title of Your Notification",
     "data_1" : "Custom Data Value",
     "another_piece_of_data": {
     	"foo":"bar"
     },
     "badge" : "assets/push-logo.png",
     "icon" : "assets/push-logo.png"
 }
}'
```

Enjoy!