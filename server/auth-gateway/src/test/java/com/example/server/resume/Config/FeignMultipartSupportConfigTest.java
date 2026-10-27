package com.example.server.resume.Config;

import feign.Client;
import feign.Logger;
import feign.codec.Encoder;
import okhttp3.OkHttpClient;
import org.junit.jupiter.api.Test;

import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class FeignMultipartSupportConfigTest {

    private final FeignMultipartSupportConfig config = new FeignMultipartSupportConfig();

    @Test
    void usesFormEncoderForMultipart() {
        Encoder encoder = config.feignFormEncoder();

        assertThat(encoder).isInstanceOf(feign.form.spring.SpringFormEncoder.class);
    }

    @Test
    void okHttpClientHasTenMinuteTimeoutsForSlowResumeParsing() {
        OkHttpClient client = config.okHttpClient();

        int tenMinutes = (int) TimeUnit.MINUTES.toMillis(10);
        assertThat(client.connectTimeoutMillis()).isEqualTo(tenMinutes);
        assertThat(client.readTimeoutMillis()).isEqualTo(tenMinutes);
        assertThat(client.writeTimeoutMillis()).isEqualTo(tenMinutes);
    }

    @Test
    void feignClientWrapsOkHttpAndLoggingIsFull() {
        Client client = config.feignClient(config.okHttpClient());

        assertThat(client).isInstanceOf(feign.okhttp.OkHttpClient.class);
        assertThat(config.feignLoggerLevel()).isEqualTo(Logger.Level.FULL);
    }
}
