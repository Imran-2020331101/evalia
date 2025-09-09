package com.example.server.notification.Controller;

import com.example.server.UserProfile.Service.UserService;
import com.example.server.notification.Proxy.NotificationProxy;
import com.example.server.security.models.userEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = Logger.getLogger(NotificationController.class.getName());
    private        final NotificationProxy notificationProxy;
    private        final UserDetailsService userDetailsService;

    public NotificationController(NotificationProxy notificationProxy, UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
        this.notificationProxy = notificationProxy;
    }

    @GetMapping("/")
    ResponseEntity<?> getAllNotifications(Principal principal) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        ResponseEntity<?> response = notificationProxy.getNotificationsOfAUser(user.getId().toString());

        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<?> readNotification(@PathVariable("notificationId") String notificationId) {
        logger.info("Reading notification with ID: " + notificationId);
        ResponseEntity<String> response = notificationProxy.readNotification(notificationId);
        logger.info("Response from notification service: " + response.getBody());
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
        logger.info("Marking all notifications as read for user ID: " + user.getId());
        ResponseEntity<String> response = notificationProxy.markAllAsRead(user.getId().toString());
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable("notificationId") String notificationId) {
        ResponseEntity<String> response = notificationProxy.deleteNotification(notificationId);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }


}
