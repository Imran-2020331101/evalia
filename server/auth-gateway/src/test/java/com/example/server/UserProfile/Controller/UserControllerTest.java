package com.example.server.UserProfile.Controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.example.server.UserProfile.DTO.Profile;
import com.example.server.UserProfile.DTO.UpdateUserProfileRequest;
import com.example.server.UserProfile.DTO.UserDTO;
import com.example.server.UserProfile.Service.UserService;
import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.exception.handler.GlobalExceptionHandler;
import com.example.server.security.models.userEntity;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private static final String EMAIL = TestDataFactory.EMAIL;
    private static final Principal PRINCIPAL = () -> EMAIL;

    @Mock
    private UserService userService;
    @Mock
    private Cloudinary cloudinary;
    @Mock
    private Uploader uploader;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new UserController(userService, cloudinary))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private Profile profile() {
        UserDTO dto = new UserDTO();
        dto.setEmail(EMAIL);
        return new Profile(null, dto);
    }

    @Test
    void singleProfileLooksUpUserThenItsResumeProfile() throws Exception {
        userEntity user = TestDataFactory.user();
        when(userService.loadUserById("abc")).thenReturn(user);
        when(userService.obtainCandidateProfileFromResume(EMAIL)).thenReturn(profile());

        mvc.perform(get("/api/user/abc/single"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value(EMAIL));
    }

    @Test
    void singleProfileUnknownUserIs404() throws Exception {
        when(userService.loadUserById("abc")).thenThrow(new UserNotFoundException("nope"));

        mvc.perform(get("/api/user/abc/single")).andExpect(status().isNotFound());
    }

    @Test
    void ownProfileUsesPrincipal() throws Exception {
        when(userService.obtainCandidateProfileFromResume(EMAIL)).thenReturn(profile());

        mvc.perform(get("/api/user/profile").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.email").value(EMAIL));
    }

    @Test
    void profilePhotoUploadReturnsUrl() throws Exception {
        when(userService.updateUserProfilePicture(any(), eq(EMAIL))).thenReturn("https://cdn/p.png");

        mvc.perform(multipart("/api/user/update/profile-photo")
                        .file(new MockMultipartFile("file", "a.png", "image/png", new byte[]{1})).principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.url").value("https://cdn/p.png"));
    }

    @Test
    void profilePhotoUploadIoErrorIs500() throws Exception {
        when(userService.updateUserProfilePicture(any(), any())).thenThrow(new IOException("io"));

        mvc.perform(multipart("/api/user/update/profile-photo")
                        .file(new MockMultipartFile("file", new byte[]{1})).principal(PRINCIPAL))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("io"));
    }

    @Test
    void coverPhotoUploadReturnsUrl() throws Exception {
        when(userService.updateUserCoverPicture(any(), eq(EMAIL))).thenReturn("https://cdn/c.png");

        mvc.perform(multipart("/api/user/update/cover-photo")
                        .file(new MockMultipartFile("file", new byte[]{1})).principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://cdn/c.png"));
    }

    @Test
    void coverPhotoUploadIoErrorIs500() throws Exception {
        when(userService.updateUserCoverPicture(any(), any())).thenThrow(new IOException("io"));

        mvc.perform(multipart("/api/user/update/cover-photo")
                        .file(new MockMultipartFile("file", new byte[]{1})).principal(PRINCIPAL))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void updateDetailsReturnsUpdatedUser() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setName("New");
        when(userService.updateUserProfile(any(UpdateUserProfileRequest.class), eq(EMAIL))).thenReturn(dto);

        mvc.perform(patch("/api/user/update/details").principal(PRINCIPAL)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"New\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("New"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void multiImageUploadReturnsAllSecureUrls() throws Exception {
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(), any(Map.class)))
                .thenReturn(Map.of("secure_url", "https://cdn/1.png"))
                .thenReturn(Map.of("secure_url", "https://cdn/2.png"));

        mvc.perform(multipart("/api/user/image/upload")
                        .file(new MockMultipartFile("files", "1.png", "image/png", new byte[]{1}))
                        .file(new MockMultipartFile("files", "2.png", "image/png", new byte[]{2})))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.uploadedUrls[0]").value("https://cdn/1.png"))
                .andExpect(jsonPath("$.uploadedUrls[1]").value("https://cdn/2.png"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void multiImageUploadIoErrorIs500() throws Exception {
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(), any(Map.class))).thenThrow(new IOException("cloud"));

        mvc.perform(multipart("/api/user/image/upload").file(new MockMultipartFile("files", new byte[]{1})))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("cloud"));
    }
}
