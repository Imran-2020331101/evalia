package com.example.server.security.DTO;

import lombok.Data;

@Data
public class VerifyDTO {
    private String email;
    private String otp;
}
