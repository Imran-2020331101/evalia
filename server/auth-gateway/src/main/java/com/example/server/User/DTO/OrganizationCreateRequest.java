package com.example.server.User.DTO;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrganizationCreateRequest {

    @NotBlank(message = "Organization name is required")
    private String organizationName;

    private String organizationNameBangla;
    private String organizationProfileImageUrl;

    @NotBlank
    private String yearOfEstablishment;

    private String numberOfEmployees;

    @NotBlank(message = "Organization address is required")
    private String organizationAddress;

    private String organizationAddressBangla;

    @NotBlank(message = "Type of the Organization is required")
    private String industryType;

    @NotBlank(message = "Description of the Organization is required")
    private String businessDescription;

    private String businessLicenseNo;

    private String websiteUrl;

    private boolean enableDisabilityFacilities;

    @AssertTrue(message = "You must accept the privacy policy")
    private boolean acceptPrivacyPolicy;
}
