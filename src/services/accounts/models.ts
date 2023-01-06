export const PROFILE_COLLECTION_KEY = 'profiles';
export const BUSINESS_COLLECTION_KEY = 'businesses';

export const Roles = {
  admin: 'admin',
  user: 'user',
  business: 'business',
};

export const RoleCollection = {
  user: PROFILE_COLLECTION_KEY,
  business: BUSINESS_COLLECTION_KEY,
};

export interface UserProfile {
  firstName: string;
  lastName: string;
  address: Address;
  nationalIdFile: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface BusinessProfile {
  displayName: string;
  firstName: string;
  lastName: string;
  description: string;
  logo: string;
  address: Address;
  businessLegal?: BusinessLegal;
  createdAt?: number;
  updatedAt?: number;
}

export interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
}

export interface BusinessLegal {
  tradeRegisterFile: string;
  taxID: string;
}

export interface CreateBusinessRequest {
  businessProfile: BusinessProfile;
}

export interface SetupUserAccountRequest extends UserProfile {
  userId: string;
}

export interface SetupBusinessRequest extends BusinessProfile {
  userId: string;
}

export interface AdminValidateSetupAccountRequest {
  userId: string;
  content?: string;
  status: boolean;
}

export interface UpdateBusinessRequest extends BusinessProfile {
  userId: string;
  isActive: boolean; // If true the user can not update the legal docs
}

export interface UpdateProfileRequest extends UserProfile {
  userId: string;
  isActive: boolean; // If true the user can not update the legal docs
}

export interface GetUserProfileRequest {
  userId: string;
}

export interface GetBusinessRequest {
  userId: string;
}

export interface LoginTestUserRequest {
  email: string;
  password: string;
}

export interface CreateTestUserRequest {
  email: string;
  password: string;
}
