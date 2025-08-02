package com.example.server.security.authDTO;

import lombok.Data;

@Data
public class VerifyDTO {
    private String email;
    private String otp;
}
