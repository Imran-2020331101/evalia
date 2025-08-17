package com.example.server.security.models;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyInfo {

    @NotBlank
    private String companyName;

    private String companyNameBangla;

    @NotBlank
    private String yearOfEstablishment;

    @NotBlank
    private String numberOfEmployees;

    @NotBlank
    private String companyAddress;

    private String companyAddressBangla;

    @NotBlank
    private String industryType;

    @NotBlank
    private String businessDescription;

    private String businessLicenseNo;

    private String rlNo;

    private String websiteUrl;
}
