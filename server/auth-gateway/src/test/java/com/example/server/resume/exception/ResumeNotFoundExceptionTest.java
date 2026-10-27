package com.example.server.resume.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ResumeNotFoundExceptionTest {

    @Test
    void keepsMessage() {
        ResumeNotFoundException ex = new ResumeNotFoundException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new ResumeNotFoundException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new ResumeNotFoundException("thrown"); })
                .isInstanceOf(ResumeNotFoundException.class)
                .hasMessage("thrown");
    }
}
