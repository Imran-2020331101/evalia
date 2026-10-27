package com.example.server.UserProfile.Controller;

import com.example.server.UserProfile.models.OrganizationEntity;
import com.example.server.security.models.userEntity;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrganizationControllerIT extends AbstractIntegrationTest {

    private static final String EMAIL = TestDataFactory.EMAIL;

    @Test
    void createPersistsOrganizationAndLinksOwner() throws Exception {
        userEntity user = givenUser(EMAIL);
        when(organizationRepository.save(any(OrganizationEntity.class))).thenAnswer(inv -> {
            OrganizationEntity o = inv.getArgument(0);
            o.setId(new ObjectId().toHexString());
            return o;
        });

        mockMvc.perform(post("/api/organization/new").header("Authorization", bearer(EMAIL))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"organizationName\":\"Acme\",\"yearOfEstablishment\":\"2000\","
                                + "\"organizationAddress\":\"Dhaka\",\"industryType\":\"Software\","
                                + "\"businessDescription\":\"d\",\"acceptPrivacyPolicy\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationName").value("Acme"))
                .andExpect(jsonPath("$.ownerEmail").value(EMAIL));

        assertThat(user.isHasAnyOrganization()).isTrue();
        assertThat(user.getOrganizationId()).hasSize(1);
        verify(userRepository).save(user);
    }

    @Test
    void getByIdAndListAll() throws Exception {
        givenUser(EMAIL);
        OrganizationEntity org = TestDataFactory.organization(EMAIL);
        when(organizationRepository.findById(new ObjectId(org.getId()))).thenReturn(Optional.of(org));
        when(organizationRepository.findAllByOwnerEmail(EMAIL)).thenReturn(List.of(org));

        mockMvc.perform(get("/api/organization/{id}", org.getId()).header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationName").value("Acme"));
        mockMvc.perform(get("/api/organization/all").header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));
    }

    @Test
    void updateByOwnerAndRejectedForOthers() throws Exception {
        givenUser(EMAIL);
        OrganizationEntity org = TestDataFactory.organization(EMAIL);
        when(organizationRepository.findById(new ObjectId(org.getId()))).thenReturn(Optional.of(org));
        when(organizationRepository.save(org)).thenReturn(org);

        mockMvc.perform(patch("/api/organization/{id}", org.getId()).header("Authorization", bearer(EMAIL))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"organizationName\":\"Renamed\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.organizationName").value("Renamed"));

        givenUser("intruder@example.com");
        mockMvc.perform(patch("/api/organization/{id}", org.getId()).header("Authorization", bearer("intruder@example.com"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"organizationName\":\"Hacked\"}"))
                .andExpect(status().isNotFound());
        assertThat(org.getOrganizationName()).isEqualTo("Renamed");
    }

    @Test
    void deleteByOwner() throws Exception {
        userEntity user = givenUser(EMAIL);
        OrganizationEntity org = TestDataFactory.organization(EMAIL);
        user.getOrganizationId().add(org.getId());
        when(organizationRepository.findById(new ObjectId(org.getId()))).thenReturn(Optional.of(org));

        mockMvc.perform(delete("/api/organization/{id}", org.getId()).header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationRepository).delete(org);
        assertThat(user.getOrganizationId()).isEmpty();
    }

    @Test
    void profilePhotoUpload() throws Exception {
        givenUser(EMAIL);
        OrganizationEntity org = TestDataFactory.organization(EMAIL);
        when(organizationRepository.findById(new ObjectId(org.getId()))).thenReturn(Optional.of(org));
        when(cloudinaryService.uploadImageToCloudinary(any(), eq("organization_profile_images")))
                .thenReturn("https://cdn/o.png");

        mockMvc.perform(multipart("/api/organization/{id}/profile-photo", org.getId())
                        .file(new MockMultipartFile("file", "o.png", "image/png", new byte[]{1}))
                        .header("Authorization", bearer(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coverPhotoUrl").value("https://cdn/o.png"));
        assertThat(org.getOrganizationProfileImageUrl()).isEqualTo("https://cdn/o.png");
    }

    @Test
    void anonymousIsRejected() throws Exception {
        mockMvc.perform(get("/api/organization/all")).andExpect(status().isUnauthorized());
    }
}
