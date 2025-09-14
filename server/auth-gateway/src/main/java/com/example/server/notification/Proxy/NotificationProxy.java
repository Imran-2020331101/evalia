package com.example.server.notification.Proxy;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "notificationClient",
        url = "${notification.service.url}/api/notifications")
public interface NotificationProxy {

    @GetMapping(value = "/{userId}")
    ResponseEntity<String> getNotificationsOfAUser(@PathVariable("userId") String userId);

    @PutMapping(value = "/{userId}/read-all", consumes = "application/json")
    ResponseEntity<String> markAllAsRead(@PathVariable("userId") String userId);

    @PutMapping(value = "/{notificationId}/read", consumes = "application/json")
    ResponseEntity<String> readNotification(@PathVariable("notificationId") String notificationId);

    @DeleteMapping(value = "/{notificationId}")
    ResponseEntity<String> deleteNotification(@PathVariable("notificationId") String notificationId);

}
