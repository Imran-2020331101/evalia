package com.example.server.security.Controller;

import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.exception.handler.GlobalExceptionHandler;
import com.example.server.security.DTO.LoginDto;
import com.example.server.security.DTO.LoginResponseDTO;
import com.example.server.security.DTO.RegisterDto;
import com.example.server.security.DTO.RegistrationResponseDTO;
import com.example.server.security.DTO.VerifyDTO;
import com.example.server.security.Service.AuthService;
import com.example.server.security.exception.InvalidTokenException;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;
    @InjectMocks
    private AuthController controller;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void loginDelegatesToService() throws Exception {
        LoginResponseDTO dto = new LoginResponseDTO("Jane", "jane@example.com", new ArrayList<>(), "jwt");
        doReturn(ResponseEntity.ok(dto)).when(authService).login(any(LoginDto.class));

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"jane@example.com\",\"password\":\"pw\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt"))
                .andExpect(jsonPath("$.email").value("jane@example.com"));

        ArgumentCaptor<LoginDto> captor = ArgumentCaptor.forClass(LoginDto.class);
        verify(authService).login(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("pw");
    }

    @Test
    void loginUnknownUserIsMappedTo404ByAdvice() throws Exception {
        when(authService.login(any())).thenThrow(new UserNotFoundException("nope"));

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"x@y.z\",\"password\":\"pw\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("nope"));
    }

    @Test
    void registerDelegatesToService() throws Exception {
        doReturn(ResponseEntity.ok(new RegistrationResponseDTO("ok", "temp")))
                .when(authService).register(any(RegisterDto.class));

        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"J\",\"email\":\"j@x.com\",\"password\":\"pw\",\"role\":\"USER\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("temp"));

        ArgumentCaptor<RegisterDto> captor = ArgumentCaptor.forClass(RegisterDto.class);
        verify(authService).register(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo("USER");
    }

    @Test
    void registerMailFailureMapsTo503() throws Exception {
        when(authService.register(any())).thenThrow(new MessagingException("smtp down"));

        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"j@x.com\",\"password\":\"pw\",\"role\":\"USER\"}"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void verifyRequiresOtp() throws Exception {
        mvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"j@x.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("OTP is required"));
        verifyNoInteractions(authService);
    }

    @Test
    void verifyRejectsBlankOtp() throws Exception {
        mvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"j@x.com\",\"otp\":\"  \"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(authService);
    }

    @Test
    void verifySuccessReturnsServiceMessage() throws Exception {
        when(authService.confirmEmail(any(VerifyDTO.class))).thenReturn("Email verified successfully");

        mvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"j@x.com\",\"otp\":\"1234\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Email verified successfully"));
    }

    @Test
    void verifyUserNotFoundMapsTo404() throws Exception {
        when(authService.confirmEmail(any())).thenThrow(new UserNotFoundException("User not found for the given token"));

        mvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"j@x.com\",\"otp\":\"1234\"}"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Invalid Token"));
    }

    @Test
    void verifyInvalidOrExpiredOtpMapsTo400() throws Exception {
        when(authService.confirmEmail(any())).thenThrow(new InvalidTokenException("Invalid OTP"));

        mvc.perform(post("/api/auth/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"j@x.com\",\"otp\":\"1234\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid Token"));
    }

    @Test
    void resendVerificationPassesRawBodyAsEmail() throws Exception {
        doReturn(new ResponseEntity<>("Verification email sent successfully", HttpStatus.OK))
                .when(authService).resendVerificationEmail("j@x.com");

        mvc.perform(post("/api/auth/resend-verification").contentType(MediaType.TEXT_PLAIN).content("j@x.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("Verification email sent successfully"));
    }

    /**
     * BUG CHARACTERISATION: the controller calls updateRole(body.get("role"), body.get("email")) while the
     * service signature is updateRole(email, roleName), so the arguments are swapped and the endpoint cannot work
     * as intended. This test pins the current (wrong) behaviour; fix the controller and flip the assertion.
     */
    @Test
    void updateRoleCurrentlySwapsEmailAndRoleArguments() throws Exception {
        mvc.perform(post("/api/auth/update/role").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"j@x.com\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Role updated successfully"));

        verify(authService).updateRole("ADMIN", "j@x.com"); // should be ("j@x.com", "ADMIN")
    }
}
