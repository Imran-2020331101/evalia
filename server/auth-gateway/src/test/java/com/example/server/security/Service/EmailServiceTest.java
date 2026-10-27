package com.example.server.security.Service;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService service;

    @BeforeEach
    void setUp() {
        service = new EmailService(mailSender);
    }

    @Test
    void createMimeMessageDelegatesToSender() {
        MimeMessage message = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(message);

        assertThat(service.createMimeMessage()).isSameAs(message);
    }

    @Test
    void sendEmailDelegatesToSender() {
        MimeMessage message = new MimeMessage((Session) null);

        service.sendEmail(message);

        verify(mailSender).send(message);
    }

    @Test
    void sendVerificationEmailBuildsHtmlMessageWithOtp() throws Exception {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(message);

        service.sendVerificationEmail("user@example.com", "4821");

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        MimeMessage sent = captor.getValue();
        assertThat(sent.getSubject()).isEqualTo("Evalia - Complete Your Registration");
        assertThat(sent.getRecipients(Message.RecipientType.TO)).hasSize(1);
        assertThat(sent.getRecipients(Message.RecipientType.TO)[0].toString()).isEqualTo("user@example.com");
        sent.saveChanges();
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        sent.writeTo(out);
        assertThat(out.toString()).contains("4821").contains("Welcome to Evalia");
    }

    @Test
    void sendVerificationEmailRejectsInvalidAddress() {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(message);

        assertThatThrownBy(() -> service.sendVerificationEmail("not an address <<", "1234"))
                .isInstanceOf(MessagingException.class);
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendFailuresPropagate() {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(message);
        doThrow(new MailSendException("smtp down")).when(mailSender).send(any(MimeMessage.class));

        assertThatThrownBy(() -> service.sendVerificationEmail("user@example.com", "1234"))
                .isInstanceOf(MailSendException.class);
    }
}
