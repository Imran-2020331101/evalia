package com.example.server.UserProfile.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrganizationNotFoundExceptionTest {

    @Test
    void keepsMessage() {
        OrganizationNotFoundException ex = new OrganizationNotFoundException("boom");

        assertThat(ex).hasMessage("boom");
        assertThat(ex.getCause()).isNull();
    }

    @Test
    void isUncheckedException() {
        assertThat(new OrganizationNotFoundException("x")).isInstanceOf(RuntimeException.class);
    }

    @Test
    void canBeThrownAndCaught() {
        assertThatThrownBy(() -> { throw new OrganizationNotFoundException("thrown"); })
                .isInstanceOf(OrganizationNotFoundException.class)
                .hasMessage("thrown");
    }
}
