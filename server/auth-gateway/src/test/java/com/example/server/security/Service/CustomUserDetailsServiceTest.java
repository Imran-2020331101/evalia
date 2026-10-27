package com.example.server.security.Service;

import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.UserRepository;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private CustomUserDetailsService service;

    @Test
    void returnsUserWhenFound() {
        userEntity user = TestDataFactory.user();
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        UserDetails details = service.loadUserByUsername(user.getEmail());

        assertThat(details).isSameAs(user);
    }

    @Test
    void throwsUserNotFoundWhenMissing() {
        when(userRepository.findByEmail("x@y.z")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("x@y.z"))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("Email not found");
    }
}
