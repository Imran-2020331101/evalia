package com.example.server.admin.repository;

import com.example.server.admin.models.Ticket;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, ObjectId> {
}
