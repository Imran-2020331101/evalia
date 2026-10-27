package com.example.server.security.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TokenExpiredExceptionTest {

    @Test
    void keepsMessage() {
        TokenExpiredException ex = new TokenExpiredException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new TokenExpiredException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new TokenExpiredException("thrown"); })
                .isInstanceOf(TokenExpiredException.class)
                .hasMessage("thrown");
    }
}
