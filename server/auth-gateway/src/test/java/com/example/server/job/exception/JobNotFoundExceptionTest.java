package com.example.server.job.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JobNotFoundExceptionTest {

    @Test
    void keepsMessage() {
        JobNotFoundException ex = new JobNotFoundException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new JobNotFoundException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new JobNotFoundException("thrown"); })
                .isInstanceOf(JobNotFoundException.class)
                .hasMessage("thrown");
    }
}
