package com.example.server.admin.controller;

import com.example.server.admin.dto.TicketDTO;
import com.example.server.admin.models.Priority;
import com.example.server.admin.models.Status;
import com.example.server.admin.models.Ticket;
import com.example.server.admin.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.logging.Logger;

@CrossOrigin
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final Logger  logger = Logger.getLogger(AdminController.class.getName());
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/ticket")
    public ResponseEntity<?> addTicket(@RequestBody TicketDTO ticket, Principal principal) {
        String now = Instant.now().toString();
        adminService.createTicket(new Ticket(
                ticket.getIssueType(),
                ticket.getDescription(),
                Status.PENDING,
                Priority.LOW,
                principal.getName(),
                now,
                now,
                null
        ));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

}
