package com.example.server.course.controller;

import com.example.server.UserProfile.Service.UserService;
import com.example.server.course.dto.CourseDTO;
import com.example.server.course.proxy.CourseProxy;
import com.example.server.security.models.userEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/course")
public class CourseController {

    private static Logger logger = Logger.getLogger(CourseController.class.getName());
    private final CourseProxy courseProxy;
    private final UserDetailsService userService;

    public CourseController(CourseProxy courseProxy, UserDetailsService userService) {
        this.courseProxy = courseProxy;
        this.userService = userService;
    }

    @GetMapping("/suggestions")
    public ResponseEntity<String> getCourseSuggestions(Principal principal) {
        ResponseEntity<String> response = courseProxy.getCourseSuggestions(principal.getName());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveCourse(@RequestBody CourseDTO courseDTO, Principal principal) {
        userEntity user = (userEntity) userService.loadUserByUsername(principal.getName());
        ResponseEntity<String> response = courseProxy.saveCourse( user.getId().toString(), courseDTO);
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @GetMapping("/saved/all")
    public ResponseEntity<String> getAllCourse(Principal principal) {

        userEntity user = (userEntity) userService.loadUserByUsername(principal.getName());
        ResponseEntity<String> response = courseProxy.getAllSavedCourse( user.getId().toString());

        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }
}
