import { collection } from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  newUserWithEmailAndPassword,
  userSignInWithEmailAndPassword,
} from 'src/adapters/firebase/users';
import { CreateUserRequest, LoginUserRequest } from 'src/types/account';

export const createUser = async (createRequest: CreateUserRequest) => {
  await newUserWithEmailAndPassword(
    createRequest.email,
    createRequest.password,
  );
  return {};
};

export const loginUser = async (loginRequest: LoginUserRequest) => {
  const user = await userSignInWithEmailAndPassword(
    loginRequest.email,
    loginRequest.password,
  );
  return user;
};
