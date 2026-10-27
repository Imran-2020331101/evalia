package com.example.server.UserProfile.Controller;

import com.example.server.security.models.userEntity;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserControllerIT extends AbstractIntegrationTest {

    private static final String EMAIL = TestDataFactory.EMAIL;

    @Test
    void ownProfileWithoutResume() throws Exception {
        givenUser(EMAIL);

        mockMvc.perform(get("/api/user/profile").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value(EMAIL))
                .andExpect(jsonPath("$.data.user.roles[0]").value("USER"));
        verifyNoInteractions(resumeJsonProxy);
    }

    @Test
    void ownProfileWithResumeCallsResumeService() throws Exception {
        givenUser(EMAIL).setHasResume(true);
        when(resumeJsonProxy.getResumeByEmail(EMAIL)).thenReturn(
                org.springframework.http.ResponseEntity.ok("{\"success\":true,\"data\":{\"filename\":\"cv.pdf\"}}"));

        mockMvc.perform(get("/api/user/profile").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.resumeData.filename").value("cv.pdf"));
    }

    @Test
    void profileOfAnotherUserById() throws Exception {
        givenUser(EMAIL);
        userEntity other = givenUser("other@example.com");

        mockMvc.perform(get("/api/user/{id}/single", other.getId().toHexString()).header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.email").value("other@example.com"));
    }

    @Test
    void updateDetailsPersistsChanges() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(userRepository.save(user)).thenReturn(user);

        mockMvc.perform(patch("/api/user/update/details").header("Authorization", bearer(EMAIL))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"bio\":\"hello\",\"location\":\"Dhaka\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bio").value("hello"));

        assertThat(user.getBio()).isEqualTo("hello");
        assertThat(user.getLocation()).isEqualTo("Dhaka");
    }

    @Test
    void profilePhotoIsUploadedThroughCloudinaryService() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(cloudinaryService.uploadImageToCloudinary(any(), org.mockito.ArgumentMatchers.eq("profile_images")))
                .thenReturn("https://cdn/p.png");

        mockMvc.perform(multipart("/api/user/update/profile-photo")
                        .file(new MockMultipartFile("file", "p.png", "image/png", new byte[]{1}))
                        .header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://cdn/p.png"));
        assertThat(user.getProfilePictureUrl()).isEqualTo("https://cdn/p.png");
    }

    @Test
    void coverPhotoIsUploadedThroughCloudinaryService() throws Exception {
        givenUser(EMAIL);
        when(cloudinaryService.uploadImageToCloudinary(any(), org.mockito.ArgumentMatchers.eq("cover_photos")))
                .thenReturn("https://cdn/c.png");

        mockMvc.perform(multipart("/api/user/update/cover-photo")
                        .file(new MockMultipartFile("file", "c.png", "image/png", new byte[]{1}))
                        .header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://cdn/c.png"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void bulkImageUploadUsesCloudinaryClient() throws Exception {
        givenUser(EMAIL);
        com.cloudinary.Uploader uploader = mock(com.cloudinary.Uploader.class);
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(), any(Map.class))).thenReturn(Map.of("secure_url", "https://cdn/1.png"));

        mockMvc.perform(multipart("/api/user/image/upload")
                        .file(new MockMultipartFile("files", "1.png", "image/png", new byte[]{1}))
                        .header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uploadedUrls[0]").value("https://cdn/1.png"));
    }

    @Test
    void anonymousIsRejected() throws Exception {
        mockMvc.perform(get("/api/user/profile")).andExpect(status().isUnauthorized());
    }
}
