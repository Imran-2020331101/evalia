package com.example.server.UserProfile.Service;

import com.example.server.UserProfile.DTO.*;
import com.example.server.exception.CustomExceptions.ResourceNotFoundException;
import com.example.server.exception.CustomExceptions.UserNotFoundException;
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
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger logger = Logger.getLogger(UserService.class.getName());
    private final UserRepository userRepository;
    private final ResumeJsonProxy resumeJsonProxy;
    private final CloudinaryService cloudinaryService;

    public UserService(UserRepository userRepository,
            ResumeJsonProxy resumeJsonProxy,
            CloudinaryService cloudinaryService) {

        this.userRepository = userRepository;
        this.resumeJsonProxy = resumeJsonProxy;
        this.cloudinaryService = cloudinaryService;
    }

    public userEntity loadUserById(String id) {
        return userRepository.findById(new ObjectId(id))
                .orElseThrow(() -> new UsernameNotFoundException("Email not found"));
    }

    public void saveUpdatedUser(userEntity user) {
        userRepository.save(user);
    }

    public String updateUserProfilePicture(MultipartFile file, String email) throws IOException {
        userEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        String imageUrl = cloudinaryService.uploadImageToCloudinary(file, "profile_images");
        user.setProfilePictureUrl(imageUrl);
        userRepository.save(user);
        return imageUrl;
    }

    public String updateUserCoverPicture(MultipartFile file, String email) throws IOException {
        userEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        String imageUrl = cloudinaryService.uploadImageToCloudinary(file, "cover_photos");
        user.setCoverPictureUrl(imageUrl);
        userRepository.save(user);
        return imageUrl;
    }

    /**
     * Hides the userEntity's sensitive information and returns a UserDTO.
     * This method is useful for sending user data in API responses without exposing
     * sensitive fields.
     * It maps the fields from the userEntity to the UserDTO, including roles.
     */
    public UserDTO toUserDTO(userEntity user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setEmailVerified(user.isEmailVerified());

        dto.setBio(user.getBio());
        dto.setLocation(user.getLocation());
        dto.setAboutMe(user.getAboutMe());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setCoverPictureUrl(user.getCoverPictureUrl());
        dto.setHasResume(user.isHasResume());
        dto.setResumeUrl(user.getResumeUrl());
        dto.setHasAnyOrganization(user.isHasAnyOrganization());
        dto.setOrganizations(user.getOrganizationId());
        dto.setProvider(user.getProvider());

        List<String> roleNames = user.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        dto.setRoles(roleNames);

        return dto;
    }

    public Profile obtainCandidateProfileFromResume(String name) throws IOException {
        userEntity user = userRepository.findByEmail(name)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + name));
        if (!user.isHasResume()) {
            return new Profile(null, toUserDTO(user));
        }
        try {
            String jsonResponse = resumeJsonProxy.getResumeByEmail(
                    new ForwardProfileRequest(user.getEmail())
            );

            logger.info("returned response from resume server " + jsonResponse);

            ObjectMapper mapper = new ObjectMapper();
            ResumeFetchResponse resumeResponse = mapper.readValue(jsonResponse, ResumeFetchResponse.class);

            if (!resumeResponse.isSuccess()) {
                return new Profile(null, toUserDTO(user));
            }

            return new Profile(resumeResponse.getData(), toUserDTO(user));

        } catch (Exception e) {
            logger.warning("Failed to parse resume");
            // return profile with no resume so frontend always gets a response
            return new Profile(null, toUserDTO(user));
        }

    }

    public UserDTO updateUserProfile(UpdateUserProfileRequest updateDTO, String email) {
        userEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        try {
            Field[] fields = UpdateUserProfileRequest.class.getDeclaredFields();
            for (Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(updateDTO);
                if (value != null) {
                    try {
                        Field entityField = userEntity.class.getDeclaredField(field.getName());
                        entityField.setAccessible(true);
                        entityField.set(user, value);
                    } catch (NoSuchFieldException ignore) {
                        logger.warning("Skipping unknown field: " + field.getName());
                    }
                }
            }

            user.setUpdatedAt(LocalDateTime.now());

            userEntity updatedUser = userRepository.save(user);
            return toUserDTO(updatedUser);
        } catch (Exception e) {
            logger.severe("Error updating user profile: " + e.getMessage());
            throw new RuntimeException("Failed to update user profile", e);
        }
    }

    public UserDTO getUserByEmail(String email) {

        userEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return toUserDTO(user);
    }
}