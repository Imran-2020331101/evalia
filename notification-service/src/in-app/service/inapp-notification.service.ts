import { Notification, INotification } from "../model/inapp-notification";
import { InterviewCreatedNotification } from "../types/interviewNotifications.types";
import { notifyUser, notifyInterviewUpdate } from "../../config/socket";

class InAppNotificationService {
  createNotification = async (data: Partial<INotification>) => {
    const notification = await Notification.create(data);
    return notification;
  };

  getUserNotifications = async (userId: string) => {
    return Notification.find({ userId }).sort({ createdAt: -1 }).orFail();
  };

  markAsRead = async (id: string) => {
    return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true }).orFail();
  };

  notifyInterviewCreation = async (notification: InterviewCreatedNotification) => {

    const savedNotification = await this.createNotification({
      userId: notification.candidateId,
      title: "Interview Scheduled",
      message: `You have been scheduled for an interview for ${notification.jobTitle}`,
      type: "interview_scheduled",
      data: {
        interviewId: notification.interviewId,
        jobId: notification.jobId,
        jobTitle: notification.jobTitle,
        deadline: notification.deadline,
        totalQuestions: notification.totalQuestions,
        status: notification.status
      },
      isRead: false
    });

    // Emit general notification
    notifyUser(notification.candidateId, {
      id: savedNotification._id,
      title: savedNotification.title,
      message: savedNotification.message,
      type: savedNotification.type,
      data: savedNotification.data,
      isRead: savedNotification.isRead,
      createdAt: savedNotification.createdAt
    });

    // Emit interview-specific notification for frontend interview components
    notifyInterviewUpdate(notification.candidateId, {
      type: 'INTERVIEW_SCHEDULED',
      interviewId: notification.interviewId,
      jobId: notification.jobId,
      jobTitle: notification.jobTitle,
      deadline: notification.deadline,
      totalQuestions: notification.totalQuestions,
      status: notification.status,
      timestamp: new Date()
    });

    return savedNotification;
  }
}

export const inAppNotificationService = new InAppNotificationService();
