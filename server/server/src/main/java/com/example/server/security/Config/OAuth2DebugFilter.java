package com.example.server.security.Config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2DebugFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        // Log all OAuth2 related requests
        if (requestURI.contains("oauth2") || requestURI.contains("login")) {
            System.out.println("=== OAuth2 Debug Filter ===");
            System.out.println("Method: " + method);
            System.out.println("Request URI: " + requestURI);
            System.out.println("Query String: " + httpRequest.getQueryString());
            System.out.println("Headers: ");
            httpRequest.getHeaderNames().asIterator().forEachRemaining(headerName -> {
                System.out.println("  " + headerName + ": " + httpRequest.getHeader(headerName));
            });
            System.out.println("==============================");
        }

        chain.doFilter(request, response);

        // Log response status for OAuth2 requests
        if (requestURI.contains("oauth2") || requestURI.contains("login")) {
            System.out.println("Response Status: " + httpResponse.getStatus());
            System.out.println("Response Headers: ");
            httpResponse.getHeaderNames().forEach(headerName -> {
                System.out.println("  " + headerName + ": " + httpResponse.getHeader(headerName));
            });
            System.out.println("==============================");
        }
    }
}
