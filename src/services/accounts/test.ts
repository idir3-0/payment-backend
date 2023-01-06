import {
  newUserWithEmailAndPassword,
  userSignInWithEmailAndPassword,
} from 'src/adapters/firebase/users';
import { CreateTestUserRequest, LoginTestUserRequest } from './models';

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
