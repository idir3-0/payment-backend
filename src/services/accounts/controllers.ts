import {
  Timestamp,
  Transaction,
  arrayUnion,
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
  setupUserAccount: SetupUserAccountRequest,
  userId: string,
) => {
  try {
    const d = doc(firebaseDatabase, PROFILE_COLLECTION_KEY, userId);
    await auth().setCustomUserClaims(userId, {
      acv: true,
      role: 'user',
    });
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const profileSnap = await tx.get(d);
      const profile = profileSnap.data();

      if (profile) {
        throw ERROR_ACCOUNT_ALREADY_SETUP;
      }
      const { firstName, lastName, address, nationalIdFile } =
        setupUserAccount.userProfile;

      tx.set(d, {
        userId,
        firstName,
        lastName,
        address,
        nationalIdFile: nationalIdFile || null,
      });
    });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
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
  userId: string,
) => {
  try {
    const d = doc(firebaseDatabase, PROFILE_COLLECTION_KEY, userId);
    const updateData = {
      firstName: updateProfileRequest.firstName,
      lastName: updateProfileRequest.lastName,
      address: updateProfileRequest.address,
    };
    if (!updateProfileRequest.isActive) {
      updateData['nationalIdFile'] = updateProfileRequest.nationalIdFile;
    }

    await setDoc(
      d,
      {
        ...updateData,
        updatedAt: Timestamp.now().seconds,
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
  userId: string,
) => {
  try {
    await auth().setCustomUserClaims(userId, {
      acv: true,
      role: 'business',
    });
    await auth().setCustomUserClaims(userId, { acv: true, role: 'business' });

    const d = doc(firebaseDatabase, BUSINESS_COLLECTION_KEY, userId);
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const businessSnap = await tx.get(d);
      const business = businessSnap.data();

      if (!business) {
        const { address, description, displayName, logo, businessLegal } =
          setupBusinessRequest.businessProfile;

        tx.set(d, {
          userId,
          displayName,
          description,
          logo,
          address,
          businessLegal,
        });
      }
    });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const getBusiness = async (userId: string) => {
  try {
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
  userId: string,
) => {
  try {
    const d = doc(firebaseDatabase, BUSINESS_COLLECTION_KEY, userId);
    const updateData = {
      displayName: updateBusinessRequest.displayName,
      firstName: updateBusinessRequest.firstName,
      lastName: updateBusinessRequest.lastName,
      description: updateBusinessRequest.description,
      logo: updateBusinessRequest.logo,
      address: updateBusinessRequest.address,
      updatedAt: Timestamp.now().seconds,
    };
    if (!updateBusinessRequest.isActive) {
      updateData['businessLegal'] = updateBusinessRequest.businessLegal;
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
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const user = await auth().getUser(adminValidateSetupAccountRequest.uid);
      const colName = RoleCollection[user.customClaims.role];
      if (!colName) {
        throw ERROR_INVALID_USER_DATA;
      }
      const d = doc(
        firebaseDatabase,
        colName,
        adminValidateSetupAccountRequest.uid,
      );

      tx.set(
        d,
        {
          error: adminValidateSetupAccountRequest.status
            ? ''
            : adminValidateSetupAccountRequest.content,
        },
        { merge: true },
      );

      await newNotificationsTx(tx, {
        userId: adminValidateSetupAccountRequest.uid,
        collection: colName,
        ownerId: adminValidateSetupAccountRequest.uid,
        path: '',
        refId: '',
        action: '',
        createdAt: Timestamp.now().seconds,
      });

      if (adminValidateSetupAccountRequest.status) {
        await auth().setCustomUserClaims(adminValidateSetupAccountRequest.uid, {
          role: user.customClaims.role,
        });
      }
    });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};
