package com.example.server.security.repository;

import com.example.server.security.models.ConfirmationToken;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfirmationTokenRepository extends MongoRepository<ConfirmationToken, ObjectId> {
    ConfirmationToken findByConfirmationToken(String confirmationToken);
}