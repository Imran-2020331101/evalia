package com.example.server.admin.controller;

import com.example.server.admin.models.IssueType;
import com.example.server.admin.models.Priority;
import com.example.server.admin.models.Status;
import com.example.server.admin.models.Ticket;
import com.example.server.support.AbstractIntegrationTest;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AdminControllerIT extends AbstractIntegrationTest {

    private static final String BODY = "{\"issueType\":\"ACCOUNT\",\"description\":\"cannot log in\"}";

    @Test
    void authenticatedUserCanOpenTicket() throws Exception {
        givenUser(TestDataFactory.EMAIL);

        mockMvc.perform(post("/api/admin/ticket").header("Authorization", bearer(TestDataFactory.EMAIL))
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isCreated());

        ArgumentCaptor<Ticket> captor = ArgumentCaptor.forClass(Ticket.class);
        verify(ticketRepository).save(captor.capture());
        assertThat(captor.getValue().getCreatedBy()).isEqualTo(TestDataFactory.EMAIL);
        assertThat(captor.getValue().getIssueType()).isEqualTo(IssueType.ACCOUNT);
        assertThat(captor.getValue().getStatus()).isEqualTo(Status.PENDING);
        assertThat(captor.getValue().getPriority()).isEqualTo(Priority.LOW);
    }

    @Test
    void anonymousCallerIsRejected() throws Exception {
        mockMvc.perform(post("/api/admin/ticket").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(ticketRepository);
    }
}
