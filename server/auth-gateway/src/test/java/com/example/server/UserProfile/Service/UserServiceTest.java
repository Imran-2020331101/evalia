package com.example.server.UserProfile.Service;

import com.example.server.UserProfile.DTO.Profile;
import com.example.server.UserProfile.DTO.UpdateUserProfileRequest;
import com.example.server.UserProfile.DTO.UserDTO;
import com.example.server.exception.CustomExceptions.ResourceNotFoundException;
import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.UserRepository;
import com.example.server.support.TestDataFactory;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    private static final String EMAIL = TestDataFactory.EMAIL;

    @Mock
    private UserRepository userRepository;
    @Mock
    private ResumeJsonProxy resumeJsonProxy;
    @Mock
    private CloudinaryService cloudinaryService;

    private UserService service;
    private userEntity user;

    @BeforeEach
    void setUp() {
        service = new UserService(userRepository, resumeJsonProxy, cloudinaryService);
        user = TestDataFactory.user();
    }

    @Test
    void loadUserByIdReturnsUser() {
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        assertThat(service.loadUserById(user.getId().toHexString())).isSameAs(user);
    }

    @Test
    void loadUserByIdThrowsWhenMissing() {
        ObjectId id = new ObjectId();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserById(id.toHexString()))
                .isInstanceOf(UserNotFoundException.class).hasMessageContaining(id.toHexString());
    }

    @Test
    void saveUpdatedUserSaves() {
        service.saveUpdatedUser(user);

        verify(userRepository).save(user);
    }

    @Test
    void profilePictureUploadedAndSaved() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", new byte[]{1});
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(cloudinaryService.uploadImageToCloudinary(file, "profile_images")).thenReturn("https://cdn/p.png");

        assertThat(service.updateUserProfilePicture(file, EMAIL)).isEqualTo("https://cdn/p.png");
        assertThat(user.getProfilePictureUrl()).isEqualTo("https://cdn/p.png");
        verify(userRepository).save(user);
    }

    @Test
    void profilePictureUnknownUser() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateUserProfilePicture(new MockMultipartFile("f", new byte[]{1}), EMAIL))
                .isInstanceOf(UserNotFoundException.class);
        verifyNoInteractions(cloudinaryService);
    }

    @Test
    void coverPictureUploadedAndSaved() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", new byte[]{1});
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(cloudinaryService.uploadImageToCloudinary(file, "cover_photos")).thenReturn("https://cdn/c.png");

        assertThat(service.updateUserCoverPicture(file, EMAIL)).isEqualTo("https://cdn/c.png");
        assertThat(user.getCoverPictureUrl()).isEqualTo("https://cdn/c.png");
        verify(userRepository).save(user);
    }

    @Test
    void coverPictureUnknownUser() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateUserCoverPicture(new MockMultipartFile("f", new byte[]{1}), EMAIL))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void toUserDtoCopiesFieldsAndFlattensRoles() {
        user.setBio("bio");
        user.setLocation("Dhaka");
        user.setAboutMe("about");
        user.setProfilePictureUrl("p");
        user.setCoverPictureUrl("c");
        user.setHasResume(true);
        user.setResumeUrl("r");
        user.setHasAnyOrganization(true);
        user.getOrganizationId().add("org1");
        user.setProvider("google");

        UserDTO dto = service.toUserDTO(user);

        assertThat(dto.getId()).isEqualTo(user.getId().toString());
        assertThat(dto.getName()).isEqualTo("Jane Doe");
        assertThat(dto.getEmail()).isEqualTo(EMAIL);
        assertThat(dto.isEmailVerified()).isTrue();
        assertThat(dto.getRoles()).containsExactly("USER");
        assertThat(dto.getBio()).isEqualTo("bio");
        assertThat(dto.getLocation()).isEqualTo("Dhaka");
        assertThat(dto.getAboutMe()).isEqualTo("about");
        assertThat(dto.getProfilePictureUrl()).isEqualTo("p");
        assertThat(dto.getCoverPictureUrl()).isEqualTo("c");
        assertThat(dto.isHasResume()).isTrue();
        assertThat(dto.getResumeUrl()).isEqualTo("r");
        assertThat(dto.isHasAnyOrganization()).isTrue();
        assertThat(dto.getOrganizations()).containsExactly("org1");
        assertThat(dto.getProvider()).isEqualTo("google");
    }

    // ------------------------------------------- obtainCandidateProfileFromResume

    @Test
    void profileWithoutResumeSkipsResumeService() throws IOException {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

        Profile profile = service.obtainCandidateProfileFromResume(EMAIL);

        assertThat(profile.getResumeData()).isNull();
        assertThat(profile.getUser().getEmail()).isEqualTo(EMAIL);
        verifyNoInteractions(resumeJsonProxy);
    }

    @Test
    void profileWithResumeIncludesResumeData() throws IOException {
        user.setHasResume(true);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(resumeJsonProxy.getResumeByEmail(EMAIL))
                .thenReturn(ResponseEntity.ok("{\"success\":true,\"data\":{\"filename\":\"cv.pdf\"}}"));

        Profile profile = service.obtainCandidateProfileFromResume(EMAIL);

        assertThat(profile.getResumeData()).isNotNull();
        assertThat(profile.getResumeData().getFilename()).isEqualTo("cv.pdf");
    }

    @Test
    void profileWhenResumeServiceReportsFailureHasNoResume() throws IOException {
        user.setHasResume(true);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(resumeJsonProxy.getResumeByEmail(EMAIL)).thenReturn(ResponseEntity.ok("{\"success\":false,\"error\":\"x\"}"));

        assertThat(service.obtainCandidateProfileFromResume(EMAIL).getResumeData()).isNull();
    }

    @Test
    void profileWhenResumeBodyIsNotJsonFallsBack() throws IOException {
        user.setHasResume(true);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(resumeJsonProxy.getResumeByEmail(EMAIL)).thenReturn(ResponseEntity.ok("<html>"));

        Profile profile = service.obtainCandidateProfileFromResume(EMAIL);

        assertThat(profile.getResumeData()).isNull();
        assertThat(profile.getUser()).isNotNull();
    }

    @Test
    void profileWhenResumeServiceIsDownFallsBack() throws IOException {
        user.setHasResume(true);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(resumeJsonProxy.getResumeByEmail(EMAIL)).thenThrow(new RuntimeException("connection refused"));

        assertThat(service.obtainCandidateProfileFromResume(EMAIL).getResumeData()).isNull();
    }

    @Test
    void profileForUnknownUser() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtainCandidateProfileFromResume(EMAIL))
                .isInstanceOf(UserNotFoundException.class);
    }

    // ---------------------------------------------------------- updateUserProfile

    @Test
    void updateUserProfileAppliesOnlyProvidedFields() {
        user.setBio("old bio");
        user.setLocation("old loc");
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        UpdateUserProfileRequest request = new UpdateUserProfileRequest();
        request.setName("New Name");
        request.setAboutMe("new about");

        UserDTO dto = service.updateUserProfile(request, EMAIL);

        assertThat(user.getName()).isEqualTo("New Name");
        assertThat(user.getAboutMe()).isEqualTo("new about");
        assertThat(user.getBio()).isEqualTo("old bio");
        assertThat(user.getLocation()).isEqualTo("old loc");
        assertThat(dto.getName()).isEqualTo("New Name");
    }

    @Test
    void updateUserProfileUnknownUser() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateUserProfile(new UpdateUserProfileRequest(), EMAIL))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateUserProfileWrapsPersistenceFailure() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(userRepository.save(any(userEntity.class))).thenThrow(new IllegalStateException("db"));

        assertThatThrownBy(() -> service.updateUserProfile(new UpdateUserProfileRequest(), EMAIL))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to update user profile")
                .hasCauseInstanceOf(IllegalStateException.class);
    }

    @Test
    void getUserByEmailReturnsDto() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

        assertThat(service.getUserByEmail(EMAIL).getEmail()).isEqualTo(EMAIL);
    }

    @Test
    void getUserByEmailUnknown() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getUserByEmail(EMAIL)).isInstanceOf(UserNotFoundException.class);
    }
}
