package com.example.server.course.proxy;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "courseClient",
             url  = "${resume.service.url}/api/course")
public interface CourseProxy {

    @GetMapping("/suggestions")
    ResponseEntity<String> getCourseSuggestions(@RequestParam String candidateEmail);

    @PostMapping("/{videoId}/candidate/{candidateId}")
    ResponseEntity<String> saveCourse(@PathVariable("videoId") String videoId,
                                      @PathVariable("candidateId") String candidateId);

}
