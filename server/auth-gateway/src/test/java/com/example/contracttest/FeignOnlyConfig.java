package com.example.contracttest;

import com.example.server.course.proxy.CourseProxy;
import com.example.server.job.Proxy.CompatibilityProxy;
import com.example.server.job.Proxy.InterviewProxy;
import com.example.server.job.Proxy.JobProxy;
import com.example.server.notification.Proxy.NotificationProxy;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.http.HttpMessageConvertersAutoConfiguration;
import org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.openfeign.FeignAutoConfiguration;

/**
 * Minimal context for Feign contract tests. Deliberately lives OUTSIDE the com.example.server package so the
 * real application's component scan never picks it up (it would register the same Feign clients twice).
 */
@SpringBootConfiguration
@ImportAutoConfiguration({JacksonAutoConfiguration.class, HttpMessageConvertersAutoConfiguration.class,
        FeignAutoConfiguration.class})
@EnableFeignClients(clients = {CourseProxy.class, CompatibilityProxy.class, InterviewProxy.class,
        JobProxy.class, NotificationProxy.class, ResumeJsonProxy.class})
public class FeignOnlyConfig {
}
