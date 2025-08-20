package com.example.server.User.Service;

import com.example.server.User.Controller.UserController;
import com.example.server.User.DTO.OrganizationUpdateDTO;
import com.example.server.User.DTO.UserDTO;
import com.example.server.User.models.OrganizationEntity;
import com.example.server.User.repository.OrganizationRepository;
import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;


@Service
public class UserService {

    private static final Logger logger  = Logger.getLogger(UserService.class.getName());
    private final UserRepository          userRepository;
    private final OrganizationRepository  organizationRepository;

    public UserService(UserRepository          userRepository,
                       OrganizationRepository  organizationRepository) {

        this.userRepository         =  userRepository;
        this.organizationRepository =  organizationRepository;
    }

    public userEntity loadUserById(String id) {
        return userRepository.findById(new ObjectId(id))
                .orElseThrow(() -> new UsernameNotFoundException("Email not found"));
    }

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
        List<OrganizationEntity> organizations = organizationRepository.findAllByOwnerEmail(email);

        if (organizations.isEmpty()) {
            throw new UsernameNotFoundException("No organizations found for email: " + email);
        }

        return organizations;
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

}