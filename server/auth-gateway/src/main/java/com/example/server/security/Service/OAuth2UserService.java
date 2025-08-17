package com.example.server.security.Service;

import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.RoleRepository;
import com.example.server.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Autowired
    public OAuth2UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        System.out.println("=== OAuth2 Login Debug Info ===");
        System.out.println("OAuth2 Provider: " + provider);
        System.out.println("OAuth2 Attributes: " + oAuth2User.getAttributes());
        System.out.println("Client Registration: " + userRequest.getClientRegistration().getClientName());

        try {
            OAuth2User result = processOAuth2User(userRequest, oAuth2User);
            System.out.println("OAuth2 user processing completed successfully");
            return result;
        } catch (Exception ex) {
            System.err.println("Error in OAuth2 loadUser: " + ex.getMessage());
            ex.printStackTrace(); // Enhanced error logging
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String provider = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        System.out.println("Processing user for provider: " + provider);

        // Extract attributes based on the provider
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = getEmailFromAttributes(attributes, provider);
        String name = getNameFromAttributes(attributes, provider);
        String providerId = getIdFromAttributes(attributes, provider);

        System.out.println("Extracted email: " + email);
        System.out.println("Extracted name: " + name);
        System.out.println("Extracted providerId: " + providerId);

        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        try {
            // Check if user exists
            Optional<userEntity> userOptional = userRepository.findByEmail(email);
            userEntity user;

            if (userOptional.isPresent()) {
                // Update existing user with OAuth2 details if needed
                user = userOptional.get();
                System.out.println("Found existing user: " + user.getEmail());

                // Update provider info if not set
                if (user.getProvider() == null || user.getProvider().isEmpty()) {
                    user.setProvider(provider);
                    user.setProviderId(providerId);
                    user.setEnabled(true);
                    user.setEmailVerified(true); // OAuth2 users are auto-verified
                    user = userRepository.save(user);
                    System.out.println("Updated existing user with OAuth2 details");
                }
            } else {
                // Create a new user with OAuth2 details
                System.out.println("Creating new user with email: " + email);
                user = new userEntity();
                user.setEmail(email);
                user.setName(name);
                user.setUsername(email); // Using email as username
                user.setProvider(provider);
                user.setProviderId(providerId);
                user.setEnabled(true); // OAuth2 users are auto-verified
                user.setEmailVerified(true); // OAuth2 users are auto-verified

                // Set a default role
                Role userRole = roleRepository.findByName("USER")
                        .orElseThrow(() -> new RuntimeException("Default role not found"));
                user.setRoles(Collections.singletonList(userRole));

                user = userRepository.save(user);
                System.out.println("New user created with ID: " + user.getId());
            }

            // Create a new OAuth2User with our custom attributes
            Map<String, Object> customAttributes = new HashMap<>(attributes);
            customAttributes.put("userId", user.getId());

            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                    customAttributes,
                    oAuth2UserRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint()
                            .getUserNameAttributeName());
        } catch (Exception e) {
            System.err.println("Error processing OAuth2 user: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to be caught by the calling method
        }
    }

    private String getEmailFromAttributes(Map<String, Object> attributes, String provider) {
        // GitHub specific handling
        if (provider.equals("github")) {
            // GitHub email might be private, check if we have it directly
            String email = (String) attributes.get("email");

            // If no email is directly available, try to extract from other fields
            if (email == null || email.isEmpty()) {
                // You could use their login as a fallback
                String login = (String) attributes.get("login");
                if (login != null && !login.isEmpty()) {
                    email = login + "@github.user";
                }
            }
            return email;
        }

        // Google specific handling
        if (provider.equals("google")) {
            return (String) attributes.get("email");
        }

        // Default fallback
        return (String) attributes.get("email");
    }

    private String getNameFromAttributes(Map<String, Object> attributes, String provider) {
        // GitHub returns name differently
        if (provider.equals("github")) {
            String name = (String) attributes.get("name");
            // If name is not available, use login as fallback
            if (name == null || name.isEmpty()) {
                return (String) attributes.get("login");
            }
            return name;
        }

        // Google usually provides name directly
        if (provider.equals("google")) {
            String name = (String) attributes.get("name");
            if (name == null || name.isEmpty()) {
                // Try given_name + family_name as fallback
                String givenName = (String) attributes.get("given_name");
                String familyName = (String) attributes.get("family_name");
                if (givenName != null && familyName != null) {
                    return givenName + " " + familyName;
                }
            }
            return name;
        }

        return (String) attributes.get("name");
    }

    private String getIdFromAttributes(Map<String, Object> attributes, String provider) {
        // Provider-specific ID extraction
        if (provider.equals("github")) {
            // GitHub returns id as an Integer, so convert to String
            Object id = attributes.get("id");
            return id != null ? id.toString() : null;
        }

        if (provider.equals("google")) {
            // Google uses "sub" as the unique identifier
            return (String) attributes.get("sub");
        }

        Object id = attributes.get("id");
        return id != null ? id.toString() : null;
    }
}
