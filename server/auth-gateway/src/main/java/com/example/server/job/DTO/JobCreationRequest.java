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
    @NotNull
    private BasicInfo basic;

    @NotEmpty
    @Valid
    private List<DomainItemDto> requirement;

    @NotEmpty
    @Valid
    private List<DomainItemDto> responsibility;

    @NotEmpty
    @Valid
    private List<DomainItemDto> skill;

    @Valid
    private List<InterviewQADto> interviewQA;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanyInfo {
        private String id;
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BasicInfo {
        @NotBlank
        @Size(max = 200)
        private String title;

        @NotBlank
        @Size(max = 5000)
        private String jobDescription;

        @NotBlank
        @Size(max = 100)
        private String jobLocation;

        @Min(0)
        private Integer salaryFrom;

        @Min(0)
        private Integer salaryTo;

        @NotNull
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate deadline;

        @NotNull
        private JobType jobType;

        @NotNull
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
        @NotBlank
        private String type;

        @NotBlank
        private String category;

        @NotBlank
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
