package com.example.server.security.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UnauthorizedExceptionTest {

    @Test
    void keepsMessage() {
        UnauthorizedException ex = new UnauthorizedException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new UnauthorizedException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new UnauthorizedException("thrown"); })
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("thrown");
    }
}
