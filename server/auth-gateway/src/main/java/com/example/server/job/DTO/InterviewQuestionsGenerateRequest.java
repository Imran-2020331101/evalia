package com.example.server.job.DTO;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record InterviewQuestionsGenerateRequest(
        @NotBlank String jobDescription,
        List<DomainItem> requirements,
        List<DomainItem> responsibilities,
        List<DomainItem> skills
) {}

