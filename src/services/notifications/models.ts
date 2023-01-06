export interface CreateNotificationReauest {
  userIdinBox: string;
  collection: string;
  path: string[];
  refId: string;
  action: string;
}

export interface Notification {
  notificationJSON: string;
  readAt: number;
  createdAt: number;
}

export const newNotification = (
  notification: CreateNotificationReauest,
): string => JSON.stringify(notification);

export interface ListNotificationRequest {
  userId: string;
  limit?: number;
}
