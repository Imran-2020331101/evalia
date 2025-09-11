import { z } from "zod";

export const NotificationZodSchema = z.object({
  recieverId: z.string(),
  recieverEmail: z.string().email(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  link: z.string().optional(),
  isRead: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  data: z.any().optional(),
});


export type INotification = z.infer<typeof NotificationZodSchema>;
