package com.example.server.security.Controller;

import com.example.server.security.Service.AuthService;
import com.example.server.security.DTO.LoginDto;
import com.example.server.security.DTO.LoginResponseDTO;
import com.example.server.security.DTO.RegisterDto;
import com.example.server.security.DTO.VerifyDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.logging.Logger;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and registration endpoints")
public class AuthController {

    private static final Logger logger = Logger.getLogger(AuthController.class.getName());

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }



    @Operation(summary = "User login")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful login", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponseDTO.class)) }),
            @ApiResponse(responseCode = "400", description = "Invalid email or password", content = @Content),
            @ApiResponse(responseCode = "401", description = "Account not verified", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        return authService.login(loginDto);
    }





    @Operation(summary = "User registration")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful registration", content = @Content),
            @ApiResponse(responseCode = "400", description = "Email is already in use", content = @Content)
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto registerDto) throws MessagingException {
        return authService.register(registerDto);
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
            logger.info("verifyEmail: service being called " + verifyDTO.getOtp());
            String result = authService.confirmEmail(verifyDTO);
            logger.info("Email verification successful for OTP: " + verifyDTO.getOtp());
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (Exception e) {
            logger.warning("Email verification failed for OTP: " + verifyDTO.getOtp() + " - " + e.getMessage());

            if (e.getMessage().contains("User not found")) {
                return new ResponseEntity<>("Invalid Token", HttpStatus.NOT_FOUND);
            }

            // For invalid or expired OTP
            return new ResponseEntity<>("Invalid Token", HttpStatus.BAD_REQUEST);
        }
    }




    @Operation(summary = "Resend verification email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification email sent successfully", content = @Content),
            @ApiResponse(responseCode = "400", description = "Invalid email or user already verified", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody String email) throws MessagingException {
        return authService.resendVerificationEmail(email);
    }

    @PostMapping("/update/role")
    public ResponseEntity<?> updateRole(@RequestBody Map<String, String> body) {
        logger.info("Received request to update role"+ body.get("role"));
        authService.updateRole(body.get("role"), body.get("email"));
        return ResponseEntity.ok("Role updated successfully");
    }
}
