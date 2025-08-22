package com.example.server.security.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RegistrationResponseDTO {
    private String data;
    private String accessToken;
    private String tokenType = "Bearer ";

    public RegistrationResponseDTO(String data, String accessToken) {
        this.data = data;
        this.accessToken = accessToken;
    }
}

