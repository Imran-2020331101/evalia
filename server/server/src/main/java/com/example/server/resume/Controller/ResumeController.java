package com.example.server.resume.Controller;

import com.example.server.resume.DTO.BasicSearchRequest;
import com.example.server.resume.DTO.BasicSearchResponse;
import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.resume.DTO.ResumeForwardWrapper;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.resume.Proxy.ResumeProxy;
import com.example.server.security.models.userEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Collections;
import java.util.logging.Logger;

@CrossOrigin
@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private static final Logger logger = Logger.getLogger(ResumeController.class.getName());
    private final ResumeProxy resumeProxy;
    private final ResumeJsonProxy resumeJsonProxy;
    private final UserDetailsService userDetailsService;

    public ResumeController(ResumeProxy resumeProxy, ResumeJsonProxy resumeJsonProxy, UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
        this.resumeJsonProxy = resumeJsonProxy;
        this.resumeProxy = resumeProxy;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadAndForwardResume(@RequestParam("file") MultipartFile file, Principal principal) {

        logger.info("Received file upload request from user: " + principal.getName());

        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());

        try {
            String response = resumeProxy.forwardResumeToProcessingEngine(
                    file,
                    principal.getName(),
                    user.getId().toString()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to forward: " + e.getMessage());
        }
    }

    @PostMapping("/save")
    public String saveResume(@RequestBody ResumeDataRequest resumeData) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(resumeData.getUploadedBy());
        logger.info("Received request to save resume data for user: " + resumeData.getFilename());
        return resumeJsonProxy.saveResume(new ResumeForwardWrapper(
                resumeData,
                user.getId(),
                user.getUsername()
        ));
    }

    @PostMapping("/basic-search")
    public ResponseEntity<?> basicSearchResume(@RequestBody BasicSearchRequest basicSearchRequest, Principal principal) {
        logger.info("Received basic search request from user: " + principal.getName());
        try {
            String jsonResponse = resumeJsonProxy.basicSearchResume(basicSearchRequest);
            ObjectMapper mapper = new ObjectMapper();
            BasicSearchResponse response = mapper.readValue(jsonResponse, BasicSearchResponse.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BasicSearchResponse(false, Collections.emptyList(), "Failed: " + e.getMessage()));
        }
    }

}
