import { Request, Response } from 'express';
import { asyncHandler, ApiResponse, ApiError } from '../utils';
import { inAppNotificationService } from '../in-app/service/inapp-notification.service';
import logger from '../utils/logger';

class NotificationController{
  fetchNotificationsOfAUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    logger.info("Notification fetched for id : ", userId);
    
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }
    
    const notifs = await inAppNotificationService.getUserNotifications(userId);
    const response = new ApiResponse(200, notifs, "Notifications retrieved successfully");
    res.status(200).json(response);
  })

  readNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    logger.info("read the notification : ", notificationId);
    if (!notificationId) {
      throw new ApiError(400, "Notification ID is required");
    }
    
    const updated = await inAppNotificationService.markAsRead(notificationId);
    
    if (!updated) {
      throw new ApiError(404, "Notification not found");
    }
    
    const response = new ApiResponse(200, updated, "Notification marked as read successfully");
    res.status(200).json(response);
  })

  readAllNotification = asyncHandler(async(req: Request, res: Response) =>{
    const { userId } = req.params;
    const updated = inAppNotificationService.markAllAsRead(userId);
    res.status(200).json(new ApiResponse(200, updated , "All Notifications marked as read successfully"));
  })
}

export const notificationController = new NotificationController();
