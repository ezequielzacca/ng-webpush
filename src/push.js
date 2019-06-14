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