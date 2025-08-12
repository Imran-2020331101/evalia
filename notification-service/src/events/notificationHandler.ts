import { EventTypes } from "./eventTypes";
import { createNotification } from "../services/notificationService";
import { io } from "../config/socket";

export const handleIncomingEvent = async (event: any) => {
  switch (event.type) {
    case EventTypes.RESUME_STATUS_UPDATED:
      const notif = await createNotification({
        userId: event.userId,
        title: "Resume Status Updated",
        message: event.message,
        type: "status",
        link: `/resumes/${event.resumeId}`
      });
      io.to(event.userId).emit("notification", notif);
      break;

    // Add other event cases...
  }
};
