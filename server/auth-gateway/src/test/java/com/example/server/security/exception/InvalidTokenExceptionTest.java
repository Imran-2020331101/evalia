package com.example.server.security.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InvalidTokenExceptionTest {

    @Test
    void keepsMessage() {
        InvalidTokenException ex = new InvalidTokenException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new InvalidTokenException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new InvalidTokenException("thrown"); })
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("thrown");
    }
}
