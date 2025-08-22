package com.example.server.resume.Controller;

import com.example.server.User.Service.UserService;
import com.example.server.resume.DTO.BasicSearchRequest;
import com.example.server.resume.DTO.BasicSearchResponse;
import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.resume.DTO.ResumeForwardWrapper;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.resume.Proxy.ResumeProxy;
import com.example.server.security.models.userEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@CrossOrigin
@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private static final Logger      logger = Logger.getLogger(ResumeController.class.getName());
    private final ResumeProxy        resumeProxy;
    private final ResumeJsonProxy    resumeJsonProxy;
    private final UserDetailsService userDetailsService;
    private final UserService        userService;

    public ResumeController(ResumeProxy        resumeProxy,
                            ResumeJsonProxy    resumeJsonProxy,
                            UserDetailsService userDetailsService,
                            UserService        userService) {

        this.userDetailsService = userDetailsService;
        this.resumeJsonProxy    = resumeJsonProxy;
        this.resumeProxy        = resumeProxy;
        this.userService        = userService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadAndForwardResume(@RequestParam("file") MultipartFile file, Principal principal) {

        logger.info("Received file upload request from user: " + principal.getName());

        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());

        try {
            String response = resumeProxy.forwardResumeToResumeService(
                    file,
                    principal.getName(),
                    user.getId().toString()
            );

            /*
              Updates the user's resume status and stores the URL when the response is successful
              returns error otherwise.
             */
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode   = mapper.readTree(response);

            if (jsonNode.has("success") && !jsonNode.get("success").asBoolean()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(jsonNode);
            }
            user.setHasResume(true);
            user.setResumeUrl(jsonNode.get("downloadUrl").asText());
            userService.saveUpdatedUser(user);

            logger.info(jsonNode.get("downloadUrl").asText());

            return ResponseEntity.status(HttpStatus.OK)
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to forward: " + e.getMessage());
        }
    }

    @PostMapping("/extract")
    public ResponseEntity<?> extractDetailsFromResume(Principal principal) {
        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());

        if (user == null || !user.isHasResume()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Resume not found for user. Please upload a resume first.");
            response.put("details", "User: " + principal.getName() + " has no resume uploaded.");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        return ResponseEntity.status(HttpStatus.OK)
                .body(
                    resumeJsonProxy.extractDetailsFromResume(new ResumeForwardWrapper(
                            null,
                            user.getResumeUrl(),
                            user.getId(),
                            user.getUsername()
        )));
    }

    @PostMapping("/save")
    public String saveResume(@RequestBody ResumeDataRequest resumeData) {

        logger.info("Received request to save resume data for user: " + resumeData.getFilename());

        userEntity user = (userEntity) userDetailsService.loadUserByUsername(resumeData.getUploadedBy());
        return resumeJsonProxy.saveResume(new ResumeForwardWrapper(
                resumeData,
                null,
                user.getId(),
                user.getUsername()
        ));
    }

    @PostMapping("/basic-search")
    public ResponseEntity<?> basicSearchResume(@RequestBody BasicSearchRequest basicSearchRequest, Principal principal) {

        logger.info("Received basic search request from user: " + principal.getName());

        try {
            String jsonResponse          = resumeJsonProxy.basicSearchResume(basicSearchRequest);
            ObjectMapper mapper          = new ObjectMapper();
            BasicSearchResponse response = mapper.readValue(jsonResponse, BasicSearchResponse.class);

            return ResponseEntity.status(HttpStatus.OK)
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BasicSearchResponse(false, Collections.emptyList(), "Failed: " + e.getMessage()));
        }
    }

}
