package com.example.server.User.repository;

import com.example.server.User.models.OrganizationEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationRepository extends MongoRepository<OrganizationEntity, ObjectId> {

    // Previously: Optional<OrganizationEntity> findByOwnerEmail(String email);
    // return a list to handle multiple organizations per user
    List<OrganizationEntity> findAllByOwnerEmail(String email);
}
