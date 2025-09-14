package com.example.server.admin.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;




@Document(collection = "tickets")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Ticket {
    @Id
    private ObjectId id;
    private IssueType issueType;
    private String description;
    private Status status;
    private Priority priority;
    private String createdBy;
    private String createdAt;
    private String updatedAt;
    private String assignedTo;

    public Ticket(IssueType issueType, String description, Status status, Priority priority, String email, String now, String now1, Object o) {
        this.issueType = issueType;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.createdBy = email;
        this.createdAt = now;
        this.updatedAt = now1;
        this.assignedTo = null;
    }
}
