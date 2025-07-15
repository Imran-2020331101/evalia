package com.example.server.security.authDTO;

import lombok.Data;

@Data
public class RegisterDto {
    private String name;
    private String email;
    private String password;
}
