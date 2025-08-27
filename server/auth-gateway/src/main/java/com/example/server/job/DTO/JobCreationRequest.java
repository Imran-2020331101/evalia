package com.example.server.job.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCreationRequest {

    @Valid
    private CompanyInfo companyInfo;

    @Valid
    @NotNull(message = "Basic info must be provided")
    private BasicInfo basic;

    @Valid
    @NotEmpty(message = "At least one requirement must be provided")
    private List<DomainItemDto> requirements;

    @Valid
    @NotEmpty(message = "At least one responsibility must be provided")
    private List<DomainItemDto> responsibilities;

    @Valid
    @NotEmpty(message = "At least one skill must be provided")
    private List<DomainItemDto> skills;

    @Valid
    private List<InterviewQADto> interviewQA;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanyInfo {
        private String organizationId;
        private String organizationEmail;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BasicInfo {
        @Size(max = 200)
        @NotBlank(message = "Job title must not be blank")
        private String title;

        @Size(max = 5000)
        @NotBlank(message = "Job description must not be blank")
        private String jobDescription;

        @Size(max = 100)
        @NotBlank(message = "Job location must not be blank")
        private String jobLocation;

        @Min(0)
        private Integer salaryFrom;

        @Min(0)
        private Integer salaryTo;

        @JsonFormat(pattern = "yyyy-MM-dd")
        @NotNull(message = "Application deadline must be provided")
        private LocalDate deadline;

        @NotNull(message = "Job type must be provided")
        private JobType jobType;

        @NotNull(message = "Workplace type must be provided")
        private WorkplaceType workPlaceType;

        @NotNull
        private EmploymentLevel employmentLevelType;

        @AssertTrue(message = "Maximum salary must be greater than or equal to minimum salary")
        public boolean isSalaryRangeValid() {
            return salaryFrom != null && salaryTo != null && salaryTo >= salaryFrom;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DomainItemDto {
        @NotBlank(message = "Type must not be blank")
        private String type;

        @NotBlank(message = "Category must not be blank")
        private String category;

        @NotBlank(message = "Description must not be blank")
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InterviewQADto {
        @NotBlank
        @Size(max = 5000)
        private String question;

        private String referenceAnswer;
    }

    public enum JobType         { FULL_TIME, PART_TIME, CONTRACT, INTERN }
    public enum WorkplaceType   { ONSITE, REMOTE, HYBRID }
    public enum EmploymentLevel { ENTRY, MID, SENIOR }
}
