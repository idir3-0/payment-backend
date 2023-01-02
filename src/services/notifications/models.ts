export const NOTIFICATIONS_KEY = 'notifications';

export interface CreateNotificationRequest {
  userId: string;
  collection: string;
  ownerId: string;
  path: string;
  refId: string;
  action: string;
  createdAt: number;
}

export interface Notification {
  collection: string;
  ownerId: string;
  path: string;
  refId: string;
  action: string;
  createdAt: number;
  read: string;
}

export const newNotification = (
  notification: CreateNotificationRequest,
): string => {
  return `${notification.collection}_${notification.ownerId}_${notification.path}_${notification.refId}_${notification.action}_${notification.createdAt}_0`;
};

/**
 *
 * @param notification the notification log stored in the database
 * Example:
 * {invoices}_{2vk0GHROIdzZBtDnyymOmrd0Y54X}_{created}_{cc469e7d-0e53-4d74-a403-8e23cc7263e8}_{paied}_{timestamp}_{status 0 or 1}
 * transactions_2vk0GHROIdzZBtDnyymOmrd0Y54X_deposit_cc469e7d-0e53-4d74-a403-8e23cc7263e8_accepted_{timestamp}_{status 0 or 1}
 * @returns notifiaction object
 */
export const toNotification = (notification: string): Notification => {
  const args = notification.split('_');
  return {
    collection: args[0],
    ownerId: args[1],
    path: args[2],
    refId: args[3],
    action: args[4],
    createdAt: Number(args[5]),
    read: args[6],
  };
};

export const fromNotification = (notification: Notification): string => {
  return `${notification.collection}_${notification.ownerId}_${notification.path}_${notification.refId}_${notification.action}_${notification.createdAt}_${notification.read}`;
};
