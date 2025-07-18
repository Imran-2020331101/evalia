package com.example.server.security.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender javaMailSender;

    @Autowired
    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Async
    public void sendEmail(MimeMessage email) {
        javaMailSender.send(email);
    }

    public MimeMessage createMimeMessage() {
        return javaMailSender.createMimeMessage();
    }

    /**
     * Sends verification email with OTP
     * 
     * @param to  recipient email address
     * @param otp one-time password for verification
     * @throws MessagingException if email cannot be sent
     */
    public void sendVerificationEmail(String to, String otp) throws MessagingException {
        MimeMessage mimeMessage = createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

        helper.setTo(to);
        helper.setSubject("Evalia - Complete Your Registration");

        String htmlContent = "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>"
                +
                "<h1 style='color:#3f51b5; text-align: center;'>Welcome to Evalia</h1>" +
                "<p>Thank you for registering. To complete your registration, please verify your email with the OTP below:</p>"
                +
                "<div style='background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;'>" +
                "<h2 style='color:#3f51b5; letter-spacing: 5px;'>" + otp + "</h2>" +
                "</div>" +
                "<p>This OTP will expire in 10 minutes.</p>" +
                "<p>If you did not request this, please ignore this email.</p>" +
                "<p>Thank you,<br/>The Aicademy Team</p>" +
                "</div>" +
                "</body>" +
                "</html>";

        helper.setText(htmlContent, true);
        sendEmail(mimeMessage);
    }
}
