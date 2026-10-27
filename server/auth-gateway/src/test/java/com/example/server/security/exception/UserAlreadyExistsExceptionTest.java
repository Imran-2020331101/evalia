package com.example.server.security.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserAlreadyExistsExceptionTest {

    @Test
    void keepsMessage() {
        UserAlreadyExistsException ex = new UserAlreadyExistsException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new UserAlreadyExistsException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new UserAlreadyExistsException("thrown"); })
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("thrown");
    }
}
