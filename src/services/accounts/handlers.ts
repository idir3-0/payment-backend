import { Request, Response } from 'express';
import { createTestUser, loginTestUser } from './test';
import {
  AdminValidateAccountRequest,
  CreateTestUserRequest,
  GetBusinessParams,
  GetUserProfileParams,
  LoginTestUserRequest,
  CreateBusinessRequest,
  CreateUserAccountRequest,
  UpdateBusinessRequest,
  UpdateProfileRequest,
  CreateUserAccountParams,
  UpdateProfileParams,
  CreateBusinessParams,
  UpdateBusinessParams,
} from 'payment-types';
import {
  createUserAccount,
  createBusinessAccount,
  getUserProfile,
  getBusiness,
  adminValidateAccount,
  updateBusiness,
  updateProfile,
} from './controllers';
import { responseHandler } from 'src/utils/response';
import { errorHandler } from './errors';
import { Timestamp } from 'firebase/firestore';

export const createUserAccountHandler = async (req: Request, res: Response) => {
  const _createdAt = Timestamp.now().seconds;
  const createUserAccountRequest: CreateUserAccountRequest = {
    address: req.body.address,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    nationalIdURL: req.body.nationalIdURL,
  };

  const createUserAccountParams: CreateUserAccountParams = {
    ...createUserAccountRequest,
    _userId: req.user.user_id,
    _createdAt,
    _updatedAt: _createdAt,
  };

  const { data, error } = await createUserAccount(createUserAccountParams);
  responseHandler(res, data, 201, error, errorHandler);
};

export const getUserProfileHandler = async (req: Request, res: Response) => {
  const getUserProfileParams: GetUserProfileParams = {
    _userId: req.user.user_id,
  };
  const { error, data } = await getUserProfile(getUserProfileParams);
  responseHandler(res, data, 200, error, errorHandler);
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  const updateProfileRequest: UpdateProfileRequest = {
    address: req.body.address,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    nationalIdURL: req.body.nationalIdURL,
  };

  const updateProfileParams: UpdateProfileParams = {
    ...updateProfileRequest,
    _canUpdateLegalFiles: req.user?.acv,
    _userId: req.user.user_id,
  };
  const { error, data } = await updateProfile(updateProfileParams);
  responseHandler(res, data, 200, error, errorHandler);
};

export const createBusinessAccountHandler = async (
  req: Request,
  res: Response,
) => {
  const _createdAt = Timestamp.now().seconds;

  const createBusinessRequest: CreateBusinessRequest = {
    displayName: req.body.displayName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    description: req.body.description,
    address: req.body.address,
    logo: req.body.logo,
    businessLegal: req.body.businessLegal,
  };

  const createBusinessParams: CreateBusinessParams = {
    ...createBusinessRequest,
    _createdAt,
    _updatedAt: _createdAt,
    _userId: req.user.user_id,
  };

  const { error, data } = await createBusinessAccount(createBusinessParams);
  responseHandler(res, data, 204, error, errorHandler);
};

export const getBusinessHandler = async (req: Request, res: Response) => {
  const getBusinessParams: GetBusinessParams = {
    _userId: req.user.user_id,
  };
  const { error, data } = await getBusiness(getBusinessParams);
  responseHandler(res, data, 200, error, errorHandler);
};

export const updateBusinessHandler = async (req: Request, res: Response) => {
  const updateBusinessRequest: UpdateBusinessRequest = {
    address: req.body.address,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    description: req.body.description,
    displayName: req.body.displayName,
    logo: req.body.logo,
    businessLegal: req.body.businessLegal,
  };

  const updateBusinessParams: UpdateBusinessParams = {
    ...updateBusinessRequest,
    _canUpdateLegalFiles: req.user?.acv,
    _userId: req.user.user_id,
  };

  const { error, data } = await updateBusiness(updateBusinessParams);
  responseHandler(res, data, 200, error, errorHandler);
};

export const adminValidateAccountHandler = async (
  req: Request,
  res: Response,
) => {
  const adminValidateAccountRequest: AdminValidateAccountRequest = {
    userId: req.body.uid,
    status: req.body.status,
    content: req.body.content,
  };

  const { error, data } = await adminValidateAccount(
    adminValidateAccountRequest,
  );
  responseHandler(res, data, 200, error, errorHandler);
};

// TEST
export const testRegisterHandler = async (req: Request, res: Response) => {
  const createRequest = req.body as CreateTestUserRequest;
  if (!createRequest.email || !createRequest.email) {
    res.status(400).json({
      status: true,
      message: 'Invalid input',
    });
  }
  console.log(createRequest);
  const data = await createTestUser(createRequest);
  res.status(200).json({
    status: true,
    data: data.uid,
  });
};

export const testLoginHandler = async (req: Request, res: Response) => {
  const loginRequest = req.body as LoginTestUserRequest;
  const data = await loginTestUser(loginRequest);
  const tokens = data.toJSON()['stsTokenManager'];
  return res.status(200).json({
    status: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
};
