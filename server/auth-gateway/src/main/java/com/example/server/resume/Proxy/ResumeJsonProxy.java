package com.example.server.resume.Proxy;

import com.example.server.UserProfile.DTO.ForwardProfileRequest;
import com.example.server.resume.DTO.BasicSearchRequest;
import com.example.server.resume.DTO.ResumeForwardWrapper;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "resumeJsonClient",
        url = "http://localhost:5000/api/resume")
public interface ResumeJsonProxy {
    @PostMapping(value = "/extract", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> extractDetailsFromResume(@RequestBody ResumeForwardWrapper resumeForwardWrapper);

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> saveResume(@RequestBody ResumeForwardWrapper resumeForwardWrapper);

    @PostMapping(value = "/basic-search", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> basicSearchResume(@RequestBody BasicSearchRequest basicSearchRequest);

    @GetMapping(value = "/retrieve", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> getResumeByEmail(@RequestParam String email);

    @GetMapping(value = "/{jobId}/shortlist/{k}")
    ResponseEntity<String> getTopKResumesForJob(@PathVariable("jobId") String jobId, @PathVariable("k") int k);
}