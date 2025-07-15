package com.example.server.security.Service;

import com.example.server.security.models.ConfirmationToken;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.ConfirmationTokenRepository;
import com.example.server.security.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = Logger.getLogger(CustomUserDetailsService.class.getName());

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final ConfirmationTokenRepository confirmationTokenRepository;

    @Autowired
    public CustomUserDetailsService(EmailService emailService,
            UserRepository userRepository,
            ConfirmationTokenRepository confirmationTokenRepository) {
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.confirmationTokenRepository = confirmationTokenRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email not found"));
    }

    public String confirmEmail(String confirmationToken) throws Exception {
        // Input validation
        if (confirmationToken == null || confirmationToken.trim().isEmpty()) {
            throw new Exception("Confirmation token cannot be empty");
        }

        Optional<ConfirmationToken> token = Optional.ofNullable(
                confirmationTokenRepository.findByConfirmationToken(confirmationToken));

        if (token.isPresent()) {
            ConfirmationToken confirmToken = token.get();

            // Check if token has expired
            if (confirmToken.getExpiryDate() != null &&
                    confirmToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
                logger.warning("Expired token used: " + confirmationToken);
                confirmationTokenRepository.deleteById(confirmToken.getId()); // Clean up expired token
                throw new Exception("OTP has expired. Please request a new one.");
            }

            logger.info("Valid token found for verification");

            // Get the user associated with this token and mark as verified
            String userEmail = confirmToken.getUserEmail();
            if (userEmail != null) {
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
        confirmationToken.setExpiryDate(java.time.LocalDateTime.now().plusMinutes(10));

        confirmationTokenRepository.save(confirmationToken);

        // Use the EmailService to send the verification email
        emailService.sendVerificationEmail(email, otpString);

        logger.info("Confirmation Token: " + confirmationToken.getConfirmationToken());
    }
}
