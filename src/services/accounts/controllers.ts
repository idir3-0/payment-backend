import {
  Transaction,
  doc,
  getDoc,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import {
  SetupUserAccountRequest,
  SetupBusinessRequest,
  AdminValidateSetupAccountRequest,
  PROFILE_COLLECTION_KEY,
  BUSINESS_COLLECTION_KEY,
  RoleCollection,
  UpdateBusinessRequest,
  UpdateProfileRequest,
  GetUserProfileRequest,
  GetBusinessRequest,
} from './models';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import { auth } from 'firebase-admin';
import {
  ERROR_ACCOUNT_NOT_EXIST,
  ERROR_ACCOUNT_ALREADY_SETUP,
  ERROR_INVALID_USER_DATA,
} from './errors';
import { newNotificationsTx } from 'src/services/notifications/controllers';

export const setupUserAccount = async (
  setupUserAccountRequest: SetupUserAccountRequest,
) => {
  try {
    const {
      userId,
      address,
      firstName,
      lastName,
      nationalIdFile,
      createdAt,
      updatedAt,
    } = setupUserAccountRequest;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = doc(firebaseDatabase, PROFILE_COLLECTION_KEY, userId);

      const profileSnap = await tx.get(d);
      const profile = profileSnap.data();
      if (profile) {
        throw ERROR_ACCOUNT_ALREADY_SETUP;
      }

      tx.set(d, {
        userId,
        firstName,
        lastName,
        address,
        nationalIdFile,
        createdAt,
        updatedAt,
      });

      await auth().setCustomUserClaims(userId, {
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
  getUserProfileRequest: GetUserProfileRequest,
) => {
  try {
    const { userId } = getUserProfileRequest;

    const d = doc(firebaseDatabase, PROFILE_COLLECTION_KEY, userId);
    const profileSnap = await getDoc(d);

    const profile = profileSnap.data();
    if (!profile) {
      throw ERROR_ACCOUNT_NOT_EXIST;
    }

    return { data: profile };
  } catch (error) {
    return { error };
  }
};

export const updateProfile = async (
  updateProfileRequest: UpdateProfileRequest,
) => {
  try {
    const {
      address,
      firstName,
      isActive,
      lastName,
      userId,
      nationalIdFile,
      updatedAt,
    } = updateProfileRequest;

    const d = doc(firebaseDatabase, PROFILE_COLLECTION_KEY, userId);

    const updateData = {
      firstName,
      lastName,
      address,
      updatedAt,
    };
    if (!isActive) {
      updateData['nationalIdFile'] = nationalIdFile;
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

export const setupBusinessAccount = async (
  setupBusinessRequest: SetupBusinessRequest,
) => {
  try {
    const {
      address,
      description,
      displayName,
      firstName,
      lastName,
      logo,
      userId,
      businessLegal,
      createdAt,
      updatedAt,
    } = setupBusinessRequest;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = doc(firebaseDatabase, BUSINESS_COLLECTION_KEY, userId);
      const businessSnap = await getDoc(d);
      const business = businessSnap.data();

      if (business) {
        throw ERROR_ACCOUNT_ALREADY_SETUP;
      }

      setDoc(d, {
        userId,
        firstName,
        lastName,
        displayName,
        description,
        logo,
        address,
        businessLegal,
        createdAt,
        updatedAt,
      });

      await auth().setCustomUserClaims(userId, { acv: true, role: 'business' });
    });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const getBusiness = async (getBusinessRequest: GetBusinessRequest) => {
  try {
    const { userId } = getBusinessRequest;
    const d = doc(firebaseDatabase, BUSINESS_COLLECTION_KEY, userId);
    const businessSnap = await getDoc(d);
    const business = businessSnap.data();
    if (!business) {
      throw ERROR_ACCOUNT_NOT_EXIST;
    }
    return { data: business };
  } catch (error) {
    return { error };
  }
};

export const updateBusiness = async (
  updateBusinessRequest: UpdateBusinessRequest,
) => {
  try {
    const {
      firstName,
      lastName,
      address,
      description,
      displayName,
      isActive,
      logo,
      userId,
      businessLegal,
      updatedAt,
    } = updateBusinessRequest;

    const d = doc(firebaseDatabase, BUSINESS_COLLECTION_KEY, userId);
    const updateData = {
      firstName,
      lastName,
      address,
      description,
      displayName,
      logo,
      userId,
      updatedAt,
    };
    if (!isActive) {
      updateData['businessLegal'] = businessLegal;
    }
    await setDoc(d, updateData, { merge: true });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const adminValidateAccount = async (
  adminValidateSetupAccountRequest: AdminValidateSetupAccountRequest,
) => {
  try {
    const { status, userId, content } = adminValidateSetupAccountRequest;
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
