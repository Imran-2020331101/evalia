package com.example.server.UserProfile.DTO;

import com.example.server.resume.DTO.ResumeDataRequest;
import lombok.Data;

@Data
public class ResumeFetchResponse {
    private boolean success;
    private ResumeDataRequest data;
    private String error;
}
