package com.example.server.security.Controller;

import com.example.server.security.JWT.JwtService;
import com.example.server.security.Service.CustomUserDetailsService;

import com.example.server.security.authDTO.AuthResponseDTO;
import com.example.server.security.authDTO.LoginDto;
import com.example.server.security.authDTO.RegisterDto;
import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.example.server.security.authDTO.VerifyDTO;
import com.example.server.security.repository.RoleRepository;
import com.example.server.security.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.logging.Logger;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and registration endpoints")
public class AuthController {

    private static final Logger logger = Logger.getLogger(AuthController.class.getName());

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService userService;

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CustomUserDetailsService userService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Operation(summary = "User login")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful login", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponseDTO.class)) }),
            @ApiResponse(responseCode = "400", description = "Invalid email or password", content = @Content),
            @ApiResponse(responseCode = "401", description = "Account not verified", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
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

            // Check if user account is verified
            userEntity user = userRepository.findByEmail(loginDto.getEmail()).orElse(null);
            if (user != null && !user.isEmailVerified()) {
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

            logger.info("Successful login for user: " + loginDto.getEmail());
            return new ResponseEntity<>(new AuthResponseDTO(token), HttpStatus.OK);

        } catch (BadCredentialsException e) {
            logger.warning("Invalid password attempt for email: " + loginDto.getEmail());
            return new ResponseEntity<>("Invalid email or password", HttpStatus.BAD_REQUEST);
        } catch (DisabledException e) {
            logger.warning("Disabled account login attempt: " + loginDto.getEmail());
            return new ResponseEntity<>("Account is disabled", HttpStatus.UNAUTHORIZED);
        } catch (AuthenticationException e) {
            logger.warning("Authentication failed for email: " + loginDto.getEmail() + " - " + e.getMessage());
            return new ResponseEntity<>("Authentication failed: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.severe("Unexpected error during login for email: " + loginDto.getEmail() + " - " + e.getMessage());
            return new ResponseEntity<>("An unexpected error occurred during login", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "User registration")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful registration", content = @Content),
            @ApiResponse(responseCode = "400", description = "Email is already in use", content = @Content)
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto registerDto) {

        logger.info("Registration attempt for password: " + registerDto.getPassword());

        if (Boolean.TRUE.equals(userRepository.existsByEmail(registerDto.getEmail()))) {
            return new ResponseEntity<>("Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        userEntity user = new userEntity();
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode((registerDto.getPassword())));

        Role roles = roleRepository.findByName("USER").get();
        user.setRoles(Collections.singletonList(roles));
        logger.info("Roles set for registration");

        logger.info("Topics set for registration");

        userRepository.save(user);

        try {
            userService.sendConfirmationToken(registerDto.getEmail());
        } catch (MessagingException e) {
            throw new RuntimeException("Unable to send Mail from User Service");
        }

        return new ResponseEntity<>("User registered success!", HttpStatus.OK);
    }

    @Operation(summary = "Verify email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email verified successfully", content = @Content),
            @ApiResponse(responseCode = "400", description = "Invalid or expired OTP", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PostMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyDTO verifyDTO) {
        // Input validation
        if (verifyDTO.getOtp() == null || verifyDTO.getOtp().trim().isEmpty()) {
            return new ResponseEntity<>("OTP is required", HttpStatus.BAD_REQUEST);
        }

        try {
            String result = userService.confirmEmail(verifyDTO.getOtp());
            logger.info("Email verification successful for OTP: " + verifyDTO.getOtp());
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (Exception e) {
            logger.warning("Email verification failed for OTP: " + verifyDTO.getOtp() + " - " + e.getMessage());

            // Check if it's a user not found error
            if (e.getMessage().contains("User not found")) {
                return new ResponseEntity<>("User not found for the given token", HttpStatus.NOT_FOUND);
            }

            // For invalid or expired OTP
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(summary = "Resend verification email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification email sent successfully", content = @Content),
            @ApiResponse(responseCode = "400", description = "Invalid email or user already verified", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody String email) {
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
            userService.sendConfirmationToken(email);
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
