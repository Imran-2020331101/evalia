package com.example.server.security.repository;

import com.example.server.security.models.userEntity;
import com.example.server.support.TestDataFactory;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.lang.reflect.Method;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The project persists to MongoDB (no JPA/H2), and no embedded Mongo is available offline. This IT builds the real
 * Spring Data repository proxy without a database: Spring Data parses every derived query method at creation, so a
 * method name that cannot be translated into a Mongo query fails here. Persistence behaviour is covered with mocks
 * in the service/controller ITs.
 */
class UserRepositoryIT {

    @Test
    void repositoryProxyIsCreatedAndDerivedQueriesAreValid() {
        UserRepository repository = TestDataFactory.mongoRepository(UserRepository.class);

        assertThat(repository).isInstanceOf(MongoRepository.class);
    }

    @Test
    void declaredQueryMethodsHaveExpectedSignatures() throws NoSuchMethodException {
        Method findByEmail = UserRepository.class.getMethod("findByEmail", String.class);
        Method existsByEmail = UserRepository.class.getMethod("existsByEmail", String.class);

        assertThat(findByEmail.getReturnType()).isEqualTo(Optional.class);
        assertThat(existsByEmail.getReturnType()).isEqualTo(Boolean.class);
    }

    @Test
    void entityIdTypeIsObjectId() {
        userEntity user = TestDataFactory.user();

        assertThat(user.getId()).isInstanceOf(ObjectId.class);
    }
}
