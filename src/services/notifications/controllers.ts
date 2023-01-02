import {
  DocumentReference,
  Timestamp,
  Transaction,
  arrayUnion,
  doc,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  NOTIFICATIONS_KEY,
  CreateNotificationRequest,
  fromNotification,
  toNotification,
  newNotification,
} from './models';

export const newNotificationsTx = async (
  tx: Transaction,
  createNotificationRequest: CreateNotificationRequest,
) => {
  const d = getNotificationDoc(createNotificationRequest.userId);
  tx.set(
    d,
    {
      notifications: arrayUnion(newNotification(createNotificationRequest)),
    },
    { merge: true },
  );
};

export const listNotifications = async (userId: string) => {
  try {
    const d = getNotificationDoc(userId);
    const notifSnap = await getDoc(d);
    const notifications = notifSnap.data();
    if (!notifications) {
      return { data: [] };
    }
    return { data: notifications.notifications };
  } catch (error) {
    return { error };
  }
};

export const readNotifications = async (ids: number[], userId: string) => {
  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = getNotificationDoc(userId);
      const notifSnap = await tx.get(d);
      const notifications = notifSnap.data();

      if (!notifications) {
        return { data: {} };
      }

      for (let i = 0; i < ids.length; i++) {
        if (ids[i] > notifications.notifications.length - 1) {
          continue;
        }
        const notif = toNotification(notifications.notifications[ids[i]]);
        notif.read = '1'; // 1 means true, 0 false
        notifications.notifications[ids[i]] = fromNotification(notif);
      }

      tx.set(d, {
        notifications: notifications.notifications,
      });
    });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

const getNotificationDoc = (userId: string): DocumentReference =>
  doc(firebaseDatabase, NOTIFICATIONS_KEY, userId);
