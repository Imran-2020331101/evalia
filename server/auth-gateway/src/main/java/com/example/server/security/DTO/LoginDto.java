package com.example.server.security.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDto {
    @NotBlank(message = "Email is required")
    private String email;
    @NotBlank(message =  "Password is required")
    private String password;
}
