package com.example.server.job.Proxy;

import com.example.server.job.DTO.TranscriptWrapperDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "interviewClient",
             url  = "${interview.service.url}/api/interview")
public interface InterviewProxy {
    @GetMapping(value = "/user/{userId}")
    ResponseEntity<String> getAllInterviewsOfAUser(@PathVariable("userId") String userId);

    @GetMapping(value = "/")
    ResponseEntity<String> getAllInterviews();

    @GetMapping(value = "/{interviewId}")
    ResponseEntity<String> getInterviewById(@PathVariable("interviewId") String interviewId);

    @GetMapping(value = "/job/{jobId}/candidate/{candidateId}")
    ResponseEntity<String> getInterviewByJobAndCandidate(@PathVariable("jobId") String jobId,
                                                         @PathVariable("candidateId") String candidateId);

    @PutMapping(value = "/{interviewId}/transcript")
    ResponseEntity<String> addTranscriptToInterview(@PathVariable("interviewId") String interviewId,
                                                    @RequestBody TranscriptWrapperDTO transcript);

    @GetMapping(value = "/{interviewId}/evaluation")
    ResponseEntity<String> getEvaluationOfAnInterview(@PathVariable("interviewId") String interviewId);

}