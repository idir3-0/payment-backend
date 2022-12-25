import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import admin from 'firebase-admin';

import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from 'firebase/firestore';
import config from 'src/configs';

let firebaseApp: FirebaseApp;
let firebaseEmulatorAuth: Auth;
let firebaseDatabase: Firestore;

const initFirebase = () => {
  admin.initializeApp({
    projectId: config.firebase.projectId,
  });

  if (config.base.environment !== 'localhost') {
    firebaseApp = initializeApp({
      apiKey: config.firebase.apiKey,
      authDomain: config.firebase.authDomain,
      databaseURL: config.firebase.databaseURL,
      projectId: config.firebase.projectId,
      storageBucket: config.firebase.storageBucket,
      messagingSenderId: config.firebase.messagingSenderId,
      appId: config.firebase.appId,
      measurementId: config.firebase.measurementId,
    });
    firebaseDatabase = getFirestore(firebaseApp);
  } else {
    firebaseApp = initializeApp({
      projectId: 'payment-backend',
      apiKey: 'fake-api-key',
    });
    firebaseDatabase = getFirestore(firebaseApp);
    connectFirestoreEmulator(firebaseDatabase, 'firebase', 8080);

    firebaseEmulatorAuth = getAuth();
    connectAuthEmulator(firebaseEmulatorAuth, 'http://firebase:9099');
  }
};

export { initFirebase, firebaseApp, firebaseDatabase, firebaseEmulatorAuth };
