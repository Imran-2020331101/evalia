import { ApiError } from './ApiError';

/**
 * Custom error classes for Notification Service
 */

// ============ NOTIFICATION ERRORS ============

export class NotificationNotFoundError extends ApiError {
  constructor(notificationId?: string) {
    const message = notificationId 
      ? `Notification with ID ${notificationId} not found`
      : 'Notification not found';
    super(404, message, ['NOTIFICATION_NOT_FOUND']);
  }
}

export class NotificationAlreadyReadError extends ApiError {
  constructor(notificationId: string) {
    super(400, `Notification ${notificationId} is already marked as read`, ['NOTIFICATION_ALREADY_READ']);
  }
}

export class NotificationCreationError extends ApiError {
  constructor(details?: string[]) {
    super(422, 'Failed to create notification', details || ['NOTIFICATION_CREATION_FAILED']);
  }
}

export class InvalidNotificationDataError extends ApiError {
  constructor(field: string) {
    super(400, `Invalid notification data: ${field} is required`, [`INVALID_${field.toUpperCase()}`]);
  }
}

// ============ USER/RECIPIENT ERRORS ============

export class InvalidUserIdError extends ApiError {
  constructor() {
    super(400, 'Invalid or missing user ID', ['INVALID_USER_ID']);
  }
}

export class UserNotificationsNotFoundError extends ApiError {
  constructor(userId: string) {
    super(404, `No notifications found for user ${userId}`, ['USER_NOTIFICATIONS_NOT_FOUND']);
  }
}

// ============ EMAIL SERVICE ERRORS ============

export class EmailConfigurationError extends ApiError {
  constructor(details?: string) {
    const message = details 
      ? `Email service configuration error: ${details}`
      : 'Email service is not properly configured';
    super(500, message, ['EMAIL_CONFIG_ERROR']);
  }
}

export class EmailSendError extends ApiError {
  constructor(recipient: string, reason?: string) {
    const message = reason 
      ? `Failed to send email to ${recipient}: ${reason}`
      : `Failed to send email to ${recipient}`;
    super(500, message, ['EMAIL_SEND_FAILED']);
  }
}

export class InvalidEmailAddressError extends ApiError {
  constructor(email: string) {
    super(400, `Invalid email address: ${email}`, ['INVALID_EMAIL']);
  }
}

export class EmailTemplateError extends ApiError {
  constructor(templateType: string) {
    super(500, `Failed to generate email template: ${templateType}`, ['EMAIL_TEMPLATE_ERROR']);
  }
}

// ============ MESSAGE BROKER ERRORS ============

export class MessageBrokerConnectionError extends ApiError {
  constructor(brokerType: string = 'message broker') {
    super(500, `Failed to connect to ${brokerType}`, ['BROKER_CONNECTION_ERROR']);
  }
}

export class EventProcessingError extends ApiError {
  constructor(eventType: string, reason?: string) {
    const message = reason 
      ? `Failed to process event ${eventType}: ${reason}`
      : `Failed to process event ${eventType}`;
    super(500, message, ['EVENT_PROCESSING_ERROR']);
  }
}

export class InvalidEventDataError extends ApiError {
  constructor(eventType: string, missingFields: string[]) {
    super(400, `Invalid event data for ${eventType}. Missing fields: ${missingFields.join(', ')}`, ['INVALID_EVENT_DATA']);
  }
}

export class UnsupportedEventTypeError extends ApiError {
  constructor(eventType: string) {
    super(400, `Unsupported event type: ${eventType}`, ['UNSUPPORTED_EVENT_TYPE']);
  }
}

// ============ BATCH OPERATION ERRORS ============

export class BatchOperationError extends ApiError {
  constructor(operation: string, failedCount: number, totalCount: number) {
    super(500, `Batch ${operation} failed. ${failedCount}/${totalCount} operations failed`, ['BATCH_OPERATION_ERROR']);
  }
}

export class BatchSizeExceededError extends ApiError {
  constructor(currentSize: number, maxSize: number) {
    super(400, `Batch size ${currentSize} exceeds maximum allowed size of ${maxSize}`, ['BATCH_SIZE_EXCEEDED']);
  }
}

// ============ TEMPLATE ERRORS ============

export class TemplateNotFoundError extends ApiError {
  constructor(templateName: string) {
    super(404, `Notification template '${templateName}' not found`, ['TEMPLATE_NOT_FOUND']);
  }
}

export class TemplateRenderError extends ApiError {
  constructor(templateName: string, reason?: string) {
    const message = reason 
      ? `Failed to render template '${templateName}': ${reason}`
      : `Failed to render template '${templateName}'`;
    super(500, message, ['TEMPLATE_RENDER_ERROR']);
  }
}

// ============ RATE LIMITING ERRORS ============

export class RateLimitExceededError extends ApiError {
  constructor(operation: string, limit: number, window: string) {
    super(429, `Rate limit exceeded for ${operation}. Limit: ${limit} requests per ${window}`, ['RATE_LIMIT_EXCEEDED']);
  }
}

// ============ SOCKET CONNECTION ERRORS ============

export class SocketConnectionError extends ApiError {
  constructor(userId?: string) {
    const message = userId 
      ? `Failed to establish socket connection for user ${userId}`
      : 'Failed to establish socket connection';
    super(500, message, ['SOCKET_CONNECTION_ERROR']);
  }
}

export class SocketEmitError extends ApiError {
  constructor(event: string, userId?: string) {
    const message = userId 
      ? `Failed to emit socket event '${event}' to user ${userId}`
      : `Failed to emit socket event '${event}'`;
    super(500, message, ['SOCKET_EMIT_ERROR']);
  }
}

// ============ DATABASE ERRORS ============

export class NotificationDatabaseError extends ApiError {
  constructor(operation: string, reason?: string) {
    const message = reason 
      ? `Database error during ${operation}: ${reason}`
      : `Database error during ${operation}`;
    super(500, message, ['DATABASE_ERROR']);
  }
}

// ============ FACTORY FUNCTION FOR QUICK ERROR CREATION ============

export class NotificationErrorFactory {
  static notificationNotFound(id?: string) {
    return new NotificationNotFoundError(id);
  }

  static invalidUserId() {
    return new InvalidUserIdError();
  }

  static emailSendFailed(recipient: string, reason?: string) {
    return new EmailSendError(recipient, reason);
  }

  static eventProcessingFailed(eventType: string, reason?: string) {
    return new EventProcessingError(eventType, reason);
  }

  static rateLimitExceeded(operation: string, limit: number, window: string) {
    return new RateLimitExceededError(operation, limit, window);
  }

  static batchOperationFailed(operation: string, failedCount: number, totalCount: number) {
    return new BatchOperationError(operation, failedCount, totalCount);
  }
}
