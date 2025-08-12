import { Notification, INotification } from "../models/Notification";

export const createNotification = async (data: Partial<INotification>) => {
  const notif = await Notification.create(data);
  return notif;
};

export const getUserNotifications = async (userId: string) => {
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

export const markAsRead = async (id: string) => {
  return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};
