package com.example.server.notification.Controller;

import com.example.server.exception.handler.GlobalExceptionHandler;
import com.example.server.notification.Proxy.NotificationProxy;
import com.example.server.security.models.userEntity;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    private static final Principal PRINCIPAL = () -> TestDataFactory.EMAIL;

    @Mock
    private NotificationProxy notificationProxy;
    @Mock
    private UserDetailsService userDetailsService;

    private MockMvc mvc;
    private userEntity user;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new NotificationController(notificationProxy, userDetailsService))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        user = TestDataFactory.user();
    }

    @Test
    void listsNotificationsOfCurrentUser() throws Exception {
        when(userDetailsService.loadUserByUsername(TestDataFactory.EMAIL)).thenReturn(user);
        when(notificationProxy.getNotificationsOfAUser(user.getId().toString())).thenReturn(ResponseEntity.ok("[{\"n\":1}]"));

        mvc.perform(get("/api/notifications/").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(content().string("[{\"n\":1}]"));
    }

    @Test
    void readOneNotificationIsForwardedAsPut() throws Exception {
        when(notificationProxy.readNotification("n1")).thenReturn(ResponseEntity.ok("read"));

        mvc.perform(patch("/api/notifications/n1/read"))
                .andExpect(status().isOk())
                .andExpect(content().string("read"));
    }

    @Test
    void markAllAsReadUsesUserId() throws Exception {
        when(userDetailsService.loadUserByUsername(TestDataFactory.EMAIL)).thenReturn(user);
        when(notificationProxy.markAllAsRead(user.getId().toString())).thenReturn(ResponseEntity.ok("done"));

        mvc.perform(patch("/api/notifications/read-all").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(content().string("done"));
    }

    @Test
    void deleteNotificationPropagatesDownstreamStatus() throws Exception {
        when(notificationProxy.deleteNotification("n1")).thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body("gone"));

        mvc.perform(delete("/api/notifications/n1"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("gone"));
    }
}
