package com.example.server.security.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InvalidUserCredentialsExceptionTest {

    @Test
    void keepsMessage() {
        InvalidUserCredentialsException ex = new InvalidUserCredentialsException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new InvalidUserCredentialsException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new InvalidUserCredentialsException("thrown"); })
                .isInstanceOf(InvalidUserCredentialsException.class)
                .hasMessage("thrown");
    }
}
