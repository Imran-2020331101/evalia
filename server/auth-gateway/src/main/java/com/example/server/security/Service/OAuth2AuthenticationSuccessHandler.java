package com.example.server.security.Service;

import com.example.server.security.JWT.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    private final JwtService jwtService;

    @Autowired
    public OAuth2AuthenticationSuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        if (response.isCommitted()) {
            return;
        }

        // Generate JWT token using the authentication object
        String token = jwtService.generateToken(authentication);

        // Determine redirect URL (frontend application URL)
        String targetUrl = determineTargetUrl(request, response, authentication, token);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication, String token) {
        // redirect to frontend application with the token as a query parameter
        String redirectUri = frontendUrl + "/auth/callback";


        return UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .build().toUriString();
    }
}
