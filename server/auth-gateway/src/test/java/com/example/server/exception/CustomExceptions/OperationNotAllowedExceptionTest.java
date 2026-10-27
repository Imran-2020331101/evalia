package com.example.server.exception.CustomExceptions;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OperationNotAllowedExceptionTest {

    @Test
    void keepsMessage() {
        OperationNotAllowedException ex = new OperationNotAllowedException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new OperationNotAllowedException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new OperationNotAllowedException("thrown"); })
                .isInstanceOf(OperationNotAllowedException.class)
                .hasMessage("thrown");
    }
}
