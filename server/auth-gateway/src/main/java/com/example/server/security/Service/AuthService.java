package com.example.server.security.Service;

import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.security.JWT.JwtService;
import com.example.server.security.DTO.*;
import com.example.server.security.exception.InvalidTokenException;
import com.example.server.security.exception.TokenExpiredException;
import com.example.server.security.exception.UserAlreadyExistsException;
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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class AuthService {

    private static final Logger               logger = Logger.getLogger(AuthService.class.getName());
    private final AuthenticationManager       authenticationManager;
    private final UserRepository              userRepository;
    private final RoleRepository              roleRepository;
    private final PasswordEncoder             passwordEncoder;
    private final JwtService                  jwtService;
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final EmailService                emailService;

    @Autowired
    public AuthService(AuthenticationManager       authenticationManager,
                       UserRepository              userRepository,
                       RoleRepository              roleRepository,
                       PasswordEncoder             passwordEncoder,
                       JwtService                  jwtService,
                       ConfirmationTokenRepository confirmationTokenRepository,
                       EmailService                emailService) {

        this.authenticationManager       = authenticationManager;
        this.userRepository              = userRepository;
        this.roleRepository              = roleRepository;
        this.passwordEncoder             = passwordEncoder;
        this.jwtService                  = jwtService;
        this.confirmationTokenRepository = confirmationTokenRepository;
        this.emailService                = emailService;
    }

    public ResponseEntity<?> login(LoginDto loginDto) {
            userEntity user = userRepository.findByEmail(loginDto.getEmail())
                    .orElseThrow(() -> new UserNotFoundException("User with this email does not exist :" + loginDto.getEmail()));

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
            LoginResponseDTO loginResponse = new LoginResponseDTO( user.getName(), user.getEmail(), user.getRoles(), token);

            logger.info("Successful login for user: " + loginDto.getEmail());
            return new ResponseEntity<>(loginResponse, HttpStatus.OK);


    }

    public ResponseEntity<?> register(RegisterDto registerDto) throws MessagingException {

        if (Boolean.TRUE.equals(userRepository.existsByEmail(registerDto.getEmail()))) {
            throw new UserAlreadyExistsException("User already exists with email: " + registerDto.getEmail());
        }

        userEntity user = new userEntity();
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode((registerDto.getPassword())));
        Role roles = roleRepository.findByName(registerDto.getRole())
                .orElseThrow(() -> new IllegalArgumentException("Role not found with name: " + registerDto.getRole()));
        user.setRoles(Collections.singletonList(roles));
        user.setEnabled(true);

        userRepository.save(user);
        logger.info("User saved to repository: " + registerDto.getEmail());

        String temporaryToken = temporarilyAuthenticate(user);


        sendConfirmationToken(registerDto.getEmail());


        return new ResponseEntity<>(
                new RegistrationResponseDTO("User registered success!",temporaryToken)
                                                  , HttpStatus.OK);
    }

    public String confirmEmail(VerifyDTO verifyDTO){

        String confirmationToken = verifyDTO.getOtp();
        String email = verifyDTO.getEmail();

        logger.info("Received OTP for verification: " + confirmationToken + " for email: " + email);

        // Input validation
        if (confirmationToken == null || confirmationToken.trim().isEmpty()) {
            throw new InvalidTokenException("Confirmation token cannot be empty");
        }

        Optional<ConfirmationToken> token = Optional.ofNullable(
                confirmationTokenRepository.findByToken(confirmationToken));

        if (token.isPresent()) {
            logger.info("Token found in database for verification: " + confirmationToken);
            ConfirmationToken confirmToken = token.get();

            // Check if the token has expired
            if (confirmToken.getExpiryDate() != null &&
                    confirmToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                logger.warning("Expired token used: " + confirmationToken);
                confirmationTokenRepository.deleteById(confirmToken.getId());
                throw new TokenExpiredException("OTP has expired. Please request a new one.");
            }

            logger.info("Valid token found for verification");

            // Get the user associated with this token and mark as verified
            String userEmail = confirmToken.getUserEmail();
            if (userEmail != null && userEmail.equals(email)) {
                userEntity user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new UserNotFoundException("User not found for the given token"));

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
        throw new InvalidTokenException("Invalid OTP. Please check your OTP and try again.");
    }

    public void sendConfirmationToken(String email) throws MessagingException {
        SecureRandom random = new SecureRandom();
        int randomNumber = 1000 + random.nextInt(9000);
        String otpString = String.valueOf(randomNumber);

        ConfirmationToken confirmationToken = new ConfirmationToken(randomNumber,email,LocalDateTime.now().plusMinutes(10));

        confirmationTokenRepository.save(confirmationToken);
        emailService.sendVerificationEmail(email, otpString);

        logger.info("Confirmation Token: " + confirmationToken.getToken());
    }

    public ResponseEntity<?> resendVerificationEmail(String email) throws MessagingException {
        // Input validation
        if (email == null || email.trim().isEmpty()) {
            return new ResponseEntity<>("Email is required", HttpStatus.BAD_REQUEST);
        }

        userEntity user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User with email " + email + " does not exist"));

        if (user != null && user.isEmailVerified()) {
            return new ResponseEntity<>("Email is already verified", HttpStatus.BAD_REQUEST);
        }

        // Send new verification token
        sendConfirmationToken(email);
        logger.info("Verification email resent successfully to: " + email);
        return new ResponseEntity<>("Verification email sent successfully", HttpStatus.OK);
    }

    public void updateRole(String email, String roleName) {
        userEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email:"+ email));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with name: "+ roleName));

        user.getRoles().clear();
        user.getRoles().add(role);
        userRepository.save(user);
    }

    /*
     * Temporarily authenticates a user to complete the Onboarding process.
     * Generates a temporary JWT token for actions like Resume upload or Organization creation.
     * Token invalidates in 10 minutes.
     */
    public String temporarilyAuthenticate(UserDetails userDetails) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtService.generateTemporaryToken(authentication);
    }
}
