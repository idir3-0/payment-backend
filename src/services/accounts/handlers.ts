import { Request, Response } from 'express';
import { createTestUser, loginTestUser } from './test';
import {
  AdminValidateSetupAccountRequest,
  CreateTestUserRequest,
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

export const setupUserAccountHandler = async (req: Request, res: Response) => {
  const setupUserAccountRequest: SetupUserAccountRequest = {
    userProfile: {
      address: req.body.userProfile.address,
      firstName: req.body.userProfile.firstName,
      lastName: req.body.userProfile.lastName,
      nationalIdFile: req.body.userProfile.lastName,
    },
  };
  const { error, data } = await setupUserAccount(
    setupUserAccountRequest,
    req.user.user_id,
  );
  responseHandler(res, data, 201, error, errorHandler);
};

export const getUserProfileHandler = async (req: Request, res: Response) => {
  const { error, data } = await getUserProfile(req.user.user_id);
  responseHandler(res, data, 200, error, errorHandler);
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  const updateProfileRequest: UpdateProfileRequest = {
    isActive: req.user?.acv,
    address: req.body.userProfile.address,
    firstName: req.body.userProfile.firstName,
    lastName: req.body.userProfile.lastName,
    nationalIdFile: req.body.userProfile.nationalIdFile,
  };
  const { error, data } = await updateProfile(
    updateProfileRequest,
    req.user.user_id,
  );
  responseHandler(res, data, 200, error, errorHandler);
};

export const setupBusinessAccountHandler = async (
  req: Request,
  res: Response,
) => {
  const setupBusinessRequest: SetupBusinessRequest = {
    businessProfile: {
      address: req.body.businessProfile.address,
      firstName: req.body.businessProfile.firstName,
      lastName: req.body.businessProfile.lastName,
      description: req.body.businessProfile.description,
      displayName: req.body.businessProfile.displayName,
      logo: req.body.businessProfile.logo,
      businessLegal: req.body.businessProfile.businessLegal,
    },
  };
  const { error, data } = await setupBusinessAccount(
    setupBusinessRequest,
    req.user.user_id,
  );
  responseHandler(res, data, 204, error, errorHandler);
};

export const getBusinessHandler = async (req: Request, res: Response) => {
  const { error, data } = await getBusiness(req.user.user_id);
  responseHandler(res, data, 200, error, errorHandler);
};

export const updateBusinessHandler = async (req: Request, res: Response) => {
  const updateBusinessRequest: UpdateBusinessRequest = {
    isActive: req.user?.acv,
    address: req.body.businessProfile.address,
    firstName: req.body.businessProfile.firstName,
    lastName: req.body.businessProfile.lastName,
    description: req.body.businessProfile.description,
    displayName: req.body.businessProfile.displayName,
    logo: req.body.businessProfile.logo,
    businessLegal: req.body.businessProfile.businessLegal,
  };
  const { error, data } = await updateBusiness(
    updateBusinessRequest,
    req.user.user_id,
  );
  responseHandler(res, data, 200, error, errorHandler);
};

export const adminValidateAccountHandler = async (
  req: Request,
  res: Response,
) => {
  const adminValidateSetupAccountRequest: AdminValidateSetupAccountRequest = {
    status: req.body.status,
    uid: req.body.uid,
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
