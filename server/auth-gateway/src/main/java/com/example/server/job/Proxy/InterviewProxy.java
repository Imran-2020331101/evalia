package com.example.server.job.Proxy;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "interviewClient",
             url  = "${interview.service.url}/api/interview")
public interface InterviewProxy {
    @GetMapping(value = "/user/{userId}")
    ResponseEntity<String> getAllInterviewsOfAUser(@PathVariable("userId") String userId);

    @GetMapping(value = "/")
    ResponseEntity<String> getAllInterviews();

    @GetMapping(value = "/{interviewId}")
    ResponseEntity<String> getInterviewById(@PathVariable("interviewId") String interviewId);

    @PatchMapping(value = "/{interviewId}/transcript")
    ResponseEntity<String> getAllInterviewsOfATranscript(@PathVariable("interviewId") String interviewId);

}