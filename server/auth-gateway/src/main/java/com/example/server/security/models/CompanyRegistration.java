package com.example.server.security.models;


import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.Valid;
import java.time.LocalDateTime;

@Document(collection = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyRegistration {

    @Id
    private String id;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @Transient
    private String confirmPassword;

    @Valid
    private CompanyInfo company;

    @Valid
    private ContactPerson contactPerson;

    private boolean enableDisabilityFacilities;

    private boolean acceptPrivacyPolicy;

    @NotBlank
    private String captchaAnswer;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}

