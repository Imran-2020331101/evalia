package com.example.server.job.Service;

import com.example.server.UserProfile.Service.UserService;
import com.example.server.exception.CustomExceptions.UserNotFoundException;
import com.example.server.job.DTO.ShortlistRequest;
import com.example.server.job.DTO.candidateInfo;
import com.example.server.security.models.userEntity;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private UserService userService;
    @InjectMocks
    private JobService service;

    @Test
    void mapsEveryCandidateIdToCandidateInfo() {
        userEntity a = TestDataFactory.user("a@x.com", "USER");
        a.setName("Alice");
        userEntity b = TestDataFactory.user("b@x.com", "USER");
        b.setName("Bob");
        when(userService.loadUserById("ida")).thenReturn(a);
        when(userService.loadUserById("idb")).thenReturn(b);

        List<candidateInfo> result = service.mapToCandidateInfo(new ShortlistRequest(List.of("ida", "idb")));

        assertThat(result).containsExactly(
                new candidateInfo(a.getId().toString(), "Alice", "a@x.com"),
                new candidateInfo(b.getId().toString(), "Bob", "b@x.com"));
    }

    @Test
    void emptyListGivesEmptyResult() {
        assertThat(service.mapToCandidateInfo(new ShortlistRequest(List.of()))).isEmpty();
    }

    @Test
    void unknownCandidatePropagatesNotFound() {
        when(userService.loadUserById("missing")).thenThrow(new UserNotFoundException("User not found with id: missing"));

        assertThatThrownBy(() -> service.mapToCandidateInfo(new ShortlistRequest(List.of("missing"))))
                .isInstanceOf(UserNotFoundException.class);
    }
}
