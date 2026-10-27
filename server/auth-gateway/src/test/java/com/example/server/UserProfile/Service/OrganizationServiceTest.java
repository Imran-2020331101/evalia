package com.example.server.UserProfile.Service;

import com.example.server.UserProfile.DTO.OrganizationUpdateDTO;
import com.example.server.UserProfile.exception.OrganizationNotFoundException;
import com.example.server.UserProfile.models.OrganizationEntity;
import com.example.server.UserProfile.repository.OrganizationRepository;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.UserRepository;
import com.example.server.support.TestDataFactory;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTest {

    private static final String OWNER = "owner@example.com";

    @Mock
    private CloudinaryService cloudinaryService;
    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private UserRepository userRepository;

    private OrganizationService service;
    private OrganizationEntity org;
    private ObjectId orgObjectId;

    @BeforeEach
    void setUp() {
        service = new OrganizationService(cloudinaryService, organizationRepository, userRepository);
        org = TestDataFactory.organization(OWNER);
        orgObjectId = new ObjectId(org.getId());
    }

    // --------------------------------------------------------------- create

    @Test
    void createSavesOrganizationAndLinksItToUser() {
        userEntity user = TestDataFactory.user(OWNER, "USER");
        when(userRepository.findByEmail(OWNER)).thenReturn(Optional.of(user));
        when(organizationRepository.save(org)).thenReturn(org);

        OrganizationEntity result = service.createOrganizationProfile(org, OWNER);

        assertThat(result).isSameAs(org);
        assertThat(user.isHasAnyOrganization()).isTrue();
        assertThat(user.getOrganizationId()).containsExactly(org.getId());
        verify(userRepository).save(user);
    }

    @Test
    void createFailsForUnknownUserAndSavesNothing() {
        when(userRepository.findByEmail(OWNER)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createOrganizationProfile(org, OWNER))
                .isInstanceOf(UsernameNotFoundException.class);
        verifyNoInteractions(organizationRepository);
    }

    // ------------------------------------------------------------------ get

    @Test
    void getByIdReturnsOrganization() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));

        assertThat(service.getOrganizationById(org.getId())).isSameAs(org);
    }

    @Test
    void getByIdThrowsWhenMissing() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getOrganizationById(org.getId()))
                .isInstanceOf(OrganizationNotFoundException.class)
                .hasMessageContaining(org.getId());
    }

    @Test
    void getByIdWithMalformedIdThrowsIllegalArgument() {
        assertThatThrownBy(() -> service.getOrganizationById("not-an-object-id"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getByOwnerEmailDelegatesToRepository() {
        when(organizationRepository.findAllByOwnerEmail(OWNER)).thenReturn(List.of(org));

        assertThat(service.getOrganizationsByOwnerEmail(OWNER)).containsExactly(org);
    }

    // --------------------------------------------------------------- update

    @Test
    void updateOnlyChangesNonNullFields() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));
        when(organizationRepository.save(org)).thenReturn(org);
        OrganizationUpdateDTO dto = new OrganizationUpdateDTO();
        dto.setOrganizationName("New Name");
        dto.setWebsiteUrl("https://new.example");
        dto.setEnableDisabilityFacilities(true);
        dto.setAcceptPrivacyPolicy(false);

        OrganizationEntity result = service.updateOrganizationProfile(dto, org.getId(), OWNER);

        assertThat(result).isSameAs(org);
        assertThat(org.getOrganizationName()).isEqualTo("New Name");
        assertThat(org.getWebsiteUrl()).isEqualTo("https://new.example");
        assertThat(org.isEnableDisabilityFacilities()).isTrue();
        assertThat(org.isAcceptPrivacyPolicy()).isFalse();
        assertThat(org.getIndustryType()).isEqualTo("Software"); // untouched
        assertThat(org.getUpdatedAt()).isNotNull();
    }

    @Test
    void updateReturnsNullWhenOrganizationMissing() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.empty());

        assertThat(service.updateOrganizationProfile(new OrganizationUpdateDTO(), org.getId(), OWNER)).isNull();
        verify(organizationRepository, never()).save(any());
    }

    @Test
    void updateReturnsNullWhenCallerIsNotOwner() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));

        assertThat(service.updateOrganizationProfile(new OrganizationUpdateDTO(), org.getId(), "intruder@x.com"))
                .isNull();
        verify(organizationRepository, never()).save(any());
    }

    @Test
    void updateReturnsNullWhenSaveFails() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));
        when(organizationRepository.save(org)).thenThrow(new RuntimeException("db"));

        assertThat(service.updateOrganizationProfile(new OrganizationUpdateDTO(), org.getId(), OWNER)).isNull();
    }

    // --------------------------------------------------------------- delete

    @Test
    void deleteRemovesOrganizationAndUnlinksFromUser() {
        userEntity user = TestDataFactory.user(OWNER, "USER");
        user.getOrganizationId().add(org.getId());
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));
        when(userRepository.findByEmail(OWNER)).thenReturn(Optional.of(user));

        assertThat(service.deleteOrganization(org.getId(), OWNER)).isTrue();

        verify(organizationRepository).delete(org);
        assertThat(user.getOrganizationId()).isEmpty();
        verify(userRepository).save(user);
    }

    @Test
    void deleteStillSucceedsWhenOwnerAccountIsGone() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));
        when(userRepository.findByEmail(OWNER)).thenReturn(Optional.empty());

        assertThat(service.deleteOrganization(org.getId(), OWNER)).isTrue();
        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteReturnsFalseWhenMissing() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.empty());

        assertThat(service.deleteOrganization(org.getId(), OWNER)).isFalse();
        verify(organizationRepository, never()).delete(any());
    }

    @Test
    void deleteReturnsFalseWhenNotOwner() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));

        assertThat(service.deleteOrganization(org.getId(), "intruder@x.com")).isFalse();
        verify(organizationRepository, never()).delete(any());
    }

    @Test
    void deleteReturnsFalseWhenRepositoryFails() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));
        doThrow(new RuntimeException("db")).when(organizationRepository).delete(org);

        assertThat(service.deleteOrganization(org.getId(), OWNER)).isFalse();
    }

    // -------------------------------------------------------------- picture

    @Test
    void profilePictureIsUploadedAndStored() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", new byte[]{1});
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));
        when(cloudinaryService.uploadImageToCloudinary(file, "organization_profile_images")).thenReturn("https://cdn/o.png");

        String url = service.updateOrganizationProfilePicture(file, org.getId(), OWNER);

        assertThat(url).isEqualTo("https://cdn/o.png");
        assertThat(org.getOrganizationProfileImageUrl()).isEqualTo("https://cdn/o.png");
        verify(organizationRepository).save(org);
    }

    @Test
    void profilePictureFailsForUnknownOrganization() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateOrganizationProfilePicture(
                new MockMultipartFile("file", new byte[]{1}), org.getId(), OWNER))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void profilePictureRejectsNonOwner() {
        when(organizationRepository.findById(orgObjectId)).thenReturn(Optional.of(org));

        assertThatThrownBy(() -> service.updateOrganizationProfilePicture(
                new MockMultipartFile("file", new byte[]{1}), org.getId(), "intruder@x.com"))
                .isInstanceOf(SecurityException.class);
        verifyNoInteractions(cloudinaryService);
    }
}
