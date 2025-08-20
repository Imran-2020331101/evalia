package com.example.server.User.Service;

import com.example.server.User.DTO.UserDTO;
import com.example.server.User.models.OrganizationEntity;
import com.example.server.User.repository.OrganizationRepository;
import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.RoleRepository;
import com.example.server.security.repository.UserRepository;
import com.nimbusds.openid.connect.sdk.assurance.evidences.Organization;
import org.bson.types.ObjectId;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;

    public UserService(UserRepository          userRepository,
                       RoleRepository          roleRepository,
                       OrganizationRepository  organizationRepository) {

        this.userRepository         =  userRepository;
        this.roleRepository         =  roleRepository;
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

    public void createOrganizationProfile(OrganizationEntity organization) {
        userEntity user = userRepository.findByEmail(organization.getOwnerEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + organization.getOwnerEmail()));

        OrganizationEntity newOrganization = organizationRepository.save(organization);
        user.setHasOrganization(true);
        user.setOrganizationId(newOrganization.getId());
        userRepository.save(user);
    }

    public OrganizationEntity getOrganizationByOwnerEmail(String email) {
        return organizationRepository.findByOwnerEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Organization not found for email: " + email));
    }
}