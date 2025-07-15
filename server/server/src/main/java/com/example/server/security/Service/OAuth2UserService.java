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

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String provider = oAuth2UserRequest.getClientRegistration().getRegistrationId();

        // Extract attributes based on the provider
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = getEmailFromAttributes(attributes);
        String name = getNameFromAttributes(attributes);
        String providerId = getIdFromAttributes(attributes);

        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        // Check if user exists
        Optional<userEntity> userOptional = userRepository.findByEmail(email);
        userEntity user;

        if (userOptional.isPresent()) {
            // Update existing user with OAuth2 details if needed
            user = userOptional.get();
            // You can update additional fields here if needed
        } else {
            // Create a new user with OAuth2 details
            user = new userEntity();
            user.setEmail(email);
            user.setName(name);
            user.setUsername(email); // Using email as username
            user.setProvider(provider);
            user.setProviderId(providerId);
            user.setEnabled(true); // OAuth2 users are auto-verified

            // Set a default role
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RuntimeException("Default role not found"));
            user.setRoles(Collections.singletonList(userRole));

            userRepository.save(user);
        }

        // Create a new OAuth2User with our custom attributes
        Map<String, Object> customAttributes = new HashMap<>(attributes);
        customAttributes.put("userId", user.getId());

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                customAttributes,
                oAuth2UserRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint()
                        .getUserNameAttributeName());
    }

    private String getEmailFromAttributes(Map<String, Object> attributes) {
        // GitHub returns email in different field
        return (String) attributes.get("email");
    }

    private String getNameFromAttributes(Map<String, Object> attributes) {
        // GitHub returns name in different field
        return (String) attributes.get("name");
    }

    private String getIdFromAttributes(Map<String, Object> attributes) {
        // GitHub returns id as an Integer, so convert to String
        Object id = attributes.get("id");
        return id != null ? id.toString() : null;
    }
}
