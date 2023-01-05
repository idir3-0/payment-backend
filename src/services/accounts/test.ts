import { collection } from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  newUserWithEmailAndPassword,
  userSignInWithEmailAndPassword,
} from 'src/adapters/firebase/users';
import { CreateTestUserRequest, LoginTestUserRequest } from './models';
import { auth } from 'firebase-admin';

export const createTestUser = async (
  createTestUserRequest: CreateTestUserRequest,
) => {
  const user = await newUserWithEmailAndPassword(
    createTestUserRequest.email,
    createTestUserRequest.password,
  );
  return user;
};

export const loginTestUser = async (loginRequest: LoginTestUserRequest) => {
  const user = await userSignInWithEmailAndPassword(
    loginRequest.email,
    loginRequest.password,
  );
  return user;
};
