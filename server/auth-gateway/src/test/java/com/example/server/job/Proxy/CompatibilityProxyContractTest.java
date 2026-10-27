package com.example.server.job.Proxy;

import com.example.server.support.AbstractFeignContractTest;
import com.example.server.support.FakeHttpServer.Recorded;
import feign.FeignException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CompatibilityProxyContractTest extends AbstractFeignContractTest {

    @Autowired
    private CompatibilityProxy proxy;

    @Test
    void getsReviewById() {
        SERVER.reply(200, "{\"score\":88}");

        assertThat(proxy.getCompatibilityReviewById("r1").getBody()).isEqualTo("{\"score\":88}");

        Recorded request = SERVER.lastRequest();
        assertThat(request.method()).isEqualTo("GET");
        assertThat(request.path()).isEqualTo("/api/compatibility/r1");
    }

    @Test
    void notFoundSurfacesAsFeignException() {
        SERVER.reply(404, "");

        assertThatThrownBy(() -> proxy.getCompatibilityReviewById("missing")).isInstanceOf(FeignException.NotFound.class);
    }
}
