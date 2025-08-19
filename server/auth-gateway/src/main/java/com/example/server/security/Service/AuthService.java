package com.example.server.security.Service;

import com.example.server.security.JWT.JwtService;
import com.example.server.security.authDTO.LoginDto;
import com.example.server.security.authDTO.LoginResponseDTO;
import com.example.server.security.authDTO.RegisterDto;
import com.example.server.security.authDTO.VerifyDTO;
import com.example.server.security.models.ConfirmationToken;
import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.ConfirmationTokenRepository;
import com.example.server.security.repository.RoleRepository;
import com.example.server.security.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class AuthService {

    private static final Logger logger = Logger.getLogger(AuthService.class.getName());

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final EmailService emailService;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ConfirmationTokenRepository confirmationTokenRepository,
            EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.confirmationTokenRepository = confirmationTokenRepository;
        this.emailService = emailService;
    }

    public ResponseEntity<?> login(LoginDto loginDto) {
        // Input validation
        if (loginDto.getEmail() == null || loginDto.getEmail().trim().isEmpty()) {
            return new ResponseEntity<>("Email is required", HttpStatus.BAD_REQUEST);
        }
        if (loginDto.getPassword() == null || loginDto.getPassword().trim().isEmpty()) {
            return new ResponseEntity<>("Password is required", HttpStatus.BAD_REQUEST);
        }

        try {
            // Check if user exists first
            if (!userRepository.existsByEmail(loginDto.getEmail())) {
                logger.warning("Login attempt with non-existent email: " + loginDto.getEmail());
                return new ResponseEntity<>("User with this email does not exist", HttpStatus.NOT_FOUND);
            }

            // Check if a user account is verified
            userEntity user = userRepository.findByEmail(loginDto.getEmail()).orElse(null);
            if (user == null) {
                logger.warning("User not found during login: " + loginDto.getEmail());
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }

            if (!user.isEmailVerified()) {
                logger.warning("Login attempt with unverified email: " + loginDto.getEmail());
                return new ResponseEntity<>("Please verify your email before logging in", HttpStatus.UNAUTHORIZED);
            }

            // Attempt authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getEmail(),
                            loginDto.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtService.generateToken(authentication);

            // Create comprehensive login response with user info
            LoginResponseDTO loginResponse = new LoginResponseDTO();
            loginResponse.setName(user.getName());
            loginResponse.setEmail(user.getEmail());
            loginResponse.setRoles(user.getRoles());
            loginResponse.setAccessToken(token);

            logger.info("Successful login for user: " + loginDto.getEmail());
            return new ResponseEntity<>(loginResponse, HttpStatus.OK);

        } catch (Exception e) {
            logger.severe("Unexpected error during login for email: " + loginDto.getEmail() + " - " + e.getMessage());
            return new ResponseEntity<>("An unexpected error occurred during login", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> register(RegisterDto registerDto) {

        if (Boolean.TRUE.equals(userRepository.existsByEmail(registerDto.getEmail()))) {
            return new ResponseEntity<>("Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        userEntity user = new userEntity();
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode((registerDto.getPassword())));

        logger.info("Registration details set for user: " + registerDto.getEmail() + registerDto.getRole());

        Role roles = roleRepository.findByName(registerDto.getRole()).get();
        user.setRoles(Collections.singletonList(roles));
        logger.info("Roles set for registration");

        userRepository.save(user);

        try {
            sendConfirmationToken(registerDto.getEmail());
        } catch (MessagingException e) {
            throw new RuntimeException("Unable to send Mail from User Service");
        }

        return new ResponseEntity<>("User registered success!", HttpStatus.OK);
    }

    public String confirmEmail(VerifyDTO verifyDTO) throws Exception {

        String confirmationToken = verifyDTO.getOtp();
        String email = verifyDTO.getEmail();

        logger.info("Received OTP for verification: " + confirmationToken + " for email: " + email);

        // Input validation
        if (confirmationToken == null || confirmationToken.trim().isEmpty()) {
            throw new Exception("Confirmation token cannot be empty");
        }

        Optional<ConfirmationToken> token = Optional.ofNullable(
                confirmationTokenRepository.findByToken(confirmationToken));

        if (token.isPresent()) {
            logger.info("Token found in database for verification: " + confirmationToken);
            ConfirmationToken confirmToken = token.get();

            // Check if token has expired
            if (confirmToken.getExpiryDate() != null &&
                    confirmToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                logger.warning("Expired token used: " + confirmationToken);
                confirmationTokenRepository.deleteById(confirmToken.getId());
                throw new Exception("OTP has expired. Please request a new one.");
            }

            logger.info("Valid token found for verification");

            // Get the user associated with this token and mark as verified
            String userEmail = confirmToken.getUserEmail();
            if (userEmail != null && userEmail.equals(email)) {
                userEntity user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new Exception("User not found for the given token"));

                // Check if already verified
                if (user.isEmailVerified()) {
                    confirmationTokenRepository.deleteById(confirmToken.getId());
                    return "Email is already verified";
                }

                user.setEmailVerified(true);
                userRepository.save(user);
                logger.info("Email verified successfully for user: " + userEmail);
            }

            confirmationTokenRepository.deleteById(confirmToken.getId());
            return "Email verified successfully";
        }

        logger.warning("Invalid token attempted: " + confirmationToken);
        throw new Exception("Invalid OTP. Please check your OTP and try again.");
    }

    public void sendConfirmationToken(String email) throws MessagingException {
        SecureRandom random = new SecureRandom();
        int randomNumber = 1000 + random.nextInt(9000);
        String otpString = String.valueOf(randomNumber);

        ConfirmationToken confirmationToken = new ConfirmationToken(randomNumber);
        confirmationToken.setUserEmail(email);

        // Set expiration time (10 minutes from now)
        confirmationToken.setExpiryDate(LocalDateTime.now().plusMinutes(10));

        confirmationTokenRepository.save(confirmationToken);

        // Use the EmailService to send the verification email
        emailService.sendVerificationEmail(email, otpString);

        logger.info("Confirmation Token: " + confirmationToken.getToken());
    }

    public ResponseEntity<?> resendVerificationEmail(String email) {
        // Input validation
        if (email == null || email.trim().isEmpty()) {
            return new ResponseEntity<>("Email is required", HttpStatus.BAD_REQUEST);
        }

        try {
            // Check if user exists
            if (!userRepository.existsByEmail(email)) {
                logger.warning("Resend verification attempted for non-existent email: " + email);
                return new ResponseEntity<>("User with this email does not exist", HttpStatus.NOT_FOUND);
            }

            // Check if user is already verified
            userEntity user = userRepository.findByEmail(email).orElse(null);
            if (user != null && user.isEmailVerified()) {
                return new ResponseEntity<>("Email is already verified", HttpStatus.BAD_REQUEST);
            }

            // Send new verification token
            sendConfirmationToken(email);
            logger.info("Verification email resent successfully to: " + email);
            return new ResponseEntity<>("Verification email sent successfully", HttpStatus.OK);

        } catch (MessagingException e) {
            logger.severe("Failed to send verification email to: " + email + " - " + e.getMessage());
            return new ResponseEntity<>("Failed to send verification email. Please try again later.",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            logger.severe("Unexpected error while resending verification email to: " + email + " - " + e.getMessage());
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
