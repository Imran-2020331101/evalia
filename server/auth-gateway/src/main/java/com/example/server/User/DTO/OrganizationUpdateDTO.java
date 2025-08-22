package com.example.server.User.DTO;

import lombok.Data;

@Data
public class OrganizationUpdateDTO {
    private String organizationName;
    private String organizationNameBangla;
    private String organizationProfileImageUrl;
    private String yearOfEstablishment;
    private String numberOfEmployees;
    private String organizationAddress;
    private String organizationAddressBangla;
    private String industryType;
    private String businessDescription;
    private String businessLicenseNo;
    private String rlNo;
    private String websiteUrl;
    private Boolean enableDisabilityFacilities;
    private Boolean acceptPrivacyPolicy;
}

