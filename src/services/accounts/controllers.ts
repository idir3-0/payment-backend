import {
  Transaction,
  doc,
  getDoc,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import {
  PROFILE_COLLECTION_KEY,
  BUSINESS_COLLECTION_KEY,
  RoleCollection,
  GetUserProfileParams,
  GetBusinessParams,
  CreateUserAccountParams,
  UpdateProfileParams,
  CreateBusinessParams,
  UpdateBusinessParams,
  AdminValidateAccountParams,
  Invoice,
  UserProfile,
  BusinessProfile,
} from 'payment-types';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import { auth } from 'firebase-admin';
import {
  ERROR_ACCOUNT_NOT_EXIST,
  ERROR_ACCOUNT_ALREADY_SETUP,
  ERROR_INVALID_USER_DATA,
} from './errors';
import { newNotificationsTx } from 'src/services/notifications/controllers';

export const createUserAccount = async (
  createUserAccountParams: CreateUserAccountParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const {
      address,
      firstName,
      lastName,
      nationalIdURL,
      _userId,
      _createdAt,
      _updatedAt,
    } = createUserAccountParams;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = doc(firebaseDatabase, PROFILE_COLLECTION_KEY, _userId);

      const profileSnap = await tx.get(d);
      const profile = profileSnap.data();
      if (profile) {
        throw ERROR_ACCOUNT_ALREADY_SETUP;
      }

      tx.set(d, {
        _userId,
        firstName,
        lastName,
        address,
        nationalIdURL,
        _createdAt,
        _updatedAt,
      });

      await auth().setCustomUserClaims(_userId, {
        acv: true,
        role: 'user',
      });
    });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const getUserProfile = async (
  getUserProfileParams: GetUserProfileParams,
): Promise<{ data?: UserProfile; error?: Error }> => {
  try {
    const { _userId } = getUserProfileParams;

    const d = doc(firebaseDatabase, PROFILE_COLLECTION_KEY, _userId);
    const profileSnap = await getDoc(d);

    const profile = profileSnap.data() as UserProfile;
    if (!profile) {
      throw ERROR_ACCOUNT_NOT_EXIST;
    }

    return { data: profile };
  } catch (error) {
    return error;
  }
};

export const updateProfile = async (
  updateProfileParams: UpdateProfileParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const {
      address,
      firstName,
      lastName,
      nationalIdURL,
      _canUpdateLegalFiles,
      _userId,
    } = updateProfileParams;

    const d = doc(firebaseDatabase, PROFILE_COLLECTION_KEY, _userId);

    const updateData = {
      firstName,
      lastName,
      address,
    };
    if (!_canUpdateLegalFiles) {
      updateData['nationalIdFile'] = nationalIdURL;
    }

    await setDoc(
      d,
      {
        ...updateData,
      },
      { merge: true },
    );
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const createBusinessAccount = async (
  createBusinessParams: CreateBusinessParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const {
      address,
      description,
      displayName,
      firstName,
      lastName,
      logo,
      businessLegal,
      _userId,
      _createdAt,
      _updatedAt,
    } = createBusinessParams;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = doc(firebaseDatabase, BUSINESS_COLLECTION_KEY, _userId);
      const businessSnap = await tx.get(d);
      const business = businessSnap.data();

      if (business) {
        throw ERROR_ACCOUNT_ALREADY_SETUP;
      }

      tx.set(d, {
        firstName,
        lastName,
        displayName,
        description,
        logo,
        address,
        businessLegal,
        _userId,
        _createdAt,
        _updatedAt,
      });

      await auth().setCustomUserClaims(_userId, {
        acv: true,
        role: 'business',
      });
    });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const getBusiness = async (
  getBusinessParams: GetBusinessParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const { _userId } = getBusinessParams;
    const d = doc(firebaseDatabase, BUSINESS_COLLECTION_KEY, _userId);
    const businessSnap = await getDoc(d);
    const business = businessSnap.data() as BusinessProfile;
    if (!business) {
      throw ERROR_ACCOUNT_NOT_EXIST;
    }
    return { data: business };
  } catch (error) {
    return { error };
  }
};

export const updateBusiness = async (
  updateBusinessParams: UpdateBusinessParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const {
      firstName,
      lastName,
      address,
      description,
      displayName,
      logo,
      businessLegal,
      _canUpdateLegalFiles,
      _userId,
    } = updateBusinessParams;

    const d = doc(firebaseDatabase, BUSINESS_COLLECTION_KEY, _userId);
    const updateData = {
      firstName,
      lastName,
      address,
      description,
      displayName,
      logo,
    };
    if (!_canUpdateLegalFiles) {
      updateData['businessLegal'] = businessLegal;
    }
    await setDoc(d, updateData, { merge: true });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const adminValidateAccount = async (
  adminValidateAccountParams: AdminValidateAccountParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const { status, userId, content } = adminValidateAccountParams;
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const user = await auth().getUser(userId);
      const colName = RoleCollection[user.customClaims.role];
      if (!colName) {
        throw ERROR_INVALID_USER_DATA;
      }
      const d = doc(firebaseDatabase, colName, userId);

      tx.set(
        d,
        {
          error: status ? '' : content,
        },
        { merge: true },
      );

      await newNotificationsTx(tx, {
        userIdinBox: userId,
        collection: colName,
        path: [],
        refId: userId,
        action: 'account validated',
      });

      if (status) {
        await auth().setCustomUserClaims(userId, {
          role: user.customClaims.role,
        });
      }
    });

    return { data: {} };
  } catch (error) {
    return { error };
  }
};
