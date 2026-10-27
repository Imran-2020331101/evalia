package com.example.server.exception.CustomExceptions;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserNotFoundExceptionTest {

    @Test
    void keepsMessage() {
        UserNotFoundException ex = new UserNotFoundException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new UserNotFoundException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new UserNotFoundException("thrown"); })
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("thrown");
    }
}
