package com.example.server.notification.Controller;

import com.example.server.security.models.userEntity;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NotificationControllerIT extends AbstractIntegrationTest {

    private static final String EMAIL = TestDataFactory.EMAIL;

    @Test
    void listsMarksAndDeletesNotifications() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(notificationProxy.getNotificationsOfAUser(user.getId().toString())).thenReturn(ResponseEntity.ok("[n]"));
        when(notificationProxy.readNotification("n1")).thenReturn(ResponseEntity.ok("read"));
        when(notificationProxy.markAllAsRead(user.getId().toString())).thenReturn(ResponseEntity.ok("all read"));
        when(notificationProxy.deleteNotification("n1")).thenReturn(ResponseEntity.ok("deleted"));

        mockMvc.perform(get("/api/notifications/").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk()).andExpect(content().string("[n]"));
        mockMvc.perform(patch("/api/notifications/n1/read").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk()).andExpect(content().string("read"));
        mockMvc.perform(patch("/api/notifications/read-all").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk()).andExpect(content().string("all read"));
        mockMvc.perform(delete("/api/notifications/n1").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk()).andExpect(content().string("deleted"));
    }

    @Test
    void anonymousIsRejected() throws Exception {
        mockMvc.perform(get("/api/notifications/")).andExpect(status().isUnauthorized());

        verifyNoInteractions(notificationProxy);
    }
}
