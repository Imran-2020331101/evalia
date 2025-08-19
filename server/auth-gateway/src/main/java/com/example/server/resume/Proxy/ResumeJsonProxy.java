package com.example.server.resume.Proxy;

import com.example.server.User.DTO.ForwardProfileRequest;
import com.example.server.resume.DTO.BasicSearchRequest;
import com.example.server.resume.DTO.ResumeForwardWrapper;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "resumeJsonClient",
        url = "http://localhost:5000/api/resume")
public interface ResumeJsonProxy {
    @PostMapping(value = "/extract", consumes = MediaType.APPLICATION_JSON_VALUE)
    String extractDetailsFromResume(@RequestBody ResumeForwardWrapper resumeForwardWrapper);

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE)
    String saveResume(@RequestBody ResumeForwardWrapper resumeForwardWrapper);

    @PostMapping(value = "/basic-search", consumes = MediaType.APPLICATION_JSON_VALUE)
    String basicSearchResume(@RequestBody BasicSearchRequest basicSearchRequest);

    @PostMapping(value = "/get-resume", consumes = MediaType.APPLICATION_JSON_VALUE)
    String getResumeByEmail(@RequestBody ForwardProfileRequest email);
}