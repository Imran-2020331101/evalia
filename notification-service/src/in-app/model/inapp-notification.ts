import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  data: { type: Schema.Types.Mixed }
});

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
