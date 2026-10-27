package com.example.server.admin.controller;

import com.example.server.admin.models.IssueType;
import com.example.server.admin.models.Priority;
import com.example.server.admin.models.Status;
import com.example.server.admin.models.Ticket;
import com.example.server.admin.service.AdminService;
import com.example.server.exception.handler.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AdminService adminService;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new AdminController(adminService))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void createsPendingLowPriorityTicketForCaller() throws Exception {
        Principal principal = () -> "u@x.com";

        mvc.perform(post("/api/admin/ticket").principal(principal).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"issueType\":\"BILLING\",\"description\":\"charged twice\"}"))
                .andExpect(status().isCreated());

        ArgumentCaptor<Ticket> captor = ArgumentCaptor.forClass(Ticket.class);
        verify(adminService).createTicket(captor.capture());
        Ticket ticket = captor.getValue();
        assertThat(ticket.getIssueType()).isEqualTo(IssueType.BILLING);
        assertThat(ticket.getDescription()).isEqualTo("charged twice");
        assertThat(ticket.getStatus()).isEqualTo(Status.PENDING);
        assertThat(ticket.getPriority()).isEqualTo(Priority.LOW);
        assertThat(ticket.getCreatedBy()).isEqualTo("u@x.com");
        assertThat(ticket.getCreatedAt()).isNotBlank().isEqualTo(ticket.getUpdatedAt());
        assertThat(ticket.getAssignedTo()).isNull();
    }

    @Test
    void unknownIssueTypeIsReportedAs500BecauseCatchAllHandlerSwallowsBadJson() throws Exception {
        // Finding: malformed/unreadable request bodies should be 400, but GlobalExceptionHandler's catch-all
        // turns HttpMessageNotReadableException into 500.
        mvc.perform(post("/api/admin/ticket").principal(() -> "u@x.com").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"issueType\":\"NOPE\",\"description\":\"d\"}"))
                .andExpect(status().isInternalServerError());
        verifyNoInteractions(adminService);
    }

    @Test
    void serviceFailureIsMappedTo500() throws Exception {
        doThrow(new IllegalStateException("db")).when(adminService).createTicket(any());

        mvc.perform(post("/api/admin/ticket").principal(() -> "u@x.com").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"issueType\":\"OTHER\",\"description\":\"d\"}"))
                .andExpect(status().isInternalServerError());
    }
}
