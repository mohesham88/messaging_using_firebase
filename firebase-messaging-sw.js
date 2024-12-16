
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyCBDbmBIB3x9v8RAmJJ8fut65j1BHmCets",
    authDomain: "labtask2-cb64c.firebaseapp.com",
    databaseURL: "https://labtask2-cb64c-default-rtdb.firebaseio.com/",
    projectId: "labtask2-cb64c",
    storageBucket: "labtask2-cb64c.firebasestorage.app",
    messagingSenderId: "230466244503",
    appId: "1:230466244503:web:b99864da1301b2b601bed2"
};
firebase.initializeApp(firebaseConfig);
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message ',
      payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: 'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png',
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
// handle foreground messages
messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    // ...
  });
  