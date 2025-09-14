package com.example.server.admin.service;

import com.example.server.admin.models.Ticket;
import com.example.server.admin.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
public class AdminService {
    private static final Logger logger = Logger.getLogger(AdminService.class.getName());
    private final TicketRepository ticketRepository;

    public AdminService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public void createTicket(Ticket ticket) {
        ticketRepository.save(ticket);
    }
}
