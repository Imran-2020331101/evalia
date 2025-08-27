package com.example.server.UserProfile.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NotBlank
public class ImageUploadResponse {
    private boolean success;
    private String url;


}
