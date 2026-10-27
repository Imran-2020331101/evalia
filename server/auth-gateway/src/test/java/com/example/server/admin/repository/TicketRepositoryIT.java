package com.example.server.admin.repository;

import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.repository.MongoRepository;

import static org.assertj.core.api.Assertions.assertThat;

/** See UserRepositoryIT for why this validates the repository proxy rather than querying a database. */
class TicketRepositoryIT {

    @Test
    void repositoryProxyIsCreated() {
        TicketRepository repository = TestDataFactory.mongoRepository(TicketRepository.class);

        assertThat(repository).isInstanceOf(MongoRepository.class);
    }
}
