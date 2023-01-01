import { Request, Response } from 'express';
import { createUser, loginUser } from './controllers';
import { CreateUserRequest, LoginUserRequest } from './models';

export const registerHandler = async (req: Request, res: Response) => {
  const createRequest = req.body as CreateUserRequest;
  if (!createRequest.email || !createRequest.email) {
    res.status(400).json({
      status: true,
      message: 'Invalid input',
    });
  }
  console.log(createRequest);
  await createUser(createRequest);

  res.status(200).json({
    status: true,
    data: {},
  });
};

export const loginHandler = async (req: Request, res: Response) => {
  const loginRequest = req.body as LoginUserRequest;
  const data = await loginUser(loginRequest);
  const tokens = data.toJSON()['stsTokenManager'];

  return res.status(200).json({
    status: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
};
