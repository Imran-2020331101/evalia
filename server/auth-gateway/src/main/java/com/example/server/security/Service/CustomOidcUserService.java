package com.example.server.security.Service;

import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.RoleRepository;
import com.example.server.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Autowired
    public CustomOidcUserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        System.out.println("=== OIDC Login Debug Info ===");
        System.out.println("OIDC Provider: " + provider);
        System.out.println("OIDC Attributes: " + oidcUser.getAttributes());
        System.out.println("OIDC Claims: " + oidcUser.getClaims());
        System.out.println("Client Registration: " + userRequest.getClientRegistration().getClientName());

        try {
            OidcUser result = processOidcUser(userRequest, oidcUser);
            System.out.println("OIDC user processing completed successfully");
            return result;
        } catch (Exception ex) {
            System.err.println("Error in OIDC loadUser: " + ex.getMessage());
            ex.printStackTrace();
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OidcUser processOidcUser(OidcUserRequest oidcUserRequest, OidcUser oidcUser) {
        String provider = oidcUserRequest.getClientRegistration().getRegistrationId();
        System.out.println("Processing OIDC user for provider: " + provider);

        // Extract attributes from OIDC user
        Map<String, Object> attributes = oidcUser.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String providerId = (String) attributes.get("sub"); // OIDC uses "sub" as user ID

        System.out.println("Extracted email: " + email);
        System.out.println("Extracted name: " + name);
        System.out.println("Extracted providerId: " + providerId);

        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OIDC provider");
        }

        try {
            // Check if user exists
            Optional<userEntity> userOptional = userRepository.findByEmail(email);
            userEntity user;

            if (userOptional.isPresent()) {
                // Update existing user with OIDC details if needed
                user = userOptional.get();
                System.out.println("Found existing user: " + user.getEmail());

                // Update provider info if not set
                if (user.getProvider() == null || user.getProvider().isEmpty()) {
                    user.setProvider(provider);
                    user.setProviderId(providerId);
                    user.setEnabled(true);
                    user.setEmailVerified(true); // OIDC users are auto-verified
                    user = userRepository.save(user);
                    System.out.println("Updated existing user with OIDC details");
                }
            } else {
                // Create a new user with OIDC details
                System.out.println("Creating new user with email: " + email);
                user = new userEntity();
                user.setEmail(email);
                user.setName(name);
                user.setUsername(email); // Using email as username
                user.setProvider(provider);
                user.setProviderId(providerId);
                user.setEnabled(true); // OIDC users are auto-verified
                user.setEmailVerified(true); // OIDC users are auto-verified

                // Set a default role
                Role userRole = roleRepository.findByName("USER")
                        .orElseThrow(() -> new RuntimeException("Default role not found"));
                user.setRoles(Collections.singletonList(userRole));

                user = userRepository.save(user);
                System.out.println("New user created with ID: " + user.getId());
            }

            // Create a new OidcUser with our custom attributes
            Map<String, Object> customAttributes = new HashMap<>(attributes);
            customAttributes.put("userId", user.getId());

            return new DefaultOidcUser(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                    oidcUser.getIdToken(),
                    oidcUser.getUserInfo(),
                    "sub"); // Use "sub" as the name attribute for OIDC
        } catch (Exception e) {
            System.err.println("Error processing OIDC user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
