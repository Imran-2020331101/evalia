package com.example.server.exception.CustomExceptions;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InvalidRequestExceptionTest {

    @Test
    void keepsMessage() {
        InvalidRequestException ex = new InvalidRequestException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new InvalidRequestException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new InvalidRequestException("thrown"); })
                .isInstanceOf(InvalidRequestException.class)
                .hasMessage("thrown");
    }
}
