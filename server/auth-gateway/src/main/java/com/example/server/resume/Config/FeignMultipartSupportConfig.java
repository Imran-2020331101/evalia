package com.example.server.resume.Config;

import feign.form.spring.SpringFormEncoder;
import feign.codec.Encoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import feign.Client;
import okhttp3.OkHttpClient;
import java.util.concurrent.TimeUnit;

public class FeignMultipartSupportConfig {
    @Bean
    public Encoder feignFormEncoder() {
        return new SpringFormEncoder();
    }

    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.MINUTES)
                .readTimeout(10, TimeUnit.MINUTES)
                .writeTimeout(10, TimeUnit.MINUTES)
                .build();
    }

    @Bean
    public Client feignClient(OkHttpClient okHttpClient) {
        return new feign.okhttp.OkHttpClient(okHttpClient);
    }
}