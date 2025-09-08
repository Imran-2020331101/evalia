package com.example.server.job.Proxy;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "interviewClient",
             url  = "http://localhost:4000/api/interview")
public interface InterviewProxy {
    @GetMapping(value = "/user/{userId}")
    ResponseEntity<String> getAllInterviewsOfAUser(@PathVariable("userId") String userId);

    @GetMapping(value = "/")
    ResponseEntity<String> getAllInterviews();

}