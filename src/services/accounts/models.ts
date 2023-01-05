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

export const AccoutValidationStatus = {
  in_review: 'in_review',
  request_update: 'request_update',
  active: 'active',
  blocked: 'blocked',
};

export interface LoginTestUserRequest {
  email: string;
  password: string;
}

export interface CreateTestUserRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  address: Address;
  nationalIdFile?: string;
}

export interface BusinessProfile {
  displayName: string;
  firstName: string;
  lastName: string;
  description: string;
  logo: string;
  address: Address;
  businessLegal?: BusinessLegal;
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

export interface SetupUserAccountRequest {
  userProfile: UserProfile;
}

export interface SetupBusinessRequest {
  businessProfile: BusinessProfile;
}

export interface AdminValidateSetupAccountRequest {
  uid: string;
  content?: string;
  status: boolean;
}

export interface UpdateBusinessRequest extends BusinessProfile {
  isActive: boolean; // If true the user can not update the legal docs
}

export interface UpdateProfileRequest extends UserProfile {
  isActive: boolean; // If true the user can not update the legal docs
}
