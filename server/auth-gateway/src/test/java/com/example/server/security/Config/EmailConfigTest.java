package com.example.server.security.Config;

import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class EmailConfigTest {

    @Test
    void usesEnvironmentOverrides() {
        MockEnvironment env = new MockEnvironment()
                .withProperty("EMAIL_HOST", "smtp.test")
                .withProperty("EMAIL_PORT", "2525")
                .withProperty("EMAIL_USERNAME", "user")
                .withProperty("EMAIL_PASSWORD", "pass")
                .withProperty("EMAIL_SMTP_AUTH", "false")
                .withProperty("EMAIL_SMTP_STARTTLS", "false")
                .withProperty("EMAIL_SMTP_SSL_TRUST", "smtp.test");

        JavaMailSenderImpl sender = (JavaMailSenderImpl) new EmailConfig(env).getJavaMailSender();

        assertThat(sender.getHost()).isEqualTo("smtp.test");
        assertThat(sender.getPort()).isEqualTo(2525);
        assertThat(sender.getUsername()).isEqualTo("user");
        assertThat(sender.getPassword()).isEqualTo("pass");
        assertThat(sender.getJavaMailProperties())
                .containsEntry("mail.smtp.auth", "false")
                .containsEntry("mail.smtp.starttls.enable", "false")
                .containsEntry("mail.smtp.ssl.trust", "smtp.test");
    }

    /** The SMTP password must only ever come from EMAIL_PASSWORD; there is no committed fallback. */
    @Test
    void fallsBackToGmailDefaultsWhenNothingConfigured() {
        JavaMailSenderImpl sender = (JavaMailSenderImpl) new EmailConfig(new MockEnvironment()).getJavaMailSender();

        assertThat(sender.getHost()).isEqualTo("smtp.gmail.com");
        assertThat(sender.getPort()).isEqualTo(587);
        assertThat(sender.getPassword()).isNull();
        assertThat(sender.getJavaMailProperties()).containsEntry("mail.smtp.starttls.enable", "true");
    }
}
