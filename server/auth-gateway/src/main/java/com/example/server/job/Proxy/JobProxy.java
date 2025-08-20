package com.example.server.job.Proxy;

import com.example.server.job.DTO.JobCreationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name="jobClient",
        url = "http://localhost:7000/api/jobs")
public interface JobProxy {
    @PostMapping(value = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    String createJob(@RequestBody JobCreationRequest jobCreationRequest);

    @GetMapping(value = "/{jobId}")
    String getJobById(@PathVariable("jobId") String jobId);
}
