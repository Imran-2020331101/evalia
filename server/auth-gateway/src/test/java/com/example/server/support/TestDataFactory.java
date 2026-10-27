package com.example.server.support;

import com.example.server.UserProfile.models.OrganizationEntity;
import com.example.server.security.models.Role;
import com.example.server.security.models.userEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.repository.support.MongoRepositoryFactory;

import java.util.ArrayList;
import java.util.List;

/** Builders for entities used across tests. */
public final class TestDataFactory {

    public static final String EMAIL = "jane@example.com";

    private TestDataFactory() {
    }

    public static Role role(String name) {
        Role role = new Role();
        role.setId(new ObjectId());
        role.setName(name);
        return role;
    }

    /** A verified user with the given role names. */
    public static userEntity user(String email, String... roleNames) {
        userEntity user = new userEntity();
        user.setId(new ObjectId());
        user.setName("Jane Doe");
        user.setEmail(email);
        user.setPassword("encoded-password");
        List<Role> roles = new ArrayList<>();
        for (String roleName : roleNames) {
            roles.add(role(roleName));
        }
        user.setRoles(roles);
        user.setEmailVerified(true);
        return user;
    }

    public static userEntity user() {
        return user(EMAIL, "USER");
    }

    public static OrganizationEntity organization(String ownerEmail) {
        OrganizationEntity org = new OrganizationEntity();
        org.setId(new ObjectId().toHexString());
        org.setOwnerEmail(ownerEmail);
        org.setOrganizationName("Acme");
        org.setYearOfEstablishment("2000");
        org.setNumberOfEmployees("50");
        org.setOrganizationAddress("Dhaka");
        org.setIndustryType("Software");
        org.setBusinessDescription("We build things");
        org.setAcceptPrivacyPolicy(true);
        return org;
    }

    /**
     * Builds a real Spring Data Mongo repository proxy WITHOUT contacting a database
     * (the Mongo client is created lazily and never used). Creating the proxy makes Spring Data
     * parse every derived query method, so an invalid method name fails here.
     */
    public static <T> T mongoRepository(Class<T> repositoryType) {
        MongoTemplate template = new MongoTemplate(
                new SimpleMongoClientDatabaseFactory("mongodb://localhost:1/unused-test-db"));
        return new MongoRepositoryFactory(template).getRepository(repositoryType);
    }
}
