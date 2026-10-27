package com.example.server.job.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InvalidJobStatusExceptionTest {

    @Test
    void keepsMessage() {
        InvalidJobStatusException ex = new InvalidJobStatusException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new InvalidJobStatusException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new InvalidJobStatusException("thrown"); })
                .isInstanceOf(InvalidJobStatusException.class)
                .hasMessage("thrown");
    }
}
