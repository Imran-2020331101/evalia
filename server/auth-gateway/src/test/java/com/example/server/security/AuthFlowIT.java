package com.example.server.security;

import com.example.server.security.models.ConfirmationToken;
import com.example.server.security.models.userEntity;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import com.jayway.jsonpath.JsonPath;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Whole onboarding journey through the real stack with stateful in-memory stand-ins for the Mongo repositories:
 * register -> (cannot login yet) -> verify OTP -> login -> call a protected API with the issued JWT.
 */
class AuthFlowIT extends AbstractIntegrationTest {

    private final Map<String, userEntity> users = new HashMap<>();
    private final Map<String, ConfirmationToken> tokens = new HashMap<>();

    @BeforeEach
    void statefulRepositories() {
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        when(userRepository.existsByEmail(anyString())).thenAnswer(inv -> users.containsKey(inv.<String>getArgument(0)));
        when(userRepository.findByEmail(anyString()))
                .thenAnswer(inv -> Optional.ofNullable(users.get(inv.<String>getArgument(0))));
        when(userRepository.save(any(userEntity.class))).thenAnswer(inv -> {
            userEntity u = inv.getArgument(0);
            if (u.getId() == null) {
                u.setId(new ObjectId());
            }
            users.put(u.getEmail(), u);
            return u;
        });
        when(confirmationTokenRepository.save(any(ConfirmationToken.class))).thenAnswer(inv -> {
            ConfirmationToken t = inv.getArgument(0);
            tokens.put(t.getToken(), t);
            return t;
        });
        when(confirmationTokenRepository.findByToken(anyString()))
                .thenAnswer(inv -> tokens.get(inv.<String>getArgument(0)));
        when(javaMailSender.createMimeMessage()).thenAnswer(inv -> new MimeMessage(Session.getInstance(new Properties())));
        when(jobProxy.getAllActiveJobs()).thenReturn(ResponseEntity.ok("[]"));
    }

    @Test
    void registerVerifyLoginAndUseTheToken() throws Exception {
        // 1. register
        String registerResponse = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Flo\",\"email\":\"flo@example.com\",\"password\":\"pw123\",\"role\":\"USER\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String temporaryToken = JsonPath.read(registerResponse, "$.accessToken");
        assertThat(users).containsKey("flo@example.com");
        assertThat(tokens).hasSize(1);

        // the temporary token already identifies the user (used for onboarding: resume upload, org creation)
        assertThat(jwtService.getEmailFromToken(temporaryToken)).isEqualTo("flo@example.com");

        // 2. login is refused until the email is verified
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"flo@example.com\",\"password\":\"pw123\"}"))
                .andExpect(status().isUnauthorized());

        // 3. verify with the OTP that was stored (and emailed)
        String otp = tokens.keySet().iterator().next();
        mockMvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"flo@example.com\",\"otp\":\"" + otp + "\"}"))
                .andExpect(status().isOk());
        assertThat(users.get("flo@example.com").isEmailVerified()).isTrue();

        // 4. login
        String loginResponse = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"flo@example.com\",\"password\":\"pw123\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String accessToken = JsonPath.read(loginResponse, "$.accessToken");

        // 5. use it
        mockMvc.perform(get("/api/job/active-jobs").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    @Test
    void registeringTheSameEmailTwiceIsAConflict() throws Exception {
        String body = "{\"name\":\"Flo\",\"email\":\"dup@example.com\",\"password\":\"pw\",\"role\":\"USER\"}";
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void otpCanOnlyBeUsedOnce() throws Exception {
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"once@example.com\",\"password\":\"pw\",\"role\":\"USER\"}"))
                .andExpect(status().isOk());
        String otp = tokens.keySet().iterator().next();
        String verify = "{\"email\":\"once@example.com\",\"otp\":\"" + otp + "\"}";

        mockMvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON).content(verify))
                .andExpect(status().isOk());
        // deleteById on the mock does not remove it from the fake map; emulate the real repository
        tokens.remove(otp);

        mockMvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON).content(verify))
                .andExpect(status().isBadRequest());
    }
}
