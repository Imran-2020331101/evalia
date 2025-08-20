package com.example.server.User.Controller;

import com.example.server.User.DTO.ForwardProfileRequest;
import com.example.server.User.DTO.Profile;
import com.example.server.User.Service.UserService;
import com.example.server.User.models.OrganizationEntity;
import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.logging.Logger;
import org.springframework.data.mongodb.core.MongoTemplate;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final Logger      logger = Logger.getLogger(UserController.class.getName());
    private final UserService        userService;
    private final ResumeJsonProxy    resumeJsonProxy;
    private final UserDetailsService userDetailsService;
    private final MongoTemplate      mongoTemplate;


    public UserController(UserService        userService,
                          ResumeJsonProxy    resumeJsonProxy,
                          UserDetailsService userDetailsService,
                          MongoTemplate      mongoTemplate) {

        this.userService        = userService;
        this.resumeJsonProxy    = resumeJsonProxy;
        this.userDetailsService = userDetailsService;
        this.mongoTemplate      = mongoTemplate;
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


    @PostMapping
    public ResponseEntity<?> createOrganizationProfile(@RequestBody OrganizationEntity organizationEntity, Principal principal) {
        try{
            logger.info("Creating Organization Profile request received from" + principal.getName());
            userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
            if (user.isHasOrganization()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("User already has an organization profile.");
            }

            // Create a new organization profile
            organizationEntity.setOwnerEmail(user.getEmail());
            organizationEntity.setId(null);
            userService.createOrganizationProfile(organizationEntity);
            return ResponseEntity.ok("Organization profile created successfully.");

        }catch (Exception e){
            logger.severe("Error creating organization profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create organization profile: " + e.getMessage());
        }
    }

    @GetMapping("/organization/profile")
    public ResponseEntity<?> getOrganizationProfile(Principal principal) {
        try {
            userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
            if (!user.isHasOrganization()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User does not have an organization profile.");
            }

            OrganizationEntity organization = userService.getOrganizationByOwnerEmail(user.getEmail());
            return ResponseEntity.ok(organization);
        } catch (Exception e) {
            logger.severe("Error retrieving organization profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve organization profile: " + e.getMessage());
        }
    }


    //TODO: the following two methods has the same purpose, need to be merged

    @PutMapping("/organizations/profile")
    public ResponseEntity<?> updateOrganizationProfile(@RequestBody OrganizationEntity organizationEntity, Principal principal) {
        try {
            logger.info("Updating Organization Profile request received from " + principal.getName());
            userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());
            if (!user.isHasOrganization()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User does not have an organization profile.");
            }

            // Update the organization profile
            organizationEntity.setOwnerEmail(user.getEmail());
            userService.createOrganizationProfile(organizationEntity);
            return ResponseEntity.ok("Organization profile updated successfully.");
        } catch (Exception e) {
            logger.severe("Error updating organization profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update organization profile: " + e.getMessage());
        }
    }

    @PatchMapping("/organizations/{id}")
    public ResponseEntity<?> updateOrganization(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates) {

        Update update = new Update();
        updates.forEach(update::set);

        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(id)),
                update,
                OrganizationEntity.class
        );

        return ResponseEntity.ok("Organization updated");
    }


}