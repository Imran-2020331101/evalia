package com.example.server.notification.Proxy;

import com.example.server.support.AbstractFeignContractTest;
import com.example.server.support.FakeHttpServer.Recorded;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationProxyContractTest extends AbstractFeignContractTest {

    @Autowired
    private NotificationProxy proxy;

    @Test
    void notificationsOfAUser() {
        SERVER.reply(200, "[{\"id\":\"n1\"}]");

        assertThat(proxy.getNotificationsOfAUser("u1").getBody()).isEqualTo("[{\"id\":\"n1\"}]");

        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("GET");
        assertThat(request.path()).isEqualTo("/api/notifications/u1");
    }

    @Test
    void markAllAsReadIsPutWithJsonContentType() {
        SERVER.reply(200, "done");

        proxy.markAllAsRead("u1");

        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("PUT");
        assertThat(request.path()).isEqualTo("/api/notifications/u1/read-all");
        assertThat(request.contentType()).startsWith("application/json");
    }

    @Test
    void readNotificationIsPut() {
        SERVER.reply(200, "read");

        assertThat(proxy.readNotification("n1").getBody()).isEqualTo("read");

        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("PUT");
        assertThat(request.path()).isEqualTo("/api/notifications/n1/read");
    }

    @Test
    void deleteNotification() {
        SERVER.reply(200, "gone");

        proxy.deleteNotification("n1");

        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("DELETE");
        assertThat(request.path()).isEqualTo("/api/notifications/n1");
    }
}
