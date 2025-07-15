package com.example.server.security.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Example Feign client for demonstrating external API consumption
 * Replace with your actual API endpoints and response models
 */
@FeignClient(name = "external-api", url = "${external.api.base-url:https://jsonplaceholder.typicode.com}")
public interface ExternalApiClient {

    @GetMapping("/users/{id}")
    UserResponse getUserById(@PathVariable("id") Long id);

    // You can add more API endpoints as needed

    // Simple data class for demonstration
    class UserResponse {
        private Long id;
        private String name;
        private String email;

        // Getters and setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
