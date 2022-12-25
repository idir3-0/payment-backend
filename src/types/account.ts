export type Roles = 'user' | 'admin';

// User
export interface Address {
  street1: string;
  street2: string;
  city: string;
  zip: string;
}

export interface UserInfo {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: Address;
  billingAddress?: Address;
  isActive: boolean;
  createdAt: Number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface UpdateUserInfoRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: Address;
  billingAddress?: Address;
}

// Business
export interface BusinessInfo {
  name: string;
  logo: string;
  description: string;
  website: string;
  identityCardId: string;
  incomeTaxId: string;
  businessRegisterId: string;
  address: Address;
  isActive: boolean;
  createdAt: Number;
  updatedAt: Number;
}

export interface CreateBusinessRequest {
  name: string;
  logo: string;
  description: string;
  website: string;
  identityCardId: string;
  incomeTaxId: string;
  businessRegisterId: string;
}

export interface UpdateBusinessRequest {
  name: string;
  logo: string;
  description: string;
  website: string;
  identityCardId: string;
  incomeTaxId: string;
  businessRegisterId: string;
}

// Account
export interface UserAccount {
  user: UserInfo;
  businessInfo?: BusinessInfo;
}
