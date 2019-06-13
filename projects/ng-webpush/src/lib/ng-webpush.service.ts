
import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject, fromEvent, Observable, merge, of } from 'rxjs';
import { openDb } from "idb";
import { FIREBASE_CONFIG_DI_TOKEN } from './di/di-tokens';

const IDB_DATABASE_NAME = "QPUSH_IDB";
declare var firebase: any;

@Injectable({
  providedIn: 'root'
})
export class NgWebPushService {

  private renderer2: Renderer2;

  push: Subject<any> = new Subject();
  token: Subject<string> = new Subject<string>();
  focusEvent$: Observable<any> = fromEvent(window, "focus");

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private _document,
    @Inject(FIREBASE_CONFIG_DI_TOKEN) private firebaseConfig
  ) {
    this.renderer2 = rendererFactory.createRenderer(null, null);
    this.initialize();
  }

  initialize() {
    this.injectScript("https://www.gstatic.com/firebasejs/6.1.1/firebase-app.js").then(() => {
      this.injectScript("https://www.gstatic.com/firebasejs/6.1.1/firebase-messaging.js").then(() => {
        this.startFCM();
        merge(this.focusEvent$,
          of(1)).subscribe(() => {
            this.readPushNotification().then(notification => {
              if (notification) {
                this.clearIDB().then(() => {
                  this.push.next(notification);
                });
              }
            });
          });
      });
    });
  }


  readPushNotification(): Promise<any> {
    return new Promise((resolve, reject) => {
      const dbPromise = openDb(IDB_DATABASE_NAME, 1, upgradeDB => {
        upgradeDB.createObjectStore(IDB_DATABASE_NAME);
      });
      dbPromise.then(db => {
        const tx = db.transaction(IDB_DATABASE_NAME, "readwrite");
        tx.objectStore(IDB_DATABASE_NAME)
          .get("push").then(data => {
            return resolve(data)
          })
      });
    })
  }

  clearIDB(): Promise<any> {
    return new Promise((resolve, reject) => {
      const dbPromise = openDb(IDB_DATABASE_NAME, 1, upgradeDB => {
        upgradeDB.createObjectStore(IDB_DATABASE_NAME);
      });
      dbPromise.then(db => {
        db.transaction(IDB_DATABASE_NAME, "readwrite").objectStore(IDB_DATABASE_NAME).delete("push").then(() => {
          resolve();
        });
      });
    })
  }


  injectScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const s = this.renderer2.createElement('script');
      s.onload = setTimeout(() => {
        resolve();
      }, 50);
      s.type = 'text/javascript';
      s.src = url;
      s.text = ``;
      this.renderer2.appendChild(this._document.body, s);
    })
  }

  startFCM() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(registration => {
          registration.update();
          console.log(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );
          firebase.initializeApp(this.firebaseConfig);
          const messaging = firebase.messaging();
          messaging.useServiceWorker(registration);
          messaging
            .requestPermission()
            .then(() => {
              return messaging.getToken();
            })
            .then((token: string) => {
              this.token.next(token);
            })
            .catch(err => {
              console.log("Error when retrieving token", err);
            });
        })
        .catch(err => {
          console.log("ServiceWorker registration failed: ", err);
        });
    }
  }
}
