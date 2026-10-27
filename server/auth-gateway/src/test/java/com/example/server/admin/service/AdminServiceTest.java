package com.example.server.admin.service;

import com.example.server.admin.models.IssueType;
import com.example.server.admin.models.Priority;
import com.example.server.admin.models.Status;
import com.example.server.admin.models.Ticket;
import com.example.server.admin.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private TicketRepository ticketRepository;
    @InjectMocks
    private AdminService service;

    private Ticket ticket() {
        return new Ticket(IssueType.BILLING, "charged twice", Status.PENDING, Priority.LOW,
                "u@x.com", "now", "now", null);
    }

    @Test
    void createTicketPersistsIt() {
        Ticket ticket = ticket();

        service.createTicket(ticket);

        verify(ticketRepository).save(ticket);
    }

    @Test
    void createTicketPropagatesRepositoryFailure() {
        Ticket ticket = ticket();
        when(ticketRepository.save(ticket)).thenThrow(new IllegalStateException("db"));

        assertThatThrownBy(() -> service.createTicket(ticket)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void ticketConstructorSetsDefaults() {
        Ticket ticket = ticket();

        assertThat(ticket.getCreatedBy()).isEqualTo("u@x.com");
        assertThat(ticket.getAssignedTo()).isNull();
        assertThat(ticket.getId()).isNull();
        assertThat(ticket.getStatus()).isEqualTo(Status.PENDING);
    }
}
