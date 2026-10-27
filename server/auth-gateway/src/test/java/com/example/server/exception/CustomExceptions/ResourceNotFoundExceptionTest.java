package com.example.server.exception.CustomExceptions;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ResourceNotFoundExceptionTest {

    @Test
    void keepsMessage() {
        ResourceNotFoundException ex = new ResourceNotFoundException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new ResourceNotFoundException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new ResourceNotFoundException("thrown"); })
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("thrown");
    }
}
