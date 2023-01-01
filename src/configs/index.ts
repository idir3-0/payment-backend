import { Config } from './models';
import * as dotenv from 'dotenv';

dotenv.config();

const environment = process.env.ENVIRONMENT || 'localhost';

const apiKey = process.env.FIREBASE_APIKEY;
const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
const databaseURL = process.env.FIREBASE_DATABASE_URL;
const projectId = process.env.FIREBASE_PROJECT_ID;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.FIREBASE_APP_ID;
const measurementId = process.env.FIREBASE_MEASUREMENT_ID;

const appPort = Number(process.env.SERVER_APP_PORT) || 3000;

const config: Config = {
  base: {
    environment,
  },
  firebase: {
    apiKey,
    authDomain,
    databaseURL,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  },
  server: {
    appPort,
  },
};

export default config;
