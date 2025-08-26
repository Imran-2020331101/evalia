import { Notification, INotification } from "../model/inapp-notification.entity";

export const createNotification = async (data: Partial<INotification>) => {
  const notification = await Notification.create(data);
  return notification;
};

export const getUserNotifications = async (userId: string) => {
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

export const markAsRead = async (id: string) => {
  return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};
