package com.example.server.resume.Controller;

import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.resume.DTO.ResumeForwardWrapper;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.resume.Proxy.ResumeProxy;
import com.example.server.security.models.userEntity;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
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

        try {
            String response = resumeProxy.forwardResumeToProcessingEngine(file,principal.getName());
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
    public ResponseEntity<String> basicSearchResume(@RequestBody String jobDescription, Principal principal) {
        logger.info("Received basic search request from user: " + principal.getName());
        try {
            String response = resumeJsonProxy.basicSearchResume(jobDescription);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to perform basic search: " + e.getMessage());
        }

    }

}
