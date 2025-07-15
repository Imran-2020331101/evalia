package com.example.server.security.authDTO;

import lombok.Data;

@Data
public class LoginDto {
    private String email;
    private String password;
}
