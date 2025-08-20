package com.example.server.User.DTO;

public class OrganizationRequestDTO {

    private String ownerEmail;


    private String organizationName;

    private String organizationNameBangla;
    private String organizationProfileImageUrl;


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
    private String rlNo;
    private String websiteUrl;

    private boolean enableDisabilityFacilities;

    @AssertTrue(message = "You must accept the privacy policy")
    private boolean acceptPrivacyPolicy;
}
