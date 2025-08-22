package com.example.server.User.Controller;

import com.example.server.User.DTO.ForwardProfileRequest;
import com.example.server.User.DTO.OrganizationCreateDTO;
import com.example.server.User.DTO.OrganizationUpdateDTO;
import com.example.server.User.DTO.Profile;
import com.example.server.User.Service.UserService;
import com.example.server.User.models.OrganizationEntity;
import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.security.models.userEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.modelmapper.ModelMapper;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final Logger      logger = Logger.getLogger(UserController.class.getName());
    private final UserService        userService;
    private final ResumeJsonProxy    resumeJsonProxy;
    private final ModelMapper        modelMapper;


    public UserController(UserService        userService,
                          ResumeJsonProxy    resumeJsonProxy,
                          ModelMapper        modelMapper) {

        this.userService        = userService;
        this.resumeJsonProxy    = resumeJsonProxy;
        this.modelMapper        = modelMapper;
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


    @PostMapping("/organization/new")
    public ResponseEntity<?> createOrganizationProfile(@RequestBody OrganizationCreateDTO organizationRequestDTO,
                                                                    Principal principal) {
        try{
            logger.info("Creating Organization Profile request received from" + principal.getName());

            OrganizationEntity entity = modelMapper.map(organizationRequestDTO, OrganizationEntity.class);
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());

            return ResponseEntity.ok(
                userService.createOrganizationProfile(entity, principal.getName())
            );

        }catch (Exception e){
            logger.severe("Error creating organization profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create organization profile: " + e.getMessage());
        }
    }

    @GetMapping("/organization/{OrganizationId}")
    public ResponseEntity<?> getOrganizationById(@PathVariable String OrganizationId) {
        try {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(userService.getOrganizationById(OrganizationId));
        } catch (Exception e) {
            logger.severe("Error retrieving organization profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve organization profile: " + e.getMessage());
        }
    }


    @PatchMapping("/organization/{OrganizationId}")
    public ResponseEntity<?> updateOrganization( @PathVariable String OrganizationId,
                                                 @RequestBody  OrganizationUpdateDTO dto,
                                                               Principal principal) {

        OrganizationEntity org = userService.updateOrganizationProfile( dto, OrganizationId, principal.getName());

        if( org == null) {
            logger.warning("Organization not found or user not authorized to update it. Check Server log for details.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Organization not found or you are not authorized to update it.");
        }

        return ResponseEntity.ok("Organization updated successfully");
    }

    @DeleteMapping("/organization/{OrganizationId}")
    public ResponseEntity<?> deleteOrganization(@PathVariable String OrganizationId, Principal principal) {
        try {
            boolean deleted = userService.deleteOrganization(OrganizationId, principal.getName());
            if (deleted) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body("Organization deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Organization not found or you do not own the Organization.");
            }
        } catch (Exception e) {
            logger.severe("Error deleting organization: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete organization: " + e.getMessage());
        }
    }

}