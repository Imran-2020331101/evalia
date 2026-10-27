package com.example.server.security.Controller;

import com.example.server.security.models.ConfirmationToken;
import com.example.server.security.models.userEntity;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** /api/auth/** is permitAll: these run through the real security chain, services, BCrypt and JWT. */
class AuthControllerIT extends AbstractIntegrationTest {

    private static final String EMAIL = TestDataFactory.EMAIL;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void loginWithCorrectPasswordReturnsJwtThatIsAcceptedByProtectedEndpoints() throws Exception {
        userEntity user = givenUser(EMAIL);
        user.setPassword(passwordEncoder.encode("s3cret"));

        String response = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"s3cret\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.roles[0].name").value("USER"))
                .andExpect(jsonPath("$.tokenType").value("Bearer "))
                .andReturn().getResponse().getContentAsString();

        String token = com.jayway.jsonpath.JsonPath.read(response, "$.accessToken");
        assertThat(jwtService.validateToken(token)).isTrue();
        assertThat(jwtService.getEmailFromToken(token)).isEqualTo(EMAIL);
    }

    /** Finding: AuthenticationException is not handled by GlobalExceptionHandler, so bad credentials give 500. */
    @Test
    void loginWithWrongPasswordCurrentlyYields500() throws Exception {
        userEntity user = givenUser(EMAIL);
        user.setPassword(passwordEncoder.encode("s3cret"));

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"wrong\"}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void loginForUnknownEmailIs404() throws Exception {
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ghost@example.com\",\"password\":\"x\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("ghost@example.com")));
    }

    @Test
    void loginForUnverifiedEmailIs401() throws Exception {
        givenUser(EMAIL).setEmailVerified(false);

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"x\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Please verify your email before logging in"));
    }

    @Test
    void registerCreatesUserSendsEmailAndReturnsTemporaryToken() throws Exception {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        when(javaMailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));

        String response = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New\",\"email\":\"new@example.com\",\"password\":\"pw\",\"role\":\"USER\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("User registered success!"))
                .andReturn().getResponse().getContentAsString();

        ArgumentCaptor<userEntity> saved = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(saved.capture());
        assertThat(passwordEncoder.matches("pw", saved.getValue().getPassword())).isTrue();
        verify(confirmationTokenRepository).save(any(ConfirmationToken.class));
        verify(javaMailSender).send(any(MimeMessage.class));
        String token = com.jayway.jsonpath.JsonPath.read(response, "$.accessToken");
        assertThat(jwtService.getEmailFromToken(token)).isEqualTo("new@example.com");
    }

    @Test
    void registerExistingEmailIs409() throws Exception {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"pw\",\"role\":\"USER\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void registerWhenSmtpFailsIs500BecauseSendFailureIsRuntime() throws Exception {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        when(javaMailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
        doThrow(new org.springframework.mail.MailSendException("smtp down")).when(javaMailSender).send(any(MimeMessage.class));

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"new@example.com\",\"password\":\"pw\",\"role\":\"USER\"}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void verifyWithCorrectOtpMarksUserVerified() throws Exception {
        userEntity user = givenUser(EMAIL);
        user.setEmailVerified(false);
        ConfirmationToken token = new ConfirmationToken(4321, EMAIL, LocalDateTime.now().plusMinutes(5));
        token.setId(new org.bson.types.ObjectId());
        when(confirmationTokenRepository.findByToken("4321")).thenReturn(token);

        mockMvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + EMAIL + "\",\"otp\":\"4321\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Email verified successfully"));

        assertThat(user.isEmailVerified()).isTrue();
        verify(confirmationTokenRepository).deleteById(token.getId());
    }

    @Test
    void verifyWithUnknownOtpIs400() throws Exception {
        mockMvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + EMAIL + "\",\"otp\":\"0000\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid Token"));
    }

    @Test
    void verifyWithoutOtpIs400() throws Exception {
        mockMvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + EMAIL + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("OTP is required"));
    }

    @Test
    void resendVerificationForUnverifiedUser() throws Exception {
        givenUser(EMAIL).setEmailVerified(false);
        when(javaMailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));

        mockMvc.perform(post("/api/auth/resend-verification").contentType(MediaType.TEXT_PLAIN).content(EMAIL))
                .andExpect(status().isOk())
                .andExpect(content().string("Verification email sent successfully"));
        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void resendVerificationForVerifiedUserIs400() throws Exception {
        givenUser(EMAIL);

        mockMvc.perform(post("/api/auth/resend-verification").contentType(MediaType.TEXT_PLAIN).content(EMAIL))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Email is already verified"));
    }

    /**
     * SECURITY FINDING: /api/auth/update/role sits under the permitAll "/api/auth/**" matcher, so any anonymous
     * caller can reach it. (Today it additionally fails because the controller swaps email/role, but once that
     * argument bug is fixed anybody could grant themselves ADMIN.)
     */
    @Test
    void updateRoleIsReachableWithoutAuthentication() throws Exception {
        mockMvc.perform(post("/api/auth/update/role").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + EMAIL + "\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isNotFound()); // reached the service (not 401/403); swapped args => user "ADMIN" not found

        verify(userRepository).findByEmail("ADMIN");
        verify(userRepository, never()).save(any());
    }
}
