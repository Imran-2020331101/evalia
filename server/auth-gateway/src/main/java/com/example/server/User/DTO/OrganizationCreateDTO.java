package com.example.server.User.DTO;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrganizationCreateDTO {

    @NotBlank
    private String organizationName;

    private String organizationNameBangla;
    private String organizationProfileImageUrl;

    @NotBlank
    private String yearOfEstablishment;

    private String numberOfEmployees;

    @NotBlank
    private String organizationAddress;

    private String organizationAddressBangla;

    @NotBlank
    private String industryType;

    @NotBlank
    private String businessDescription;

    private String businessLicenseNo;

    private String websiteUrl;

    private boolean enableDisabilityFacilities;

    @AssertTrue(message = "You must accept the privacy policy")
    private boolean acceptPrivacyPolicy;
}
