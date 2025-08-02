package com.example.server.security.models;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactPerson {

    @NotBlank
    private String contactPersonName;

    @NotBlank
    private String contactPersonDesignation;

    @Email
    private String contactPersonEmail;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid mobile number")
    private String contactPersonMobile;
}

