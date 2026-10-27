package com.example.server.UserProfile.repository;

import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** See UserRepositoryIT for why this validates the repository proxy rather than querying a database. */
class OrganizationRepositoryIT {

    @Test
    void repositoryProxyIsCreatedAndDerivedQueriesAreValid() {
        OrganizationRepository repository = TestDataFactory.mongoRepository(OrganizationRepository.class);

        assertThat(repository).isInstanceOf(MongoRepository.class);
    }

    @Test
    void findAllByOwnerEmailReturnsList() throws NoSuchMethodException {
        assertThat(OrganizationRepository.class.getMethod("findAllByOwnerEmail", String.class).getReturnType())
                .isEqualTo(List.class);
    }
}
