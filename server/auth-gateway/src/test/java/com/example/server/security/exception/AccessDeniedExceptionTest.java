package com.example.server.security.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AccessDeniedExceptionTest {

    @Test
    void keepsMessage() {
        AccessDeniedException ex = new AccessDeniedException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new AccessDeniedException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new AccessDeniedException("thrown"); })
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("thrown");
    }
}
