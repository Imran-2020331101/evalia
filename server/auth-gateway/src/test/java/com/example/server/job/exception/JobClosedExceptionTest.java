package com.example.server.job.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JobClosedExceptionTest {

    @Test
    void keepsMessage() {
        JobClosedException ex = new JobClosedException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new JobClosedException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new JobClosedException("thrown"); })
                .isInstanceOf(JobClosedException.class)
                .hasMessage("thrown");
    }
}
