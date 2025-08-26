package com.example.server.User.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.server.User.DTO.ForwardProfileRequest;
import com.example.server.User.DTO.OrganizationUpdateDTO;
import com.example.server.User.DTO.Profile;
import com.example.server.User.DTO.UserDTO;
import com.example.server.User.models.OrganizationEntity;
import com.example.server.User.repository.OrganizationRepository;
import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.types.ObjectId;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;


@Service
public class UserService {

    private static final Logger logger  = Logger.getLogger(UserService.class.getName());
    private final UserRepository          userRepository;
    private final OrganizationRepository  organizationRepository;
    private final Cloudinary              cloudinary;
    private final ResumeJsonProxy resumeJsonProxy;

    public UserService(UserRepository          userRepository,
                       OrganizationRepository  organizationRepository,
                       Cloudinary              cloudinary,
                       ResumeJsonProxy         resumeJsonProxy) {

        this.userRepository         =  userRepository;
        this.organizationRepository =  organizationRepository;
        this.cloudinary             =  cloudinary;
        this.resumeJsonProxy        =  resumeJsonProxy;
    }

    public userEntity loadUserById(String id) {
        return userRepository.findById(new ObjectId(id))
                .orElseThrow(() -> new UsernameNotFoundException("Email not found"));
    }


    public void saveUpdatedUser(userEntity user) {
        userRepository.save(user);
    }

    public OrganizationEntity createOrganizationProfile(OrganizationEntity organization, String email) {
        userEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        OrganizationEntity newOrganization = organizationRepository.save(organization);

        user.setHasAnyOrganization(true);

        List<String> orgIds = user.getOrganizationId();
        orgIds.add(newOrganization.getId());
        user.setOrganizationId(orgIds);
        userRepository.save(user);
        return newOrganization;
    }

    public OrganizationEntity getOrganizationById(String id) {
        return organizationRepository.findById(new ObjectId(id))
                .orElseThrow(() -> new UsernameNotFoundException("Organization not found with ID: " + id));
    }

    /**
     * Retrieves all organizations by the owner's email.
     * @return List of organization entities associated with the given email.
     */
    public List<OrganizationEntity> getOrganizationsByOwnerEmail(String email) {

        return organizationRepository.findAllByOwnerEmail(email);
    }


    /**
     * It dynamically loops through the fields of the OrganizationUpdateDTO
     * and updates the corresponding fields in the OrganizationEntity.
     * It uses reflection to update only the non-null fields in the DTO.
     * If the organization is not found or the email does not match the owner's email, it returns null.

     * @return OrganizationEntity if update is successful, null otherwise.
     */
    public OrganizationEntity updateOrganizationProfile(OrganizationUpdateDTO organizationUpdateDTO, String id, String email) {

        OrganizationEntity org = organizationRepository.findById(new ObjectId(id)).orElse(null);

        if (org == null || !org.getOwnerEmail().equals(email)) return null ;
        try {

            // Use reflection to dynamically update non-null fields
            Field[] fields = OrganizationUpdateDTO.class.getDeclaredFields();
            for (Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(organizationUpdateDTO);
                if (value != null) {
                    Field entityField = OrganizationEntity.class.getDeclaredField(field.getName());
                    entityField.setAccessible(true);
                    entityField.set(org, value);
                }
            }
            org.setUpdatedAt(LocalDateTime.now());

            return organizationRepository.save(org);
        } catch (Exception e) {
            logger.severe("Error updating organization profile: " + e.getMessage());
            return null;
        }
    }

    public boolean deleteOrganization(String organizationId, String email) {
        OrganizationEntity organization = organizationRepository.findById(new ObjectId(organizationId)).orElse(null);

        if (organization == null || !organization.getOwnerEmail().equals(email)) {
            logger.warning("Organization not found or user does not own the Organization.");
            return false;
        }


        //TODO: After deleting the organization, we should also remove the job's created under this organization.
        // This is a placeholder for the actual job deletion logic.
        // jobRepository.deleteAllByOrganizationId(organizationId);


        try {
            organizationRepository.delete(organization);
            userEntity user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                List<String> orgIds = user.getOrganizationId();
                orgIds.remove(organizationId);
                user.setOrganizationId(orgIds);
                userRepository.save(user);
            }
            return true;
        } catch (Exception e) {
            logger.severe("Error deleting organization: " + e.getMessage());
            return false;
        }
    }

    public String updateUserProfilePicture(MultipartFile file, String email) throws IOException {
        userEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        String imageUrl = uploadImageToCloudinary(file, "profile_images");
        user.setProfilePictureUrl(imageUrl);
        userRepository.save(user);
        return imageUrl;
    }

    public String updateUserCoverPicture(MultipartFile file, String email) throws IOException {
        userEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        String imageUrl = uploadImageToCloudinary(file, "cover_photos");
        user.setCoverPictureUrl(imageUrl);
        userRepository.save(user);
        return imageUrl;
    }

    public String updateOrganizationProfilePicture(MultipartFile file, String organizationId, String email) throws IOException {

        OrganizationEntity org = organizationRepository.findById(new ObjectId(organizationId))
                .orElseThrow(() -> new UsernameNotFoundException("Organization not found with ID: " + organizationId));

        if (!org.getOwnerEmail().equals(email)) {
            throw new SecurityException("You do not have permission to update this organization's profile picture.");
        }

        String imageUrl = uploadImageToCloudinary(file, "organization_profile_images");
        org.setOrganizationProfileImageUrl(imageUrl);

        organizationRepository.save(org);
        return imageUrl;
    }

    public String uploadImageToCloudinary(MultipartFile file, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "auto",
                        "folder", folder   // keep files organized in cloudinary
                )
        );
        return uploadResult.get("secure_url").toString();
    }

    /**
     * Hides the userEntity's sensitive information and returns a UserDTO.
     * This method is useful for sending user data in API responses without exposing sensitive fields.
     * It maps the fields from the userEntity to the UserDTO, including roles.
     */
    public UserDTO toUserDTO(userEntity user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setHasResume(user.isHasResume());
        dto.setProvider(user.getProvider());

        List<String> roleNames = user.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        dto.setRoles(roleNames);

        return dto;
    }

    public Object getOrganizationsByUserId(String userId) {
        userEntity user = userRepository.findById(new ObjectId(userId))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        return organizationRepository.findAllByOwnerEmail(user.getEmail());
    }

    public Profile obtainUserProfileFromResume(String name) throws IOException {
        userEntity user              = userRepository.findByEmail(name)
                                            .orElseThrow(() -> new UsernameNotFoundException("Email not found"));
        String jsonResponse          = resumeJsonProxy.getResumeByEmail(new ForwardProfileRequest(user.getEmail()));
        ObjectMapper mapper          = new ObjectMapper();
        ResumeDataRequest resumeData = mapper.readValue(jsonResponse, ResumeDataRequest.class);

        return new Profile(resumeData, toUserDTO(user));

    }
}