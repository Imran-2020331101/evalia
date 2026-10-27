package com.example.server.UserProfile.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;
    @Mock
    private Uploader uploader;

    private CloudinaryService service;

    @BeforeEach
    void setUp() {
        service = new CloudinaryService(cloudinary);
        when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Test
    @SuppressWarnings("unchecked")
    void uploadsBytesToFolderAndReturnsSecureUrl() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", new byte[]{1, 2, 3});
        when(uploader.upload(any(), any(Map.class))).thenReturn(Map.of("secure_url", "https://cdn/a.png"));

        String url = service.uploadImageToCloudinary(file, "profile_images");

        assertThat(url).isEqualTo("https://cdn/a.png");
        ArgumentCaptor<Map> options = ArgumentCaptor.forClass(Map.class);
        verify(uploader).upload(eq(new byte[]{1, 2, 3}), options.capture());
        assertThat(options.getValue()).containsEntry("resource_type", "auto").containsEntry("folder", "profile_images");
    }

    @Test
    @SuppressWarnings("unchecked")
    void propagatesUploadFailure() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", new byte[]{1});
        when(uploader.upload(any(), any(Map.class))).thenThrow(new IOException("cloudinary down"));

        assertThatThrownBy(() -> service.uploadImageToCloudinary(file, "f"))
                .isInstanceOf(IOException.class).hasMessage("cloudinary down");
    }

    @Test
    @SuppressWarnings("unchecked")
    void missingSecureUrlCausesNullPointer() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", new byte[]{1});
        when(uploader.upload(any(), any(Map.class))).thenReturn(Map.of());

        assertThatThrownBy(() -> service.uploadImageToCloudinary(file, "f")).isInstanceOf(NullPointerException.class);
    }
}
