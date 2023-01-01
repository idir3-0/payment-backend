export interface Config {
  base: Base;
  firebase: Firebase;
  server: Server;
}

interface Base {
  environment: string;
}

interface Firebase {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

interface Server {
  appPort: number;
}
