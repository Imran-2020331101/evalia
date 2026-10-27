import { describe, it, expect } from "vitest";
import * as E from "../../../src/utils";
import { ApiError } from "../../../src/utils/ApiError";

describe("custom errors", () => {
  const cases: [string, ApiError, number, string, string][] = [
    ["NotificationNotFoundError(id)", new E.NotificationNotFoundError("9"), 404, "Notification with ID 9 not found", "NOTIFICATION_NOT_FOUND"],
    ["NotificationNotFoundError()", new E.NotificationNotFoundError(), 404, "Notification not found", "NOTIFICATION_NOT_FOUND"],
    ["NotificationAlreadyReadError", new E.NotificationAlreadyReadError("3"), 400, "Notification 3 is already marked as read", "NOTIFICATION_ALREADY_READ"],
    ["NotificationCreationError()", new E.NotificationCreationError(), 422, "Failed to create notification", "NOTIFICATION_CREATION_FAILED"],
    ["NotificationCreationError(details)", new E.NotificationCreationError(["a"]), 422, "Failed to create notification", "a"],
    ["InvalidNotificationDataError", new E.InvalidNotificationDataError("title"), 400, "Invalid notification data: title is required", "INVALID_TITLE"],
    ["InvalidUserIdError", new E.InvalidUserIdError(), 400, "Invalid or missing user ID", "INVALID_USER_ID"],
    ["UserNotificationsNotFoundError", new E.UserNotificationsNotFoundError("u"), 404, "No notifications found for user u", "USER_NOTIFICATIONS_NOT_FOUND"],
    ["EmailConfigurationError(d)", new E.EmailConfigurationError("smtp"), 500, "Email service configuration error: smtp", "EMAIL_CONFIG_ERROR"],
    ["EmailConfigurationError()", new E.EmailConfigurationError(), 500, "Email service is not properly configured", "EMAIL_CONFIG_ERROR"],
    ["EmailSendError(r)", new E.EmailSendError("a@b.c", "timeout"), 500, "Failed to send email to a@b.c: timeout", "EMAIL_SEND_FAILED"],
    ["EmailSendError()", new E.EmailSendError("a@b.c"), 500, "Failed to send email to a@b.c", "EMAIL_SEND_FAILED"],
    ["InvalidEmailAddressError", new E.InvalidEmailAddressError("x"), 400, "Invalid email address: x", "INVALID_EMAIL"],
    ["EmailTemplateError", new E.EmailTemplateError("rej"), 500, "Failed to generate email template: rej", "EMAIL_TEMPLATE_ERROR"],
    ["MessageBrokerConnectionError()", new E.MessageBrokerConnectionError(), 500, "Failed to connect to message broker", "BROKER_CONNECTION_ERROR"],
    ["MessageBrokerConnectionError(t)", new E.MessageBrokerConnectionError("rabbit"), 500, "Failed to connect to rabbit", "BROKER_CONNECTION_ERROR"],
    ["EventProcessingError(r)", new E.EventProcessingError("e", "why"), 500, "Failed to process event e: why", "EVENT_PROCESSING_ERROR"],
    ["EventProcessingError()", new E.EventProcessingError("e"), 500, "Failed to process event e", "EVENT_PROCESSING_ERROR"],
    ["InvalidEventDataError", new E.InvalidEventDataError("e", ["a", "b"]), 400, "Invalid event data for e. Missing fields: a, b", "INVALID_EVENT_DATA"],
    ["UnsupportedEventTypeError", new E.UnsupportedEventTypeError("z"), 400, "Unsupported event type: z", "UNSUPPORTED_EVENT_TYPE"],
    ["BatchOperationError", new E.BatchOperationError("send", 2, 5), 500, "Batch send failed. 2/5 operations failed", "BATCH_OPERATION_ERROR"],
    ["BatchSizeExceededError", new E.BatchSizeExceededError(10, 5), 400, "Batch size 10 exceeds maximum allowed size of 5", "BATCH_SIZE_EXCEEDED"],
    ["TemplateNotFoundError", new E.TemplateNotFoundError("t"), 404, "Notification template 't' not found", "TEMPLATE_NOT_FOUND"],
    ["TemplateRenderError(r)", new E.TemplateRenderError("t", "bad"), 500, "Failed to render template 't': bad", "TEMPLATE_RENDER_ERROR"],
    ["TemplateRenderError()", new E.TemplateRenderError("t"), 500, "Failed to render template 't'", "TEMPLATE_RENDER_ERROR"],
    ["RateLimitExceededError", new E.RateLimitExceededError("send", 5, "min"), 429, "Rate limit exceeded for send. Limit: 5 requests per min", "RATE_LIMIT_EXCEEDED"],
    ["SocketConnectionError(u)", new E.SocketConnectionError("u1"), 500, "Failed to establish socket connection for user u1", "SOCKET_CONNECTION_ERROR"],
    ["SocketConnectionError()", new E.SocketConnectionError(), 500, "Failed to establish socket connection", "SOCKET_CONNECTION_ERROR"],
    ["SocketEmitError(u)", new E.SocketEmitError("ev", "u1"), 500, "Failed to emit socket event 'ev' to user u1", "SOCKET_EMIT_ERROR"],
    ["SocketEmitError()", new E.SocketEmitError("ev"), 500, "Failed to emit socket event 'ev'", "SOCKET_EMIT_ERROR"],
    ["NotificationDatabaseError(r)", new E.NotificationDatabaseError("save", "dup"), 500, "Database error during save: dup", "DATABASE_ERROR"],
    ["NotificationDatabaseError()", new E.NotificationDatabaseError("save"), 500, "Database error during save", "DATABASE_ERROR"],
  ];

  it.each(cases)("%s", (_n, err, status, message, code) => {
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(status);
    expect(err.message).toBe(message);
    expect(err.errors).toContain(code);
  });

  it("factory builds the right error types", () => {
    const F = E.NotificationErrorFactory;
    expect(F.notificationNotFound("1")).toBeInstanceOf(E.NotificationNotFoundError);
    expect(F.invalidUserId()).toBeInstanceOf(E.InvalidUserIdError);
    expect(F.emailSendFailed("a", "r").message).toContain("r");
    expect(F.eventProcessingFailed("e").statusCode).toBe(500);
    expect(F.rateLimitExceeded("o", 1, "s").statusCode).toBe(429);
    expect(F.batchOperationFailed("o", 1, 2)).toBeInstanceOf(E.BatchOperationError);
  });

  it("utils index re-exports core helpers", () => {
    expect(E.ApiError).toBe(ApiError);
    expect(typeof E.ApiResponse).toBe("function");
    expect(typeof E.asyncHandler).toBe("function");
  });
});
