package com.example.server.admin.dto;

import com.example.server.admin.models.IssueType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketDTO {
    private IssueType issueType;
    private String description;
}
