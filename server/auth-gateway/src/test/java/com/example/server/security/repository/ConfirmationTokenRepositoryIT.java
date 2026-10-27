package com.example.server.security.repository;

import com.example.server.security.models.ConfirmationToken;
import com.example.server.support.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/** See {@link UserRepositoryIT} for why this validates the repository proxy rather than querying a database. */
class ConfirmationTokenRepositoryIT {

    @Test
    void repositoryProxyIsCreatedAndDerivedQueriesAreValid() {
        ConfirmationTokenRepository repository = TestDataFactory.mongoRepository(ConfirmationTokenRepository.class);

        assertThat(repository).isInstanceOf(MongoRepository.class);
    }

    @Test
    void findByTokenReturnsSingleToken() throws NoSuchMethodException {
        assertThat(ConfirmationTokenRepository.class.getMethod("findByToken", String.class).getReturnType())
                .isEqualTo(ConfirmationToken.class);
    }

    @Test
    void tokenModelBehaviour() {
        ConfirmationToken fresh = new ConfirmationToken(1234, "a@b.com", LocalDateTime.now().plusMinutes(10));
        ConfirmationToken stale = new ConfirmationToken(4321, "a@b.com", LocalDateTime.now().minusSeconds(1));

        assertThat(fresh.getToken()).isEqualTo("1234");
        assertThat(fresh.isExpired()).isFalse();
        assertThat(stale.isExpired()).isTrue();
    }
}
