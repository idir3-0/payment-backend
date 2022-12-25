import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { firebaseEmulatorAuth } from 'src/adapters/firebase/firebase';

export const newUserWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  const credentials = await createUserWithEmailAndPassword(
    firebaseEmulatorAuth,
    email,
    password,
  );
  return credentials.user;
};

export const userSignInWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  const credentials = await signInWithEmailAndPassword(
    firebaseEmulatorAuth,
    email,
    password,
  );
  return credentials.user;
};
