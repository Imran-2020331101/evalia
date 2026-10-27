package com.example.server;

import com.example.server.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.web.SecurityFilterChain;

import static org.assertj.core.api.Assertions.assertThat;

class ServerApplicationTests extends AbstractIntegrationTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        assertThat(context.getBeansOfType(SecurityFilterChain.class)).isNotEmpty();
    }

    @Test
    void mainMethodIsPresent() throws NoSuchMethodException {
        assertThat(ServerApplication.class.getMethod("main", String[].class)).isNotNull();
    }
}
