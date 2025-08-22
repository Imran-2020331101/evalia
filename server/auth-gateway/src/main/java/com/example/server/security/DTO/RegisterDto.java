package com.example.server.security.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterDto {
    private String name;
    @NotBlank(message = "Email is required for registration")
    private String email;
    @NotBlank(message = "Password is required for registration")
    private String password;
    @NotBlank(message = "Role is required for registration")
    private String role;
}
