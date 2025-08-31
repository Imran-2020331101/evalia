package com.example.server.job.Proxy;

import com.example.server.job.DTO.JobApplicationRequest;
import com.example.server.job.DTO.JobCreationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "jobClient",
             url  = "http://localhost:7000/api/jobs")
public interface JobProxy {
    @PostMapping   (value = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    String createJob     ( @RequestBody   JobCreationRequest jobCreationRequest);

    @GetMapping    (value = "/{jobId}")
    String getJobById    ( @PathVariable ("jobId") String jobId);

    @DeleteMapping (value = "/{jobId}")
    String deleteJobById ( @PathVariable ("jobId") String jobId,
                           @RequestParam ("email") String email);

    @GetMapping   (value = "/organization/{OrganizationId}")
    String getAllJobsOfAnOrganization(@PathVariable ("OrganizationId") String OrganizationId);

    @DeleteMapping(value = "/organization/{OrganizationId}")
    String deleteAllJobsOfAnOrganization(@PathVariable ("OrganizationId") String OrganizationId);

    @PostMapping   (value = "/apply", consumes = MediaType.APPLICATION_JSON_VALUE)
    String applyToAJob     ( @RequestBody JobApplicationRequest jobApplicationRequest);

    @PostMapping   (value = "/shortlist", consumes = MediaType.APPLICATION_JSON_VALUE)
    String shortlistCandidatesOfAJob     ( @RequestBody JobApplicationRequest jobApplicationRequest);
}
