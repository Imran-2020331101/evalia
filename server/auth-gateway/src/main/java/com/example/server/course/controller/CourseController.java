package com.example.server.course.controller;

import com.example.server.course.proxy.CourseProxy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/course")
public class CourseController {

    private static Logger logger = Logger.getLogger(CourseController.class.getName());
    private final CourseProxy courseProxy;

    public CourseController(CourseProxy courseProxy) {
        this.courseProxy = courseProxy;
    }

    @GetMapping("/suggestions")
    public ResponseEntity<String> getCourseSuggestions(Principal principal) {
        ResponseEntity<String> response = courseProxy.getCourseSuggestions(principal.getName());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/{videoId}/candidate/{candidateId}")
    public ResponseEntity<String> saveCourse(@PathVariable("videoId") String videoId, @PathVariable("candidateId") String candidateId) {
        ResponseEntity<String> response = courseProxy.saveCourse(videoId, candidateId);
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }
}
