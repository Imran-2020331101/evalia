package com.example.server.security.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class EmailConfig {

    @Autowired
    private Environment env;

    @Bean
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        String host = env.getProperty("EMAIL_HOST", "smtp.gmail.com");
        int port = Integer.parseInt(env.getProperty("EMAIL_PORT", "587"));
        String username = env.getProperty("EMAIL_USERNAME", "imranbinazad777@gmail.com");
        String password = env.getProperty("EMAIL_PASSWORD", "nudh yyjl msxi mokc");
        String auth = env.getProperty("EMAIL_SMTP_AUTH", "true");
        String starttls = env.getProperty("EMAIL_SMTP_STARTTLS", "true");
        String sslTrust = env.getProperty("EMAIL_SMTP_SSL_TRUST", "smtp.gmail.com");

        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", auth);
        props.put("mail.smtp.starttls.enable", starttls);
        props.put("mail.smtp.ssl.trust", sslTrust);

        return mailSender;
    }
}
