package com.example.server.UserProfile.models;

import lombok.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "organization")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationEntity {
    @Id
    private String id;

    @NotBlank
    private String ownerEmail;

    @NotBlank
    private String organizationName;

    private String organizationNameBangla;

    private String organizationProfileImageUrl;

    @NotBlank
    private String yearOfEstablishment;

    @NotBlank
    private String numberOfEmployees;

    @NotBlank
    private String organizationAddress;

    private String organizationAddressBangla;

    @NotBlank
    private String industryType;

    @NotBlank
    private String businessDescription;

    private String businessLicenseNo;

    private String rlNo;

    private String websiteUrl;

    private boolean enableDisabilityFacilities;

    @NotBlank
    private boolean acceptPrivacyPolicy;

    private boolean verified = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
