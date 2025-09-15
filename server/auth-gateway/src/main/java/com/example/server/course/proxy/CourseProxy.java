package com.example.server.course.proxy;

import com.example.server.course.dto.CourseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "courseClient",
             url  = "${resume.service.url}/api/course")
public interface CourseProxy {

    @GetMapping("/suggestions")
    ResponseEntity<String> getCourseSuggestions(@RequestParam String candidateEmail);

    @PostMapping("/candidate/{candidateId}/save")
    ResponseEntity<String> saveCourse(@PathVariable("candidateId") String candidateId,
                                      @RequestBody CourseDTO courseDTO);

    @GetMapping("/candidate/{candidateId}/saved/all")
    ResponseEntity<String> getAllSavedCourse(@PathVariable("candidateId") String candidateId);

    @DeleteMapping("/candidate/{candidateId}/delete/{videoId}")
    ResponseEntity<String> deleteCourse(@PathVariable("videoId") String videoId,
                                        @PathVariable("candidateId") String candidateId);
}
