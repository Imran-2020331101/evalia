package com.example.server.exception.CustomExceptions;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DuplicateResourceExceptionTest {

    @Test
    void keepsMessage() {
        DuplicateResourceException ex = new DuplicateResourceException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new DuplicateResourceException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new DuplicateResourceException("thrown"); })
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("thrown");
    }
}
