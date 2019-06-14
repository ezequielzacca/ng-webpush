# NgWebPush

Handle FCM push notifications like a champ with ng-webpush

## Features

With NgWebPush your app will be able to

- Handle notifications when they are received while the app is openend and being interacted with
- Handle notifications while the app is opened in foreground or while interacting with another browser tab
- Open the app and then react to push notification if received while the app is closed

It works both for `mobile` and `desktop`

Unfortunately and due to IOS currently not supporting the Web Push Standard, it doesn't work on IOS, but hopefully it will work soon

## Goal

The goal of this library is to deliver push notification functionality to any angular PWA in a fast and reliable way

The support of push notifications involve several steps

## Getting started

As a first step, in order to send and receive push notifications with firebase, you need to create a firebase project and get  the project configuration object:

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

In order to receive push notifications, you need to create a serviceworker. We suggest using `sw-precache` since its very easy to setup.

Run the following command to add `sw-precache` to your app

```npm install --save-dev sw-precache```

Once installed you need to create a file called `sw-precache-config.js` in your root folder with the following content:

```typescript
module.exports = {
    root: "dist/{{name of your project}}",
    stripPrefix: "dist/{{name of your project}}",
    navigateFallback: "/index.html",
    importScripts: ["push.js"]
  };
  ```

Then you need to create a file called `push.js` inside your `src` folder wich will call the serviceworker service provided by NgWebPush that provides all the serviceworker related logic for handling and displaying push notification while your app is on the foreground or while its closed, inside `push.js` add the following content (remember to use your firebase config values):

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

The next step is to add `push.js` to your angular project assets in the `angular.json` file:

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

And you are done with the service worker setup!!

Now to the funny part, adding NgWebPush to you Angular app, to do so you need to import `NgWebPushModule` in you `AppModule`:

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

And finally in your `AppComponent` (or any other component in your app) you inject the `NgWebPushService`:

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

In order to test the app you cannot simply use `ng serve` since you need to generate the serviceworker and make your browser register it, so i suggest you to install `live-server` wich provides a lightweight http server

```npm install --global live-server```

Then for the sake of simplicity you can edit your `package.json` and add the following scripts replacing `{name of your project}` with the actual name of your Angular project

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

Then to test the service worker and push notifications feature you can run the command:

`npm run sw`

## Backendless

¿What if you dont have a backend yet to send the notifications?

Dont worry, you can always use postman or a simple CURL to do so, you will need the FCM server token to do so, you can get it inside the Settings of your project, in the FCM tab, its listed as Server Key.

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








