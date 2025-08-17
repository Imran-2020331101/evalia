package com.example.server.User.Controller;

import com.example.server.User.DTO.ForwardProfileRequest;
import com.example.server.User.DTO.Profile;
import com.example.server.User.Service.UserService;
import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.security.models.userEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Logger;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = Logger.getLogger(UserController.class.getName());
    private final UserService userService;
    private final ResumeJsonProxy resumeJsonProxy;

    public UserController(UserService userService, ResumeJsonProxy resumeJsonProxy) {
        this.userService = userService;
        this.resumeJsonProxy = resumeJsonProxy;
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        try {
            // Fetch user information
            userEntity user = (userEntity) userService.loadUserById(userId);

            // Fetch resume data from Resume Server
            String jsonResponse = resumeJsonProxy.getResumeByEmail(new ForwardProfileRequest(user.getEmail()));
            ObjectMapper mapper = new ObjectMapper();
            ResumeDataRequest resumeData = mapper.readValue(jsonResponse, ResumeDataRequest.class);

            return ResponseEntity.ok(new Profile(resumeData, userService.toUserDTO(user)));
        } catch (Exception e) {
            logger.severe("Error retrieving resume: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve resume: " + e.getMessage());
        }
    }
}