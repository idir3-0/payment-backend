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
  ListNotificationParams,
  CreateNotificationParams,
  Notification,
} from 'payment-types';
import { NOTIFICATIONS_KEY, NOTIFICATION_DELETE_DELAY } from './constants';

export const newNotificationsTx = async (
  tx: Transaction,
  createNotificationParams: CreateNotificationParams,
) => {
  const d = getNotificationDoc(createNotificationParams.userIdinBox);

  const notification: Notification = {
    notificationJSON: newNotification(createNotificationParams),
    readAt: 0,
    createdAt: Timestamp.now().seconds,
  };
  tx.set(
    d,
    {
      notifications: arrayUnion(notification),
    },
    { merge: true },
  );
};

export const listNotifications = async (
  listNotificationParams: ListNotificationParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    // TODO: improve
    const { _userId, limit } = listNotificationParams;
    const d = getNotificationDoc(_userId);
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

export const readNotifications = async (
  userId: string,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const updatedNotifications: Notification[] = [];
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = getNotificationDoc(userId);
      const notifSnap = await tx.get(d);
      const notificationsObject = notifSnap.data();

      if (!notificationsObject) {
        return { data: {} };
      }
      const notifications = notificationsObject.notifications as Notification[];

      const currentTimestamp = Timestamp.now().seconds;
      for (let i = 0; i < notifications.length; i++) {
        let notification = notifications[i];
        if (
          notification.readAt !== 0 &&
          notification.readAt + NOTIFICATION_DELETE_DELAY < currentTimestamp
        ) {
          continue;
        }
        if (notification.readAt === 0) {
          notification.readAt = currentTimestamp;
        }
        updatedNotifications.push(notification);
      }
      tx.set(d, {
        notifications: updatedNotifications,
      });
    });
    return { data: { notifications: updatedNotifications } };
  } catch (error) {
    return { error };
  }
};

const getNotificationDoc = (userId: string): DocumentReference =>
  doc(firebaseDatabase, NOTIFICATIONS_KEY, userId);

export const newNotification = (
  notification: CreateNotificationParams,
): string => JSON.stringify(notification);
