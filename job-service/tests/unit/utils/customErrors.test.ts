import { describe, it, expect } from 'vitest';
import * as E from '../../../src/utils/customErrors';
import { ApiError } from '../../../src/utils/ApiError';
import * as utils from '../../../src/utils';

describe('customErrors', () => {
  const cases: Array<[string, () => ApiError, number, string, string]> = [
    ['NotificationNotFoundError(id)', () => new E.NotificationNotFoundError('n1'), 404, 'Notification with ID n1 not found', 'NOTIFICATION_NOT_FOUND'],
    ['NotificationNotFoundError()', () => new E.NotificationNotFoundError(), 404, 'Notification not found', 'NOTIFICATION_NOT_FOUND'],
    ['NotificationAlreadyReadError', () => new E.NotificationAlreadyReadError('n1'), 400, 'Notification n1 is already marked as read', 'NOTIFICATION_ALREADY_READ'],
    ['NotificationCreationError()', () => new E.NotificationCreationError(), 422, 'Failed to create notification', 'NOTIFICATION_CREATION_FAILED'],
    ['NotificationCreationError(details)', () => new E.NotificationCreationError(['x']), 422, 'Failed to create notification', 'x'],
    ['InvalidNotificationDataError', () => new E.InvalidNotificationDataError('title'), 400, 'Invalid notification data: title is required', 'INVALID_TITLE'],
    ['InvalidUserIdError', () => new E.InvalidUserIdError(), 400, 'Invalid or missing user ID', 'INVALID_USER_ID'],
    ['UserNotificationsNotFoundError', () => new E.UserNotificationsNotFoundError('u1'), 404, 'No notifications found for user u1', 'USER_NOTIFICATIONS_NOT_FOUND'],
    ['EmailConfigurationError(details)', () => new E.EmailConfigurationError('smtp'), 500, 'Email service configuration error: smtp', 'EMAIL_CONFIG_ERROR'],
    ['EmailConfigurationError()', () => new E.EmailConfigurationError(), 500, 'Email service is not properly configured', 'EMAIL_CONFIG_ERROR'],
    ['EmailSendError(reason)', () => new E.EmailSendError('a@b.c', 'down'), 500, 'Failed to send email to a@b.c: down', 'EMAIL_SEND_FAILED'],
    ['EmailSendError()', () => new E.EmailSendError('a@b.c'), 500, 'Failed to send email to a@b.c', 'EMAIL_SEND_FAILED'],
    ['InvalidEmailAddressError', () => new E.InvalidEmailAddressError('bad'), 400, 'Invalid email address: bad', 'INVALID_EMAIL'],
    ['EmailTemplateError', () => new E.EmailTemplateError('welcome'), 500, 'Failed to generate email template: welcome', 'EMAIL_TEMPLATE_ERROR'],
    ['MessageBrokerConnectionError()', () => new E.MessageBrokerConnectionError(), 500, 'Failed to connect to message broker', 'BROKER_CONNECTION_ERROR'],
    ['MessageBrokerConnectionError(type)', () => new E.MessageBrokerConnectionError('rabbit'), 500, 'Failed to connect to rabbit', 'BROKER_CONNECTION_ERROR'],
    ['EventProcessingError(reason)', () => new E.EventProcessingError('ev', 'why'), 500, 'Failed to process event ev: why', 'EVENT_PROCESSING_ERROR'],
    ['EventProcessingError()', () => new E.EventProcessingError('ev'), 500, 'Failed to process event ev', 'EVENT_PROCESSING_ERROR'],
    ['InvalidEventDataError', () => new E.InvalidEventDataError('ev', ['a', 'b']), 400, 'Invalid event data for ev. Missing fields: a, b', 'INVALID_EVENT_DATA'],
    ['UnsupportedEventTypeError', () => new E.UnsupportedEventTypeError('ev'), 400, 'Unsupported event type: ev', 'UNSUPPORTED_EVENT_TYPE'],
    ['BatchOperationError', () => new E.BatchOperationError('send', 2, 5), 500, 'Batch send failed. 2/5 operations failed', 'BATCH_OPERATION_ERROR'],
    ['BatchSizeExceededError', () => new E.BatchSizeExceededError(10, 5), 400, 'Batch size 10 exceeds maximum allowed size of 5', 'BATCH_SIZE_EXCEEDED'],
    ['TemplateNotFoundError', () => new E.TemplateNotFoundError('t'), 404, "Notification template 't' not found", 'TEMPLATE_NOT_FOUND'],
    ['TemplateRenderError(reason)', () => new E.TemplateRenderError('t', 'r'), 500, "Failed to render template 't': r", 'TEMPLATE_RENDER_ERROR'],
    ['TemplateRenderError()', () => new E.TemplateRenderError('t'), 500, "Failed to render template 't'", 'TEMPLATE_RENDER_ERROR'],
    ['RateLimitExceededError', () => new E.RateLimitExceededError('send', 5, 'minute'), 429, 'Rate limit exceeded for send. Limit: 5 requests per minute', 'RATE_LIMIT_EXCEEDED'],
    ['SocketConnectionError(user)', () => new E.SocketConnectionError('u1'), 500, 'Failed to establish socket connection for user u1', 'SOCKET_CONNECTION_ERROR'],
    ['SocketConnectionError()', () => new E.SocketConnectionError(), 500, 'Failed to establish socket connection', 'SOCKET_CONNECTION_ERROR'],
    ['SocketEmitError(user)', () => new E.SocketEmitError('ev', 'u1'), 500, "Failed to emit socket event 'ev' to user u1", 'SOCKET_EMIT_ERROR'],
    ['SocketEmitError()', () => new E.SocketEmitError('ev'), 500, "Failed to emit socket event 'ev'", 'SOCKET_EMIT_ERROR'],
    ['NotificationDatabaseError(reason)', () => new E.NotificationDatabaseError('save', 'x'), 500, 'Database error during save: x', 'DATABASE_ERROR'],
    ['NotificationDatabaseError()', () => new E.NotificationDatabaseError('save'), 500, 'Database error during save', 'DATABASE_ERROR'],
  ];

  it.each(cases)('%s', (_n, make, status, message, code) => {
    const e = make();
    expect(e).toBeInstanceOf(ApiError);
    expect(e.statusCode).toBe(status);
    expect(e.message).toBe(message);
    expect(e.errors).toContain(code);
  });

  it('factory builds the expected error types', () => {
    const F = E.NotificationErrorFactory;
    expect(F.notificationNotFound('1')).toBeInstanceOf(E.NotificationNotFoundError);
    expect(F.invalidUserId()).toBeInstanceOf(E.InvalidUserIdError);
    expect(F.emailSendFailed('a', 'r')).toBeInstanceOf(E.EmailSendError);
    expect(F.eventProcessingFailed('e', 'r')).toBeInstanceOf(E.EventProcessingError);
    expect(F.rateLimitExceeded('o', 1, 'm').statusCode).toBe(429);
    expect(F.batchOperationFailed('o', 1, 2).statusCode).toBe(500);
  });

  it('utils index re-exports everything', () => {
    expect(utils.ApiError).toBe(ApiError);
    expect(utils.asyncHandler).toBeTypeOf('function');
    expect(utils.ApiResponse).toBeTypeOf('function');
    expect(utils.InvalidUserIdError).toBe(E.InvalidUserIdError);
  });
});
