import { Request, Response } from 'express';
import { createTestUser, loginTestUser } from './test';
import {
  AdminValidateSetupAccountRequest,
  CreateTestUserRequest,
  GetBusinessRequest,
  GetUserProfileRequest,
  LoginTestUserRequest,
  SetupBusinessRequest,
  SetupUserAccountRequest,
  UpdateBusinessRequest,
  UpdateProfileRequest,
} from './models';
import {
  setupUserAccount,
  setupBusinessAccount,
  getUserProfile,
  getBusiness,
  adminValidateAccount,
  updateBusiness,
  updateProfile,
} from './controllers';
import { responseHandler } from 'src/utils/response';
import { errorHandler } from './errors';
import { Timestamp } from 'firebase/firestore';

export const setupUserAccountHandler = async (req: Request, res: Response) => {
  const createdAt = Timestamp.now().seconds;
  const setupUserAccountRequest: SetupUserAccountRequest = {
    userId: req.user.user_id,
    address: req.body.address,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    nationalIdFile: req.body.lastName,
    createdAt,
    updatedAt: createdAt,
  };
  const { error, data } = await setupUserAccount(setupUserAccountRequest);
  responseHandler(res, data, 201, error, errorHandler);
};

export const getUserProfileHandler = async (req: Request, res: Response) => {
  const getUserProfileRequest: GetUserProfileRequest = {
    userId: req.user.user_id,
  };
  const { error, data } = await getUserProfile(getUserProfileRequest);
  responseHandler(res, data, 200, error, errorHandler);
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  const updateProfileRequest: UpdateProfileRequest = {
    userId: req.user.user_id,
    isActive: req.user?.acv,
    address: req.body.address,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    nationalIdFile: req.body.nationalIdFile,
    updatedAt: Timestamp.now().seconds,
  };
  const { error, data } = await updateProfile(updateProfileRequest);
  responseHandler(res, data, 200, error, errorHandler);
};

export const setupBusinessAccountHandler = async (
  req: Request,
  res: Response,
) => {
  const createdAt = Timestamp.now().seconds;

  const setupBusinessRequest: SetupBusinessRequest = {
    userId: req.user.user_id,
    address: req.body.address,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    description: req.body.description,
    displayName: req.body.displayName,
    logo: req.body.logo,
    businessLegal: req.body.businessLegal,
    createdAt,
    updatedAt: createdAt,
  };
  const { error, data } = await setupBusinessAccount(setupBusinessRequest);
  responseHandler(res, data, 204, error, errorHandler);
};

export const getBusinessHandler = async (req: Request, res: Response) => {
  const getBusinessRequest: GetBusinessRequest = {
    userId: req.user.user_id,
  };
  const { error, data } = await getBusiness(getBusinessRequest);
  responseHandler(res, data, 200, error, errorHandler);
};

export const updateBusinessHandler = async (req: Request, res: Response) => {
  const updateBusinessRequest: UpdateBusinessRequest = {
    userId: req.user.user_id,
    isActive: req.user?.acv,
    address: req.body.address,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    description: req.body.description,
    displayName: req.body.displayName,
    logo: req.body.logo,
    businessLegal: req.body.businessLegal,
    updatedAt: Timestamp.now().seconds,
  };
  const { error, data } = await updateBusiness(updateBusinessRequest);
  responseHandler(res, data, 200, error, errorHandler);
};

export const adminValidateAccountHandler = async (
  req: Request,
  res: Response,
) => {
  const adminValidateSetupAccountRequest: AdminValidateSetupAccountRequest = {
    userId: req.body.uid,
    status: req.body.status,
    content: req.body.content,
  };
  const { error, data } = await adminValidateAccount(
    adminValidateSetupAccountRequest,
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
