package com.example.server.UserProfile.Controller;

import com.example.server.UserProfile.DTO.OrganizationUpdateDTO;
import com.example.server.UserProfile.exception.OrganizationNotFoundException;
import com.example.server.UserProfile.models.OrganizationEntity;
import com.example.server.UserProfile.Service.OrganizationService;
import com.example.server.exception.handler.GlobalExceptionHandler;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OrganizationControllerTest {

    private static final String OWNER = "owner@example.com";
    private static final Principal PRINCIPAL = () -> OWNER;

    @Mock
    private OrganizationService organizationService;

    private MockMvc mvc;
    private OrganizationEntity org;

    @BeforeEach
    void setUp() {
        OrganizationController controller = new OrganizationController(organizationService, new ModelMapper());
        mvc = MockMvcBuilders.standaloneSetup(controller).setControllerAdvice(new GlobalExceptionHandler()).build();
        org = TestDataFactory.organization(OWNER);
    }

    @Test
    void getByIdReturnsOrganization() throws Exception {
        when(organizationService.getOrganizationById(org.getId())).thenReturn(org);

        mvc.perform(get("/api/organization/{id}", org.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationName").value("Acme"))
                .andExpect(jsonPath("$.ownerEmail").value(OWNER));
    }

    @Test
    void getByIdNotFoundFallsThroughToGeneric500() throws Exception {
        // OrganizationNotFoundException has no @ExceptionHandler, so clients get a 500 instead of a 404.
        when(organizationService.getOrganizationById("x")).thenThrow(new OrganizationNotFoundException("missing"));

        mvc.perform(get("/api/organization/x"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Unexpected error occurred"));
    }

    @Test
    void getAllReturnsOwnedOrganizationsWithCount() throws Exception {
        when(organizationService.getOrganizationsByOwnerEmail(OWNER)).thenReturn(List.of(org));

        mvc.perform(get("/api/organization/all").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.count").value(1))
                .andExpect(jsonPath("$.data[0].organizationName").value("Acme"));
    }

    @Test
    void getAllReports500WhenServiceFails() throws Exception {
        when(organizationService.getOrganizationsByOwnerEmail(OWNER)).thenThrow(new RuntimeException("db"));

        mvc.perform(get("/api/organization/all").principal(PRINCIPAL))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").value("Failed to retrieve organizations: db"));
    }

    @Test
    void createMapsRequestToEntityAndStampsOwner() throws Exception {
        when(organizationService.createOrganizationProfile(any(OrganizationEntity.class), eq(OWNER))).thenReturn(org);

        mvc.perform(post("/api/organization/new").principal(PRINCIPAL).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"organizationName\":\"Acme\",\"yearOfEstablishment\":\"2000\","
                                + "\"organizationAddress\":\"Dhaka\",\"industryType\":\"Software\","
                                + "\"businessDescription\":\"desc\",\"acceptPrivacyPolicy\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationName").value("Acme"));

        ArgumentCaptor<OrganizationEntity> captor = ArgumentCaptor.forClass(OrganizationEntity.class);
        verify(organizationService).createOrganizationProfile(captor.capture(), eq(OWNER));
        OrganizationEntity sent = captor.getValue();
        assertThat(sent.getOwnerEmail()).isEqualTo(OWNER);
        assertThat(sent.getOrganizationName()).isEqualTo("Acme");
        assertThat(sent.isAcceptPrivacyPolicy()).isTrue();
        assertThat(sent.getCreatedAt()).isNotNull();
        assertThat(sent.getUpdatedAt()).isNotNull();
    }

    @Test
    void createReports500WhenServiceFails() throws Exception {
        when(organizationService.createOrganizationProfile(any(), any())).thenThrow(new RuntimeException("boom"));

        mvc.perform(post("/api/organization/new").principal(PRINCIPAL).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"organizationName\":\"Acme\"}"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Failed to create organization profile: boom"));
    }

    @Test
    void updateReturnsUpdatedOrganization() throws Exception {
        when(organizationService.updateOrganizationProfile(any(OrganizationUpdateDTO.class), eq(org.getId()), eq(OWNER)))
                .thenReturn(org);

        mvc.perform(patch("/api/organization/{id}", org.getId()).principal(PRINCIPAL)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"organizationName\":\"New\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.organizationName").value("Acme"));
    }

    @Test
    void updateReturns404WhenServiceReturnsNull() throws Exception {
        when(organizationService.updateOrganizationProfile(any(), any(), any())).thenReturn(null);

        mvc.perform(patch("/api/organization/abc").principal(PRINCIPAL)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Organization not found or you are not authorized to update it."));
    }

    @Test
    void deleteSuccess() throws Exception {
        when(organizationService.deleteOrganization("abc", OWNER)).thenReturn(true);

        mvc.perform(delete("/api/organization/abc").principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("Organization deleted successfully"));
    }

    @Test
    void deleteNotFoundOrNotOwner() throws Exception {
        when(organizationService.deleteOrganization("abc", OWNER)).thenReturn(false);

        mvc.perform(delete("/api/organization/abc").principal(PRINCIPAL))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void deleteReports500OnUnexpectedError() throws Exception {
        when(organizationService.deleteOrganization("abc", OWNER)).thenThrow(new IllegalArgumentException("bad id"));

        mvc.perform(delete("/api/organization/abc").principal(PRINCIPAL))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Failed to delete organization: bad id"));
    }

    @Test
    void profilePhotoUploadReturnsUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", new byte[]{1});
        when(organizationService.updateOrganizationProfilePicture(any(), eq("abc"), eq(OWNER))).thenReturn("https://cdn/o.png");

        mvc.perform(multipart("/api/organization/abc/profile-photo").file(file).principal(PRINCIPAL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.coverPhotoUrl").value("https://cdn/o.png"));
    }

    @Test
    void profilePhotoUploadIoErrorIs500() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", new byte[]{1});
        when(organizationService.updateOrganizationProfilePicture(any(), any(), any())).thenThrow(new IOException("io"));

        mvc.perform(multipart("/api/organization/abc/profile-photo").file(file).principal(PRINCIPAL))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("io"));
    }
}
