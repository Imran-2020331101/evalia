package com.example.server.UserProfile.DTO;

import com.example.server.resume.DTO.ResumeDataRequest;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResumeFetchResponse {
    private boolean success;
    private ResumeDataRequest data;
    private String error;
}
