package com.example.server.UserProfile.Controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.server.UserProfile.DTO.*;
import com.example.server.UserProfile.Service.UserService;
import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.security.models.userEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.modelmapper.ModelMapper;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final Logger      logger = Logger.getLogger(UserController.class.getName());
    private final UserService        userService;
    private final ResumeJsonProxy    resumeJsonProxy;
    private final ModelMapper        modelMapper;
    private final Cloudinary         cloudinary;


    public UserController(UserService        userService,
                          ResumeJsonProxy    resumeJsonProxy,
                          ModelMapper        modelMapper,
                          Cloudinary         cloudinary) {

        this.userService        = userService;
        this.resumeJsonProxy    = resumeJsonProxy;
        this.modelMapper        = modelMapper;
        this.cloudinary         = cloudinary;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfileByUserId(@PathVariable String userId) {
        try {
            // Fetch user information
            userEntity user = (userEntity) userService.loadUserById(userId);

            // Fetch resume data from Resume Server
            String jsonResponse          = resumeJsonProxy.getResumeByEmail(new ForwardProfileRequest(user.getEmail()));
            ObjectMapper mapper          = new ObjectMapper();
            ResumeDataRequest resumeData = mapper.readValue(jsonResponse, ResumeDataRequest.class);

            return ResponseEntity.ok(new Profile(resumeData, userService.toUserDTO(user)));
        } catch (Exception e) {
            logger.severe("Error retrieving resume: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve resume: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getCandidateProfile(Principal principal) {
        try {
            Profile profile = userService.obtainCandidateProfileFromResume(principal.getName());
            return ResponseEntity.status(HttpStatus.OK).body(Map.of(
                    "success", true,
                    "data", profile
            ));
        } catch (Exception e) {
            logger.severe("Error retrieving resume: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "data", "Failed to retrieve resume: " + e.getMessage()
                    ));
        }
    }

    @PostMapping("/update/profile-photo")
    public ResponseEntity<?> uploadUserProfilePhoto(@RequestParam("file") MultipartFile file,
                                                                      Principal principal) {

        try {
            String url = userService.updateUserProfilePicture(file, principal.getName());

            return ResponseEntity.ok(
                    new ImageUploadResponse(true,url));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/update/cover-photo")
    public ResponseEntity<?> uploadUserCoverPhoto(@RequestParam("file") MultipartFile file,
                                                                    Principal principal) {

        try {
            String url = userService.updateUserCoverPicture(file, principal.getName());

            return ResponseEntity.ok(
                    new ImageUploadResponse(true, url));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PatchMapping("/update/details")
    public ResponseEntity<?> updateUserProfile( @RequestBody UpdateUserProfileRequest dto,
                                                 Principal principal) {
        userEntity user =  userService.updateUserProfile(dto, principal.getName());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", user));
    }


    @PostMapping("/image/upload")
    public ResponseEntity<Map<String, Object>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        List<String> uploadedUrls = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto"));
                uploadedUrls.add(uploadResult.get("secure_url").toString());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("uploadedUrls", uploadedUrls);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

}