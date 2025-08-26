package com.example.server.User.Controller;

import com.example.server.User.DTO.OrganizationCreateDTO;
import com.example.server.User.DTO.OrganizationUpdateDTO;
import com.example.server.User.Service.UserService;
import com.example.server.User.models.OrganizationEntity;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/organization")
public class OrganizationController {

    private static final Logger      logger = Logger.getLogger(OrganizationController.class.getName());
    private final        UserService userService;
    private final        ModelMapper modelMapper;

    public OrganizationController(UserService userService, ModelMapper modelMapper) {
        this.userService = userService;
        this.modelMapper = modelMapper;
    }


    @GetMapping("/{OrganizationId}")
    public ResponseEntity<?> getOrganizationByOrganizationId(@PathVariable String OrganizationId) {
        try {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(userService.getOrganizationById(OrganizationId));
        } catch (Exception e) {
            logger.severe("Error retrieving organization profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve organization profile: " + e.getMessage());
        }
    }


    @GetMapping("/all")
    public ResponseEntity<?> getOrganizationsByUserEmail(Principal principal) {
        try {
                    List<OrganizationEntity> organizations = userService.getOrganizationsByOwnerEmail(principal.getName());
            return ResponseEntity.status(HttpStatus.OK)
                    .body(
                            Map.of(
                                    "success", true,
                                    "data", organizations,
                                    "count", organizations.size()
                            )
                    );
        } catch (Exception e) {
            logger.severe("Error retrieving organizations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve organizations: " + e.getMessage());
        }
    }


    @PostMapping("/new")
    public ResponseEntity<?> createOrganizationProfile(@RequestBody OrganizationCreateDTO organizationRequestDTO,
                                                       Principal principal) {
        try{
            logger.info("Creating Organization Profile request received from" + principal.getName());

            OrganizationEntity entity = modelMapper.map(organizationRequestDTO, OrganizationEntity.class);
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            entity.setOwnerEmail(principal.getName());

            return ResponseEntity.ok(
                    userService.createOrganizationProfile(entity, principal.getName())
            );

        }catch (Exception e){
            logger.severe("Error creating organization profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create organization profile: " + e.getMessage());
        }
    }


    @PatchMapping("/{OrganizationId}")
    public ResponseEntity<?> updateOrganization( @PathVariable String OrganizationId,
                                                 @RequestBody  OrganizationUpdateDTO dto,
                                                 Principal principal) {

        OrganizationEntity org = userService.updateOrganizationProfile( dto, OrganizationId, principal.getName());

        if( org == null) {
            logger.warning("Organization not found or user not authorized to update it. Check Server log for details.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Organization not found or you are not authorized to update it.");
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", org
        ));
    }

    @DeleteMapping("/{OrganizationId}")
    public ResponseEntity<?> deleteOrganization(@PathVariable String OrganizationId,
                                                Principal principal) {
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

    @PostMapping("/{organizationId}/profile-photo")
    public ResponseEntity<Map<String, Object>> uploadOrganizationProfilePhoto(@RequestParam("file") MultipartFile file,
                                                                              @PathVariable ("organizationId") String organizationId,
                                                                              Principal principal) {
        try {
            String url = userService.updateOrganizationProfilePicture(file, organizationId ,principal.getName());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "coverPhotoUrl", url
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
