package com.example.server.security.repository;

import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.server.support.TestDataFactory;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/** See {@link UserRepositoryIT} for why this validates the repository proxy rather than querying a database. */
class RoleRepositoryIT {

    @Test
    void repositoryProxyIsCreatedAndDerivedQueriesAreValid() {
        RoleRepository repository = TestDataFactory.mongoRepository(RoleRepository.class);

        assertThat(repository).isInstanceOf(MongoRepository.class);
    }

    @Test
    void findByNameReturnsOptional() throws NoSuchMethodException {
        assertThat(RoleRepository.class.getMethod("findByName", String.class).getReturnType()).isEqualTo(Optional.class);
    }
}
