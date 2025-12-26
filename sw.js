importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCRrDkB60_vP9CdjhY_hUV-3LG9cyg4-aE",
  authDomain: "prf-db070.firebaseapp.com",
  projectId: "prf-db070",
  messagingSenderId: "589213187688",
  appId: "1:589213187688:web:2ee079b2306c1fd97a45dd",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(
    payload.notification.title,
    { body: payload.notification.body }
  );
});