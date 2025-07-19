package com.example.server.security.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OAuth2TestController {

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @GetMapping("/test-oauth2")
    public String testOAuth2() {
        System.out.println("OAuth2 test endpoint called");

        // Check if Google client registration exists
        try {
            var googleRegistration = clientRegistrationRepository.findByRegistrationId("google");
            if (googleRegistration != null) {
                System.out.println("Google OAuth2 client registration found: " + googleRegistration.getClientId());
                return "OAuth2 is configured! Google client found. Try: http://localhost:8080/oauth2/authorization/google";
            } else {
                System.out.println("Google OAuth2 client registration NOT found!");
                return "OAuth2 configuration issue: Google client registration not found";
            }
        } catch (Exception e) {
            System.out.println("Error checking OAuth2 configuration: " + e.getMessage());
            return "OAuth2 configuration error: " + e.getMessage();
        }
    }

    @GetMapping("/")
    public String home() {
        return "Backend is running! Test OAuth2: /test-oauth2";
    }
}
