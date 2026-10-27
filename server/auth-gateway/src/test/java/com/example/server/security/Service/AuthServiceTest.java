package com.example.server.security.Service;

import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.security.DTO.*;
import com.example.server.security.JWT.JwtService;
import com.example.server.security.exception.InvalidTokenException;
import com.example.server.security.exception.TokenExpiredException;
import com.example.server.security.exception.UserAlreadyExistsException;
import com.example.server.security.models.ConfirmationToken;
import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.ConfirmationTokenRepository;
import com.example.server.security.repository.RoleRepository;
import com.example.server.security.repository.UserRepository;
import com.example.server.support.TestDataFactory;
import jakarta.mail.MessagingException;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private ConfirmationTokenRepository confirmationTokenRepository;
    @Mock
    private EmailService emailService;

    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(authenticationManager, userRepository, roleRepository, passwordEncoder,
                jwtService, confirmationTokenRepository, emailService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private LoginDto login(String email, String password) {
        LoginDto dto = new LoginDto();
        dto.setEmail(email);
        dto.setPassword(password);
        return dto;
    }

    private RegisterDto register() {
        RegisterDto dto = new RegisterDto();
        dto.setName("Jane");
        dto.setEmail("jane@example.com");
        dto.setPassword("pw");
        dto.setRole("USER");
        return dto;
    }

    private VerifyDTO verifyDto(String email, String otp) {
        VerifyDTO dto = new VerifyDTO();
        dto.setEmail(email);
        dto.setOtp(otp);
        return dto;
    }

    // ---------------------------------------------------------------- login

    @Test
    void loginReturnsTokenAndUserInfo() {
        userEntity user = TestDataFactory.user();
        Authentication auth = new TestingAuthenticationToken(user.getEmail(), "pw");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtService.generateToken(auth)).thenReturn("jwt");

        ResponseEntity<?> response = service.login(login(user.getEmail(), "pw"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        LoginResponseDTO body = (LoginResponseDTO) response.getBody();
        assertThat(body.getAccessToken()).isEqualTo("jwt");
        assertThat(body.getEmail()).isEqualTo(user.getEmail());
        assertThat(body.getName()).isEqualTo("Jane Doe");
        assertThat(body.getRoles()).isEqualTo(user.getRoles());
        assertThat(body.getTokenType()).isEqualTo("Bearer ");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isSameAs(auth);

        ArgumentCaptor<Authentication> captor = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(captor.capture());
        assertThat(captor.getValue()).isInstanceOf(UsernamePasswordAuthenticationToken.class);
        assertThat(captor.getValue().getCredentials()).isEqualTo("pw");
    }

    @Test
    void loginUnknownUserThrowsUserNotFound() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(login("ghost@example.com", "pw")))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("ghost@example.com");
        verifyNoInteractions(authenticationManager);
    }

    @Test
    void loginWithUnverifiedEmailIsUnauthorized() {
        userEntity user = TestDataFactory.user();
        user.setEmailVerified(false);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        ResponseEntity<?> response = service.login(login(user.getEmail(), "pw"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isEqualTo("Please verify your email before logging in");
        verifyNoInteractions(authenticationManager, jwtService);
    }

    @Test
    void loginWithBadPasswordPropagatesAuthenticationFailure() {
        userEntity user = TestDataFactory.user();
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> service.login(login(user.getEmail(), "wrong")))
                .isInstanceOf(BadCredentialsException.class);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    // ------------------------------------------------------------- register

    @Test
    void registerCreatesUserSendsOtpAndReturnsTemporaryToken() throws Exception {
        Role role = TestDataFactory.role("USER");
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pw")).thenReturn("hashed");
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(role));
        when(jwtService.generateTemporaryToken(any())).thenReturn("temp-jwt");

        ResponseEntity<?> response = service.register(register());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        RegistrationResponseDTO body = (RegistrationResponseDTO) response.getBody();
        assertThat(body.getData()).isEqualTo("User registered success!");
        assertThat(body.getAccessToken()).isEqualTo("temp-jwt");

        ArgumentCaptor<userEntity> userCaptor = ArgumentCaptor.forClass(userEntity.class);
        verify(userRepository).save(userCaptor.capture());
        userEntity saved = userCaptor.getValue();
        assertThat(saved.getEmail()).isEqualTo("jane@example.com");
        assertThat(saved.getName()).isEqualTo("Jane");
        assertThat(saved.getPassword()).isEqualTo("hashed");
        assertThat(saved.getRoles()).containsExactly(role);
        assertThat(saved.isEmailVerified()).isFalse();

        verify(confirmationTokenRepository).save(any(ConfirmationToken.class));
        verify(emailService).sendVerificationEmail(eq("jane@example.com"), matches("\\d{4}"));
    }

    @Test
    void registerRejectsExistingEmail() {
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(register()))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("jane@example.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerFailsForUnknownRole() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("pw")).thenReturn("hashed");
        when(roleRepository.findByName("USER")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.register(register()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Role not found");
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerPropagatesMailFailure() throws Exception {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("pw")).thenReturn("hashed");
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(TestDataFactory.role("USER")));
        doThrow(new MessagingException("smtp")).when(emailService).sendVerificationEmail(anyString(), anyString());

        assertThatThrownBy(() -> service.register(register())).isInstanceOf(MessagingException.class);
    }

    // --------------------------------------------------------- confirmEmail

    @Test
    void confirmEmailRejectsNullOtp() {
        assertThatThrownBy(() -> service.confirmEmail(verifyDto("a@b.com", null)))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Confirmation token cannot be empty");
    }

    @Test
    void confirmEmailRejectsBlankOtp() {
        assertThatThrownBy(() -> service.confirmEmail(verifyDto("a@b.com", "   ")))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void confirmEmailRejectsUnknownOtp() {
        when(confirmationTokenRepository.findByToken("1111")).thenReturn(null);

        assertThatThrownBy(() -> service.confirmEmail(verifyDto("a@b.com", "1111")))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Invalid OTP");
    }

    @Test
    void confirmEmailRejectsAndDeletesExpiredToken() {
        ConfirmationToken token = new ConfirmationToken(1234, "a@b.com", LocalDateTime.now().minusMinutes(1));
        token.setId(new ObjectId());
        when(confirmationTokenRepository.findByToken("1234")).thenReturn(token);

        assertThatThrownBy(() -> service.confirmEmail(verifyDto("a@b.com", "1234")))
                .isInstanceOf(TokenExpiredException.class);
        verify(confirmationTokenRepository).deleteById(token.getId());
        verify(userRepository, never()).save(any());
    }

    @Test
    void confirmEmailMarksUserVerifiedAndDeletesToken() {
        userEntity user = TestDataFactory.user("a@b.com", "USER");
        user.setEmailVerified(false);
        ConfirmationToken token = new ConfirmationToken(1234, "a@b.com", LocalDateTime.now().plusMinutes(5));
        token.setId(new ObjectId());
        when(confirmationTokenRepository.findByToken("1234")).thenReturn(token);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        String result = service.confirmEmail(verifyDto("a@b.com", "1234"));

        assertThat(result).isEqualTo("Email verified successfully");
        assertThat(user.isEmailVerified()).isTrue();
        verify(userRepository).save(user);
        verify(confirmationTokenRepository).deleteById(token.getId());
    }

    @Test
    void confirmEmailAcceptsTokenWithoutExpiryDate() {
        userEntity user = TestDataFactory.user("a@b.com", "USER");
        user.setEmailVerified(false);
        ConfirmationToken token = new ConfirmationToken(1234, "a@b.com", null);
        token.setId(new ObjectId());
        when(confirmationTokenRepository.findByToken("1234")).thenReturn(token);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        assertThat(service.confirmEmail(verifyDto("a@b.com", "1234"))).isEqualTo("Email verified successfully");
    }

    @Test
    void confirmEmailReportsAlreadyVerified() {
        userEntity user = TestDataFactory.user("a@b.com", "USER"); // already verified
        ConfirmationToken token = new ConfirmationToken(1234, "a@b.com", LocalDateTime.now().plusMinutes(5));
        token.setId(new ObjectId());
        when(confirmationTokenRepository.findByToken("1234")).thenReturn(token);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        assertThat(service.confirmEmail(verifyDto("a@b.com", "1234"))).isEqualTo("Email is already verified");
        verify(confirmationTokenRepository).deleteById(token.getId());
        verify(userRepository, never()).save(any());
    }

    @Test
    void confirmEmailFailsWhenUserForTokenIsMissing() {
        ConfirmationToken token = new ConfirmationToken(1234, "a@b.com", LocalDateTime.now().plusMinutes(5));
        token.setId(new ObjectId());
        when(confirmationTokenRepository.findByToken("1234")).thenReturn(token);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.confirmEmail(verifyDto("a@b.com", "1234")))
                .isInstanceOf(UserNotFoundException.class);
    }

    /**
     * BUG CHARACTERISATION: when the OTP belongs to a different email than the one supplied, the service
     * still consumes the token and reports success, without verifying anybody.
     */
    @Test
    void confirmEmailWithMismatchedEmailReportsSuccessWithoutVerifying() {
        ConfirmationToken token = new ConfirmationToken(1234, "owner@b.com", LocalDateTime.now().plusMinutes(5));
        token.setId(new ObjectId());
        when(confirmationTokenRepository.findByToken("1234")).thenReturn(token);

        String result = service.confirmEmail(verifyDto("other@b.com", "1234"));

        assertThat(result).isEqualTo("Email verified successfully");
        verify(userRepository, never()).save(any());
        verify(confirmationTokenRepository).deleteById(token.getId());
    }

    @Test
    void confirmEmailWithTokenLackingEmailReportsSuccessWithoutVerifying() {
        ConfirmationToken token = new ConfirmationToken(1234, null, LocalDateTime.now().plusMinutes(5));
        token.setId(new ObjectId());
        when(confirmationTokenRepository.findByToken("1234")).thenReturn(token);

        assertThat(service.confirmEmail(verifyDto("a@b.com", "1234"))).isEqualTo("Email verified successfully");
        verify(userRepository, never()).save(any());
    }

    // ------------------------------------------------- sendConfirmationToken

    @Test
    void sendConfirmationTokenStoresFourDigitOtpExpiringInTenMinutesAndEmailsIt() throws Exception {
        service.sendConfirmationToken("a@b.com");

        ArgumentCaptor<ConfirmationToken> captor = ArgumentCaptor.forClass(ConfirmationToken.class);
        verify(confirmationTokenRepository).save(captor.capture());
        ConfirmationToken saved = captor.getValue();
        assertThat(saved.getToken()).matches("[1-9]\\d{3}");
        assertThat(saved.getUserEmail()).isEqualTo("a@b.com");
        assertThat(saved.getExpiryDate())
                .isBetween(LocalDateTime.now().plusMinutes(9), LocalDateTime.now().plusMinutes(11));
        verify(emailService).sendVerificationEmail("a@b.com", saved.getToken());
    }

    // ------------------------------------------- resendVerificationEmail

    @Test
    void resendRejectsNullEmail() throws Exception {
        ResponseEntity<?> response = service.resendVerificationEmail(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Email is required");
    }

    @Test
    void resendRejectsBlankEmail() throws Exception {
        assertThat(service.resendVerificationEmail("  ").getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void resendUnknownUserThrows() {
        when(userRepository.findByEmail("ghost@b.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resendVerificationEmail("ghost@b.com"))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void resendForVerifiedUserIsBadRequest() throws Exception {
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(TestDataFactory.user("a@b.com", "USER")));

        ResponseEntity<?> response = service.resendVerificationEmail("a@b.com");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Email is already verified");
        verifyNoInteractions(emailService);
    }

    @Test
    void resendSendsNewOtpForUnverifiedUser() throws Exception {
        userEntity user = TestDataFactory.user("a@b.com", "USER");
        user.setEmailVerified(false);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        ResponseEntity<?> response = service.resendVerificationEmail("a@b.com");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Verification email sent successfully");
        verify(emailService).sendVerificationEmail(eq("a@b.com"), anyString());
    }

    // ------------------------------------------------------------ updateRole

    @Test
    void updateRoleReplacesAllRolesWithTheNewOne() {
        userEntity user = TestDataFactory.user("a@b.com", "USER", "OTHER");
        user.setRoles(new ArrayList<>(user.getRoles()));
        Role admin = TestDataFactory.role("ADMIN");
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(admin));

        service.updateRole("a@b.com", "ADMIN");

        assertThat(user.getRoles()).containsExactly(admin);
        verify(userRepository).save(user);
    }

    @Test
    void updateRoleUnknownUser() {
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateRole("a@b.com", "ADMIN")).isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void updateRoleUnknownRole() {
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(TestDataFactory.user("a@b.com", "USER")));
        when(roleRepository.findByName("NOPE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateRole("a@b.com", "NOPE"))
                .isInstanceOf(IllegalArgumentException.class);
        verify(userRepository, never()).save(any());
    }

    // ---------------------------------------------- temporarilyAuthenticate

    @Test
    void temporarilyAuthenticateSetsSecurityContextAndReturnsTemporaryToken() {
        userEntity user = TestDataFactory.user();
        when(jwtService.generateTemporaryToken(any())).thenReturn("temp");

        String token = service.temporarilyAuthenticate(user);

        assertThat(token).isEqualTo("temp");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth.getPrincipal()).isSameAs(user);
        assertThat(auth.getAuthorities()).extracting(Object::toString).containsExactly("USER");
    }
}
