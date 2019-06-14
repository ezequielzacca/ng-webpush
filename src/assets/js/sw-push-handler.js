importScripts("https://www.gstatic.com/firebasejs/6.1.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/6.1.1/firebase-messaging.js");
importScripts("https://cdn.jsdelivr.net/npm/idb@3.0.2/build/idb.js");

function registerFirebase(firebaseConfig) {
    console.log("register firebase called");
    const IDB_DATABASE_NAME = "QPUSH_IDB";
    function createDb() {
        idb.openDb(IDB_DATABASE_NAME, 1, function (upgradeDB) {
            var store = upgradeDB.createObjectStore(IDB_DATABASE_NAME, {
                keyPath: "id"
            });
            //store.put({ id: "test", foo: "bar" });
        });
    }
    const dbPromise = idb.openDb(IDB_DATABASE_NAME, 1, upgradeDB => {
        upgradeDB.createObjectStore(IDB_DATABASE_NAME);
    });
    function storePushData(data) {
        dbPromise.then(db => {
            const tx = db.transaction(IDB_DATABASE_NAME, "readwrite");
            tx.objectStore(IDB_DATABASE_NAME).put(data, "push");
            return tx.complete;
        }).catch(ex => {
            console.log("Exception when trying to put data on IDB")
        });
    }
    self.addEventListener("activate", function (event) {
        event.waitUntil(createDb());
        console.log("IDB Created within SW");
    });

    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    self.addEventListener("push", function (event) {

        const data = event.data.json().data;
        const title = data.title;

        const options = {
            body: data.body,
            icon: data.icon,
            //badge: "assets/fcm-logo.png",,
            badge: data.badge,
            data: data
        };
        event.waitUntil(self.registration.showNotification(title, options));
    });

    self.addEventListener("notificationclick", function (event) {
        storePushData(event.notification.data);
        let path = "/";
        event.notification.close();
        event.waitUntil(
            clients
                .matchAll({
                    includeUncontrolled: true,
                    type: "window"
                })
                .then(function (clientList) {
                    for (var i = 0; i < clientList.length; i++) {
                        var client = clientList[i];
                        if ("focus" in client) client.focus();                        
                        return
                    }
                    if (clients.openWindow) {                        
                        return clients.openWindow(path);
                    }
                })
        );
    });

    console.log("All events registered");
}


