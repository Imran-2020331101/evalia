package com.example.server.exception.CustomExceptions;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/** All custom exceptions share the same contract: unchecked, carry a message, no cause. */
class CustomExceptionsTest {

    @Test
    void allCustomExceptionsAreRuntimeExceptionsWithMessage() {
        RuntimeException[] all = {
                new DuplicateResourceException("m"),
                new InvalidRequestException("m"),
                new OperationNotAllowedException("m"),
                new ResourceNotFoundException("m"),
                new UserNotFoundException("m")
        };
        for (RuntimeException ex : all) {
            assertThat(ex).hasMessage("m").hasNoCause();
        }
    }

    @Test
    void exceptionTypesAreDistinct() {
        assertThat(new UserNotFoundException("m")).isNotInstanceOf(ResourceNotFoundException.class);
        assertThat(new DuplicateResourceException("m")).isNotInstanceOf(InvalidRequestException.class);
    }
}
