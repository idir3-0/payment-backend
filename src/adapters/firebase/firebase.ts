import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from 'firebase/firestore';
import config from 'src/configs';

let firebaseApp: FirebaseApp;
let firestoreDatabase: Firestore;

const initFirebase = () => {
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
    firestoreDatabase = getFirestore(firebaseApp);
  } else {
    firebaseApp = initializeApp({ projectId: 'payment-backend' });
    firestoreDatabase = getFirestore(firebaseApp);
    connectFirestoreEmulator(firestoreDatabase, 'firebase', 8080);
  }
};

export { initFirebase, firebaseApp, firestoreDatabase };
