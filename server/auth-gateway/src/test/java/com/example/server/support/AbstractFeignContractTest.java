package com.example.server.support;

import com.example.contracttest.FeignOnlyConfig;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Base for Feign "contract" tests: the REAL Feign clients (built by Spring Cloud OpenFeign from the production
 * interfaces, with property placeholders resolved) are pointed at an in-JVM fake HTTP server. The tests assert the
 * HTTP verb, path, query, headers and body each proxy method produces, and how responses are decoded.
 * No other part of the application is started.
 */
@SpringBootTest(classes = FeignOnlyConfig.class)
public abstract class AbstractFeignContractTest {

    protected static final FakeHttpServer SERVER = new FakeHttpServer();

    @DynamicPropertySource
    static void serviceUrls(DynamicPropertyRegistry registry) {
        registry.add("resume.service.url", SERVER::baseUrl);
        registry.add("job.service.url", SERVER::baseUrl);
        registry.add("interview.service.url", SERVER::baseUrl);
        registry.add("notification.service.url", SERVER::baseUrl);
    }

    @BeforeEach
    void resetServer() {
        SERVER.reply(200, "");
    }
}
